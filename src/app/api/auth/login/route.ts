import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";
const schema = z.object({ email:z.string().email().max(254), password:z.string().min(1).max(200) });
const attempts = new Map<string,{count:number;start:number}>();
export async function POST(request:Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now(), prior = attempts.get(ip);
  if (prior && now-prior.start < 10*60*1000 && prior.count >= 10) return Response.json({error:"Too many login attempts. Try again later."},{status:429});
  if (!prior || now-prior.start >= 10*60*1000) attempts.set(ip,{count:1,start:now}); else attempts.set(ip,{...prior,count:prior.count+1});
  try {
    const body = schema.parse(await request.json());
    const result = await query<{id:string;email:string;full_name:string;password_hash:string;role:"ADMIN"|"APQP_MANAGER"|"QUALITY_ENGINEER"|"ENGINEER"|"VIEWER";active:boolean}>(
      "SELECT id,email,full_name,password_hash,role,active FROM app_users WHERE lower(email)=lower($1)",[body.email]);
    const user = result.rows[0];
    if (!user || !user.active || !(await compare(body.password,user.password_hash))) return Response.json({error:"Invalid email or password"},{status:401});
    await createSession({id:user.id,email:user.email,fullName:user.full_name,role:user.role});
    attempts.delete(ip);
    return Response.json({user:{id:user.id,email:user.email,fullName:user.full_name,role:user.role}});
  } catch (e) {
    if (e instanceof z.ZodError) return Response.json({error:"Invalid login details"},{status:400});
    return Response.json({error:"Login service unavailable. Verify database configuration."},{status:503});
  }
}
