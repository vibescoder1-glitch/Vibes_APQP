import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER"]);if(auth.response)return auth.response;const {id}=await params;
 try {const r=await query("SELECT a.id,a.entity_type,a.entity_id,a.action,a.before_data,a.after_data,a.created_at,u.full_name AS actor_name FROM audit_events a LEFT JOIN app_users u ON u.id=a.actor_id WHERE a.project_id=$1 ORDER BY a.created_at DESC LIMIT 500",[id]);return Response.json({events:r.rows});}
 catch{return Response.json({error:"Could not load audit history"},{status:503});}
}
