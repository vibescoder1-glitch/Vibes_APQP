import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser();if(auth.response)return auth.response;const {id}=await params;
 try {const r=await query("SELECT d.*,p.phase_number,p.name AS phase_name,u.full_name AS owner_name FROM deliverables d JOIN apqp_phases p ON p.id=d.phase_id LEFT JOIN app_users u ON u.id=d.owner_id WHERE d.project_id=$1 ORDER BY p.phase_number,d.due_date NULLS LAST,d.code",[id]);return Response.json({deliverables:r.rows});}
 catch{return Response.json({error:"Could not load deliverables"},{status:503});}
}
const schema=z.object({phaseNumber:z.number().int().min(1).max(5),code:z.string().trim().min(2).max(40),title:z.string().trim().min(3).max(200),description:z.string().max(3000).optional(),ownerId:z.string().uuid().nullable().optional(),dueDate:z.string().date().nullable().optional(),mandatory:z.boolean().default(true),evidenceRequired:z.boolean().default(false)});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER"]);if(auth.response)return auth.response;const {id}=await params;
 try {const b=schema.parse(await request.json());const phase=await query<{id:string}>("SELECT id FROM apqp_phases WHERE project_id=$1 AND phase_number=$2",[id,b.phaseNumber]);if(!phase.rowCount)return Response.json({error:"Project phase not found"},{status:404});
 const r=await query("INSERT INTO deliverables(project_id,phase_id,code,title,description,owner_id,due_date,mandatory,evidence_required,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",[id,phase.rows[0].id,b.code,b.title,b.description??null,b.ownerId??auth.user!.id,b.dueDate??null,b.mandatory,b.evidenceRequired,auth.user!.id]);
 await writeAudit(auth.user!.id,id,"DELIVERABLE",r.rows[0].id,"CREATE",null,r.rows[0]);return Response.json({deliverable:r.rows[0]},{status:201});
 } catch(e){if(e instanceof z.ZodError)return Response.json({error:"Invalid deliverable data"},{status:400});return Response.json({error:"Could not create deliverable; check duplicate code"},{status:409});}
}
