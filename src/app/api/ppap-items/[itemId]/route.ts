import { requireUser, writeAudit } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
const schema=z.object({status:z.enum(["NOT_STARTED","IN_PROGRESS","IN_REVIEW","APPROVED","BLOCKED","NOT_APPLICABLE"]),notes:z.string().max(2000).optional(),documentId:z.string().uuid().nullable().optional()});
export async function PATCH(request:Request,{params}:{params:Promise<{itemId:string}>}) {
 const auth=await requireUser(["ADMIN","APQP_MANAGER","QUALITY_ENGINEER","ENGINEER"]);if(auth.response)return auth.response;const {itemId}=await params;
 try {const b=schema.parse(await request.json());const old=await query("SELECT i.* FROM ppap_items i WHERE i.id=$1",[itemId]);if(!old.rowCount)return Response.json({error:"PPAP item not found"},{status:404});
 const r=await query("UPDATE ppap_items SET status=$2,notes=COALESCE($3,notes),document_id=CASE WHEN $4 THEN $5::uuid ELSE document_id END WHERE id=$1 RETURNING *",[itemId,b.status,b.notes??null,b.documentId!==undefined,b.documentId??null]);
 await writeAudit(auth.user!.id,null,"PPAP_ITEM",itemId,"UPDATE",old.rows[0],r.rows[0]);return Response.json({item:r.rows[0]});
 }catch(e){if(e instanceof z.ZodError)return Response.json({error:"Invalid PPAP item update"},{status:400});return Response.json({error:"Could not update PPAP item"},{status:503});}
}
