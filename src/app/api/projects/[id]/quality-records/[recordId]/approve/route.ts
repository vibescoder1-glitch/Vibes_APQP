import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
export async function POST(_request:Request,{params}:{params:Promise<{id:string;recordId:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER"]);if(auth.response)return auth.response;const {id,recordId}=await params;
 try {const old=await query("SELECT * FROM quality_records WHERE id=$1 AND project_id=$2",[recordId,id]);if(!old.rowCount)return Response.json({error:"Record not found"},{status:404});
 const r=await query("UPDATE quality_records SET status='APPROVED',approved_by=$3,approved_at=now(),updated_at=now() WHERE id=$1 AND project_id=$2 RETURNING id,status,approved_by,approved_at,revision",[recordId,id,auth.user!.id]);
 await writeAudit(auth.user!.id,id,"QUALITY_RECORD",recordId,"APPROVE",old.rows[0],r.rows[0]);return Response.json({record:r.rows[0]});
 }catch{return Response.json({error:"Could not approve record"},{status:503});}
}
