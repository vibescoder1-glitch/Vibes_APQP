import { getSession } from "@/lib/auth";
export async function GET() {
 const user = await getSession();
 return user ? Response.json({user}) : Response.json({user:null},{status:401});
}
