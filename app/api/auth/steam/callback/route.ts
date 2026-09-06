import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verify = new URLSearchParams();
  for (const [key, value] of url.searchParams) if (key.startsWith("openid.")) verify.set(key, value);
  verify.set("openid.mode", "check_authentication");

  const response = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: verify.toString(),
  });
  const body = await response.text();
  const claimed = url.searchParams.get("openid.claimed_id") ?? "";
  const steamId = claimed.match(/\/id\/(\d+)$/)?.[1] ?? "";
  if (!response.ok || !body.includes("is_valid:true") || !steamId) return NextResponse.redirect(new URL("/login?error=steam", url.origin));

  const result = NextResponse.redirect(new URL("/profile?steam=connected", url.origin));
  result.cookies.set("zero_steam_id", steamId, { httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return result;
}
