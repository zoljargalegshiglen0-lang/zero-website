import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createStaffMember, staffStorageWritable } from "@/lib/staff-store";
import { resolveSteamProfile } from "@/lib/steam";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!staffStorageWritable()) {
    return NextResponse.json({ error: "Vercel дээр Staff хадгалахын тулд UPSTASH_REDIS_REST_URL ба UPSTASH_REDIS_REST_TOKEN тохируулна уу." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const steamInput = String(body.steam ?? "").trim().slice(0, 180);
  const role = String(body.role ?? "").trim().slice(0, 60);
  const department = String(body.department ?? "").trim().slice(0, 40);
  const bio = String(body.bio ?? "").trim().slice(0, 180);
  const color = String(body.color ?? "violet").trim();
  const sortOrder = Math.min(999, Math.max(1, Number(body.sortOrder) || 100));
  if (!steamInput || !role || !department || !bio) return NextResponse.json({ error: "Steam profile, role, department, bio-гаа бөглөнө үү." }, { status: 400 });
  if (!["violet", "cyan", "mint", "amber", "pink"].includes(color)) return NextResponse.json({ error: "Invalid color" }, { status: 400 });

  try {
    const profile = await resolveSteamProfile(steamInput);
    const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase().slice(0, 3) || "ST";
    const id = await createStaffMember({
      name: profile.name,
      role,
      department,
      bio,
      initials,
      color,
      sortOrder,
      steamId64: profile.steamId64,
      steamName: profile.name,
      steamAvatar: profile.avatarFull,
      steamProfileUrl: profile.profileUrl,
    });
    return NextResponse.json({ id, profile }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Steam profile олдсонгүй." }, { status: 400 });
  }
}
