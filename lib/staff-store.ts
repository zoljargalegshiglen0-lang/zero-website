import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type StaffMember = {
  id:string; name:string; role:string; department:string; bio:string; initials:string; color:string; sortOrder:number; createdAt:number;
  steamId64?:string; steamName?:string; steamAvatar?:string; steamProfileUrl?:string;
};

export const fallbackStaff: StaffMember[] = [];
const dataDirectory=process.env.ZERO_DATA_DIR||path.join(process.cwd(),"data");
const staffFile=path.join(dataDirectory,"staff.json"); const staffKey="zero:staff:v1";
function upstashConfig(){const url=process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/,"");const token=process.env.UPSTASH_REDIS_REST_TOKEN;return url&&token?{url,token}:null;}
async function redisCommand(command:unknown[]){const c=upstashConfig();if(!c)throw new Error("Redis not configured");const r=await fetch(c.url,{method:"POST",headers:{authorization:`Bearer ${c.token}`,"content-type":"application/json"},body:JSON.stringify(command),cache:"no-store"});if(!r.ok)throw new Error(`Redis request failed: ${r.status}`);return r.json() as Promise<{result?:unknown}>;}
export function staffStorageWritable(){return Boolean(upstashConfig())||process.env.VERCEL!=="1";}
function clean(members:StaffMember[]){return members.filter(m=>!/^seed-[1-4]$/.test(m.id)).sort((a,b)=>a.sortOrder-b.sortOrder||a.createdAt-b.createdAt);}
async function writeStaff(members:StaffMember[]){const list=clean(members);if(upstashConfig()){await redisCommand(["SET",staffKey,JSON.stringify(list)]);return;}if(process.env.VERCEL==="1")throw new Error("Persistent staff editing is unavailable on Vercel without Redis storage.");await mkdir(dataDirectory,{recursive:true});const tmp=`${staffFile}.${randomUUID()}.tmp`;await writeFile(tmp,`${JSON.stringify(list,null,2)}\n`,"utf8");await rename(tmp,staffFile);}
export async function getStaffMembers(){if(upstashConfig()){try{const d=await redisCommand(["GET",staffKey]);if(typeof d.result==="string"){const p=JSON.parse(d.result);if(Array.isArray(p)){const c=clean(p as StaffMember[]);if(c.length!==p.length)await writeStaff(c);return c;}}return [];}catch{return [];}}try{const p=JSON.parse(await readFile(staffFile,"utf8"));if(!Array.isArray(p))return [];const c=clean(p as StaffMember[]);if(c.length!==p.length&&staffStorageWritable())await writeStaff(c);return c;}catch(e){if((e as NodeJS.ErrnoException).code==="ENOENT"&&staffStorageWritable())await writeStaff([]);return [];}}
export async function createStaffMember(input:Omit<StaffMember,"id"|"createdAt">){const existing=await getStaffMembers();const id=randomUUID();await writeStaff([...existing,{...input,id,createdAt:Date.now()}]);return id;}
export async function deleteStaffMember(id:string){const existing=await getStaffMembers();await writeStaff(existing.filter(m=>m.id!==id));}
