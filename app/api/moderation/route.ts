import { NextResponse } from "next/server";
import { canModerate, createModerationRecord, getModerationRecords } from "@/lib/community";

export async function GET() {
  const actor = await canModerate();
  return NextResponse.json({ records: await getModerationRecords(), canModerate: actor.allowed });
}

export async function POST(req: Request) {
  const actor = await canModerate();
  if (!actor.allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as any;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const type = String(body.type || "BAN").toUpperCase();
  if (!["BAN", "MUTE", "GAG", "SILENCE"].includes(type)) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const steamId64 = String(body.steamId64 || "").trim();
  if (!/^7656119\d{10}$/.test(steamId64)) return NextResponse.json({ error: "SteamID64 буруу байна" }, { status: 400 });
  const permanent = Boolean(body.permanent);
  const duration = permanent ? null : Math.max(1, Number(body.durationMinutes) || 60);
  const expiresAt = permanent ? null : new Date(Date.now() + duration! * 60000).toISOString();
  try {
    return NextResponse.json({
      record: await createModerationRecord({
        playerName: String(body.playerName || "Unknown").slice(0, 80),
        steamId64,
        type: type as any,
        reason: String(body.reason || "No reason").slice(0, 200),
        durationMinutes: duration,
        expiresAt,
        permanent,
        server: String(body.server || "ALL").slice(0, 100),
        notes: String(body.notes || "").slice(0, 300),
      }),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
