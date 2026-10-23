import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
export const dynamic = "force-dynamic";
const createSchema = z.object({
 projectCode:z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/),
 name:z.string().trim().min(2).max(180),
 customerId:z.string().uuid().nullable().optional(),
 componentId:z.string().uuid().nullable().optional(),
 plantId:z.string().uuid().nullable().optional(),
 ownerId:z.string().uuid().nullable().optional(),
 targetDate:z.string().date().nullable().optional(),
 startDate:z.string().date().nullable().optional(),
 description:z.string().max(4000).optional(),
 status:z.enum(["ON_TRACK","AT_RISK","DELAYED","COMPLETED","ON_HOLD"]).optional()
});
export async function GET(request:Request) {
 const auth=await requireUser(); if(auth.response)return auth.response;
 const {searchParams}=new URL(request.url);
 const status=searchParams.get("status");
 const q=searchParams.get("q")?.slice(0,100);
 try {
  const result=await query(`SELECT p.id,p.project_code,p.name,p.status,p.target_date,p.start_date,p.current_phase,p.description,p.created_at,p.updated_at,
   c.name AS customer_name,c.id AS customer_id,co.part_number,co.name AS component_name,pl.name AS plant_name,pl.id AS plant_id,u.full_name AS owner_name,u.id AS owner_id,
   (SELECT count(*)::int FROM deliverables d WHERE d.project_id=p.id AND d.status='APPROVED') AS approved_deliverables,
   (SELECT count(*)::int FROM deliverables d WHERE d.project_id=p.id AND d.mandatory=true AND d.status NOT IN ('APPROVED','NOT_APPLICABLE')) AS open_mandatory_deliverables
   FROM apqp_projects p LEFT JOIN customers c ON c.id=p.customer_id LEFT JOIN components co ON co.id=p.component_id
   LEFT JOIN plants pl ON pl.id=p.plant_id LEFT JOIN app_users u ON u.id=p.owner_id
   WHERE p.archived_at IS NULL AND ($1::text IS NULL OR p.status::text=$1) AND ($2::text IS NULL OR (p.name ILIKE '%'||$2||'%' OR p.project_code ILIKE '%'||$2||'%' OR c.name ILIKE '%'||$2||'%'))
   ORDER BY p.updated_at DESC LIMIT 250`,[status,q]);
  return Response.json({projects:result.rows});
 } catch { return Response.json({error:"Could not load projects. Check database setup."},{status:503}); }
}
export async function POST(request:Request) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER"]); if(auth.response)return auth.response;
 try {
  const b=createSchema.parse(await request.json());
  const result=await query<{id:string;project_code:string}>(`INSERT INTO apqp_projects(project_code,name,customer_id,component_id,plant_id,owner_id,target_date,start_date,description,status,created_by)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,project_code`,
  [b.projectCode,b.name,b.customerId??null,b.componentId??null,b.plantId??null,b.ownerId??auth.user!.id,b.targetDate??null,b.startDate??null,b.description??null,b.status??"ON_TRACK",auth.user!.id]);
  const project=result.rows[0];
  const phases=[["Planning & Program Definition",1],["Product Design & Development",2],["Process Design & Development",3],["Product & Process Validation",4],["Launch, Assessment & Improvement",5]] as const;
  for(const [name,num] of phases) {
   const p=await query<{id:string}>("INSERT INTO apqp_phases(project_id,phase_number,name) VALUES($1,$2,$3) RETURNING id",[project.id,num,name]);
   const defaultItems:Record<number,string[]>={1:["Customer requirements","Program timing plan","Feasibility review"],2:["Design FMEA (DFMEA)","Engineering drawings and specifications","Design verification plan"],3:["Process flow diagram","Process FMEA (PFMEA)","Control Plan","Work instructions"],4:["Measurement system analysis (MSA)","Process capability study (SPC)","Dimensional and material results","PPAP package"],5:["Production trial","Lessons learned and handover"]};
   for(const [idx,title] of defaultItems[num].entries()) await query("INSERT INTO deliverables(project_id,phase_id,code,title,mandatory,created_by) VALUES($1,$2,$3,$4,true,$5)",[project.id,p.rows[0].id,`P${num}-${String(idx+1).padStart(2,"0")}`,title,auth.user!.id]);
  }
  await writeAudit(auth.user!.id,project.id,"PROJECT",project.id,"CREATE",null,{projectCode:b.projectCode,name:b.name});
  return Response.json({project},{status:201});
 } catch(e) {
  if(e instanceof z.ZodError)return Response.json({error:"Invalid project data",details:e.flatten()},{status:400});
  return Response.json({error:"Project could not be created. Check duplicate project code and database setup."},{status:409});
 }
}
