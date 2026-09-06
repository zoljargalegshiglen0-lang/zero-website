import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSiteConfig, saveSiteConfig, siteConfigWritable } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ config: await getSiteConfig(), writable: siteConfigWritable() });
}

export async function PUT(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = await request.json();
    const config = await saveSiteConfig(input);
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save site config" }, { status: 500 });
  }
}
