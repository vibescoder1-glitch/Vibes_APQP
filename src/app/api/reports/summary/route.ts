import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
 const auth=await requireUser(); if(auth.response)return auth.response;
 try {
  const a=await query("SELECT count(*)::int total,count(*) FILTER(WHERE status='ON_TRACK')::int on_track,count(*) FILTER(WHERE status='AT_RISK')::int at_risk,count(*) FILTER(WHERE status='DELAYED')::int delayed,count(*) FILTER(WHERE status='COMPLETED')::int completed FROM apqp_projects WHERE archived_at IS NULL");
  const b=await query("SELECT phase_number,name,count(d.id)::int total,count(d.id) FILTER(WHERE d.status='APPROVED')::int approved FROM apqp_phases p LEFT JOIN deliverables d ON d.phase_id=p.id JOIN apqp_projects pr ON pr.id=p.project_id AND pr.archived_at IS NULL GROUP BY phase_number,name ORDER BY phase_number");
  const c=await query("SELECT d.title,d.due_date,d.status,p.project_code,p.name project_name FROM deliverables d JOIN apqp_projects p ON p.id=d.project_id WHERE p.archived_at IS NULL AND d.mandatory AND d.status NOT IN ('APPROVED','NOT_APPLICABLE') AND d.due_date < current_date ORDER BY d.due_date LIMIT 100");
  const d=await query("SELECT s.id,s.submission_number,s.status,count(i.id)::int item_count,count(i.id) FILTER(WHERE i.status IN ('APPROVED','NOT_APPLICABLE'))::int ready_count FROM ppap_submissions s LEFT JOIN ppap_items i ON i.submission_id=s.id GROUP BY s.id ORDER BY s.created_at DESC LIMIT 50");
  return Response.json({projects:a.rows[0],phases:b.rows,overdueDeliverables:c.rows,ppap:d.rows,generatedAt:new Date().toISOString()});
 } catch { return Response.json({error:"Could not calculate report data. Apply db/schema.sql first."},{status:503}); }
}
