import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "WINGS",
    runtime: "nextjs",
    timestamp: new Date().toISOString(),
    integrations: {
      steamProfileApi: Boolean(process.env.STEAM_WEB_API_KEY),
      persistentStorage: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      cs2Bridge: Boolean(process.env.CS2_BRIDGE_URL),
    },
  });
}
