import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json({
    discordUrl: config.discordUrl,
    instagramUrl: config.instagramUrl,
    announcement: config.announcement,
    cards: config.cards,
  });
}
