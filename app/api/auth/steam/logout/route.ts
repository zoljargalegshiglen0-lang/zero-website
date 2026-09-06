import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = NextResponse.redirect(new URL("/", url.origin));
  result.cookies.set("zero_steam_id", "", { httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", path: "/", maxAge: 0 });
  return result;
}
