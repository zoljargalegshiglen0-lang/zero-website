import { NextResponse } from "next/server"; import { getLiveServers } from "@/lib/community"; export async function GET(){return NextResponse.json({servers:await getLiveServers()});}
