import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { query } from "./db";

const cookieName = "vibes_apqp_session";
const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  return new TextEncoder().encode(value);
};
export type SessionUser = { id: string; email: string; fullName: string; role: "ADMIN"|"APQP_MANAGER"|"QUALITY_ENGINEER"|"ENGINEER"|"VIEWER" };
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email, fullName: user.fullName, role: user.role })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("8h").sign(secret());
  const jar = await cookies();
  jar.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}
export async function getSession(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.fullName !== "string" || typeof payload.role !== "string") return null;
    const result = await query<{id:string;email:string;full_name:string;role:SessionUser["role"];active:boolean}>(
      "SELECT id,email,full_name,role,active FROM app_users WHERE id=$1", [payload.sub]
    );
    const user = result.rows[0];
    if (!user?.active) return null;
    return { id:user.id,email:user.email,fullName:user.full_name,role:user.role };
  } catch { return null; }
}
export async function requireUser(roles?: SessionUser["role"][]) {
  const user = await getSession();
  if (!user) return { user: null, response: Response.json({ error:"Authentication required" }, { status:401 }) };
  if (roles && !roles.includes(user.role)) return { user: null, response: Response.json({ error:"Insufficient permissions" }, { status:403 }) };
  return { user, response: null };
}
export async function writeAudit(actorId:string, projectId:string|null, entityType:string, entityId:string, action:string, before:unknown=null, after:unknown=null) {
  await query("INSERT INTO audit_events(actor_id,project_id,entity_type,entity_id,action,before_data,after_data) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [actorId,projectId,entityType,entityId,action,before == null ? null : JSON.stringify(before),after == null ? null : JSON.stringify(after)]);
}
