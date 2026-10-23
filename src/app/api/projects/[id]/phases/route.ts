import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser();if(auth.response)return auth.response;const {id}=await params;
 try {const r=await query("SELECT p.id,p.phase_number,p.name,p.gate_status,p.planned_start,p.planned_finish,p.approved_at,u.full_name AS approved_by,count(d.id)::int AS deliverable_count,count(d.id) FILTER(WHERE d.status='APPROVED' OR d.status='NOT_APPLICABLE')::int AS complete_count,count(d.id) FILTER(WHERE d.mandatory AND d.status NOT IN ('APPROVED','NOT_APPLICABLE'))::int AS mandatory_open FROM apqp_phases p LEFT JOIN deliverables d ON d.phase_id=p.id LEFT JOIN app_users u ON u.id=p.approved_by WHERE p.project_id=$1 GROUP BY p.id,u.full_name ORDER BY p.phase_number",[id]);return Response.json({phases:r.rows.map(p=>({...p,completionPercent:p.deliverable_count?Math.round(p.complete_count/p.deliverable_count*100):0,readyForGate:p.mandatory_open===0}))});}
 catch{return Response.json({error:"Could not load phase readiness"},{status:503});}
}
const schema=z.object({gateStatus:z.enum(["OPEN","READY_FOR_REVIEW","APPROVED","REJECTED"]),plannedStart:z.string().date().nullable().optional(),plannedFinish:z.string().date().nullable().optional()});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER"]);if(auth.response)return auth.response;const {id}=await params;
 try {const b=schema.parse(await request.json());const old=await query("SELECT * FROM apqp_phases WHERE id=$1 AND project_id=$2",[new URL(request.url).searchParams.get("phaseId"),id]);if(!old.rowCount)return Response.json({error:"Phase not found. Pass phaseId query parameter."},{status:404});
 if(b.gateStatus==="APPROVED"){const readiness=await query("SELECT count(*)::int n FROM deliverables WHERE phase_id=$1 AND mandatory AND status NOT IN ('APPROVED','NOT_APPLICABLE')",[old.rows[0].id]);if(readiness.rows[0].n>0)return Response.json({error:"Gate cannot be approved while mandatory deliverables remain open",openMandatory:readiness.rows[0].n},{status:409});}
 const r=await query("UPDATE apqp_phases SET gate_status=$2,planned_start=CASE WHEN $3 THEN $4::date ELSE planned_start END,planned_finish=CASE WHEN $5 THEN $6::date ELSE planned_finish END,approved_by=CASE WHEN $2='APPROVED' THEN $7 ELSE NULL END,approved_at=CASE WHEN $2='APPROVED' THEN now() ELSE NULL END WHERE id=$1 RETURNING *",[old.rows[0].id,b.gateStatus,b.plannedStart!==undefined,b.plannedStart??null,b.plannedFinish!==undefined,b.plannedFinish??null,auth.user!.id]);
 await writeAudit(auth.user!.id,id,"PHASE",old.rows[0].id,"GATE_"+b.gateStatus,old.rows[0],r.rows[0]);return Response.json({phase:r.rows[0]});
 }catch(e){if(e instanceof z.ZodError)return Response.json({error:"Invalid phase update"},{status:400});return Response.json({error:"Could not update phase"},{status:503});}
}
