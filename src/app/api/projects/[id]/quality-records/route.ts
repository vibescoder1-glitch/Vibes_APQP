import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser();if(auth.response)return auth.response;const {id}=await params;
 try {const r=await query("SELECT id,project_id,record_type,record_code,title,revision,status,payload,created_at,updated_at,approved_at FROM quality_records WHERE project_id=$1 ORDER BY record_type,record_code,revision DESC",[id]);return Response.json({records:r.rows});}
 catch{return Response.json({error:"Could not load quality records"},{status:503});}
}
const schema=z.object({recordType:z.enum(["FEASIBILITY","PROCESS_FLOW","DFMEA","PFMEA","CONTROL_PLAN","MSA","SPC","INSPECTION","CHANGE_REQUEST"]),recordCode:z.string().trim().min(2).max(50),title:z.string().trim().min(3).max(200),payload:z.record(z.string(),z.unknown()).default({})});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER","ENGINEER"]);if(auth.response)return auth.response;const {id}=await params;
 try {const b=schema.parse(await request.json());const latest=await query<{revision:number}>("SELECT max(revision)::int AS revision FROM quality_records WHERE project_id=$1 AND record_type=$2 AND record_code=$3",[id,b.recordType,b.recordCode]);const revision=(latest.rows[0]?.revision??0)+1;
 const r=await query("INSERT INTO quality_records(project_id,record_type,record_code,title,revision,payload,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,record_type,record_code,title,revision,status,payload,created_at",[id,b.recordType,b.recordCode,b.title,revision,JSON.stringify(b.payload),auth.user!.id]);
 await writeAudit(auth.user!.id,id,"QUALITY_RECORD",r.rows[0].id,"CREATE_REVISION",null,r.rows[0]);return Response.json({record:r.rows[0]},{status:201});
 }catch(e){if(e instanceof z.ZodError)return Response.json({error:"Invalid quality record",details:e.flatten()},{status:400});return Response.json({error:"Could not save quality record"},{status:503});}
}
