import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { resolveSteamProfile } from "@/lib/steam";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { steam?: unknown } | null;
  const steam = typeof body?.steam === "string" ? body.steam.trim() : "";
  if (!steam) return NextResponse.json({ error: "SteamID64 эсвэл profile link оруулна уу." }, { status: 400 });
  try {
    return NextResponse.json({ profile: await resolveSteamProfile(steam) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Steam profile олдсонгүй." }, { status: 400 });
  }
}
