import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSteamProfile } from "@/lib/steam";

export async function GET() {
  const store = await cookies();
  const steamId = store.get("zero_steam_id")?.value ?? "";
  if (!steamId) return NextResponse.json({ authenticated: false }, { status: 401 });

  try {
    const profile = await getSteamProfile(steamId);
    return NextResponse.json({ authenticated: true, profile }, { headers: { "cache-control": "private, max-age=60" } });
  } catch {
    return NextResponse.json({
      authenticated: true,
      profile: {
        steamId64: steamId,
        name: "Steam User",
        profileUrl: `https://steamcommunity.com/profiles/${steamId}/`,
        avatar: "",
        avatarMedium: "",
        avatarFull: "",
        personaState: 0,
        communityVisibilityState: 0,
        lastLogoff: 0,
      },
      limited: true,
    }, { headers: { "cache-control": "private, max-age=30" } });
  }
}
