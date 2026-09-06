import { NextResponse } from "next/server";
import { adminCookieName, checkAdminPassword, createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!process.env.ZERO_ADMIN_PASSWORD) return NextResponse.json({ error: "ZERO_ADMIN_PASSWORD тохируулаагүй байна." }, { status: 503 });
  if (!checkAdminPassword(password)) return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.headers.get("x-forwarded-proto") === "https",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
