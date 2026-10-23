import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
const schema=z.object({name:z.string().trim().min(2).max(180).optional(),status:z.enum(["ON_TRACK","AT_RISK","DELAYED","COMPLETED","ON_HOLD"]).optional(),targetDate:z.string().date().nullable().optional(),ownerId:z.string().uuid().nullable().optional(),currentPhase:z.number().int().min(1).max(5).optional(),description:z.string().max(4000).optional(),archived:z.boolean().optional()}).refine(v=>Object.keys(v).length>0);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER"]); if(auth.response)return auth.response;
 const {id}=await params; if(!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:"Invalid project id"},{status:400});
 try {
  const b=schema.parse(await request.json());
  const old=await query("SELECT * FROM apqp_projects WHERE id=$1 AND archived_at IS NULL",[id]); if(!old.rowCount)return Response.json({error:"Project not found"},{status:404});
  const r=await query(`UPDATE apqp_projects SET name=COALESCE($2,name),status=COALESCE($3::project_status,status),
  target_date=CASE WHEN $4 THEN $5::date ELSE target_date END,owner_id=CASE WHEN $6 THEN $7::uuid ELSE owner_id END,
  current_phase=COALESCE($8,current_phase),description=COALESCE($9,description),
  archived_at=CASE WHEN $10 THEN now() ELSE archived_at END,updated_at=now() WHERE id=$1 RETURNING id,project_code,name,status,target_date,current_phase,archived_at`,
  [id,b.name??null,b.status??null,b.targetDate!==undefined,b.targetDate??null,b.ownerId!==undefined,b.ownerId??null,b.currentPhase??null,b.description??null,b.archived??false]);
  await writeAudit(auth.user!.id,id,"PROJECT",id,b.archived?"ARCHIVE":"UPDATE",old.rows[0],r.rows[0]);
  return Response.json({project:r.rows[0]});
 } catch(e) {if(e instanceof z.ZodError)return Response.json({error:"Invalid update data"},{status:400});return Response.json({error:"Could not update project"},{status:503});}
}
