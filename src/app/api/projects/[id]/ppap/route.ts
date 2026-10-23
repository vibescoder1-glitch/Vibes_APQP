import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
const items=["Design records","Engineering change documents","Customer engineering approval","Design FMEA","Process flow diagram","Process FMEA","Control Plan","Measurement system analysis","Dimensional results","Material and performance test results","Initial process studies","Qualified laboratory documentation","Appearance approval report","Sample production parts","Master sample","Checking aids","Customer-specific requirements","Part Submission Warrant"];
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser();if(auth.response)return auth.response;const {id}=await params;
 try {const s=await query("SELECT * FROM ppap_submissions WHERE project_id=$1 ORDER BY created_at DESC",[id]);const result=[];for(const sub of s.rows){const r=await query("SELECT * FROM ppap_items WHERE submission_id=$1 ORDER BY item_number",[sub.id]);result.push({...sub,items:r.rows});}return Response.json({submissions:result});}
 catch{return Response.json({error:"Could not load PPAP submissions"},{status:503});}
}
const schema=z.object({submissionNumber:z.string().trim().min(2).max(50),submissionLevel:z.number().int().min(1).max(5),reason:z.string().trim().min(3).max(500)});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER"]);if(auth.response)return auth.response;const {id}=await params;
 try {const b=schema.parse(await request.json());const s=await query("INSERT INTO ppap_submissions(project_id,submission_number,submission_level,reason,created_by) VALUES($1,$2,$3,$4,$5) RETURNING *",[id,b.submissionNumber,b.submissionLevel,b.reason,auth.user!.id]);for(let i=0;i<items.length;i++)await query("INSERT INTO ppap_items(submission_id,item_number,title,required) VALUES($1,$2,$3,true)",[s.rows[0].id,i+1,items[i]]);
 await writeAudit(auth.user!.id,id,"PPAP_SUBMISSION",s.rows[0].id,"CREATE",null,s.rows[0]);return Response.json({submission:{...s.rows[0],items:items.map((title,i)=>({item_number:i+1,title,status:"NOT_STARTED"}))}},{status:201});
 }catch(e){if(e instanceof z.ZodError)return Response.json({error:"Invalid PPAP submission details"},{status:400});return Response.json({error:"Could not create PPAP submission; check submission number uniqueness"},{status:409});}
}
