import { cookies } from "next/headers";
export async function POST() {
 const jar = await cookies();
 jar.set("vibes_apqp_session","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
 return Response.json({ok:true});
}
