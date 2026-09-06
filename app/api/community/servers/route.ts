import { NextResponse } from "next/server";
import { getLiveServers } from "@/lib/community";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const live = await getLiveServers();
  if (live.length) return NextResponse.json({ servers: live });

  const config = await getSiteConfig();
  return NextResponse.json({
    servers: config.servers.map((server) => ({
      ...server,
      address: `connect.${server.id.toLowerCase()}.wings.local:27015`,
    })),
    fallback: true,
  });
}
