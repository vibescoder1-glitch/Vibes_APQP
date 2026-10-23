import { hash } from "bcryptjs";
import pg from "pg";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
const {Pool}=pg;
const rl=createInterface({input,output});
const email=(await rl.question("Admin email: ")).trim().toLowerCase();
const fullName=(await rl.question("Admin full name: ")).trim();
const password=await rl.question("Admin password (12+ characters): ");
rl.close();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!fullName||password.length<12){console.error("Provide a valid email, name and password of at least 12 characters.");process.exit(1);}
if(!process.env.DATABASE_URL){console.error("DATABASE_URL is required.");process.exit(1);}
const pool=new Pool({connectionString:process.env.DATABASE_URL});
try{
 const count=await pool.query("SELECT count(*)::int n FROM app_users WHERE role='ADMIN'");
 if(count.rows[0].n>0){console.error("An admin already exists. Use the approved account administration workflow.");process.exit(1);}
 const passwordHash=await hash(password,12);
 const r=await pool.query("INSERT INTO app_users(email,full_name,password_hash,role) VALUES($1,$2,$3,'ADMIN') RETURNING id,email,full_name,role",[email,fullName,passwordHash]);
 console.log("Created initial admin:",r.rows[0]);
}finally{await pool.end();}
