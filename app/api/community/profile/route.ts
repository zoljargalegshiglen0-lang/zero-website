import { cookies } from "next/headers"; import { NextResponse } from "next/server"; import { getPlayerCommunityProfile } from "@/lib/community";
export async function GET(){ const s=await cookies(); const id=s.get("zero_steam_id")?.value??""; if(!id)return NextResponse.json({error:"Unauthorized"},{status:401}); return NextResponse.json({profile:await getPlayerCommunityProfile(id)}); }
