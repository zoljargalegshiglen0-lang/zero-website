import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { deleteStaffMember, staffStorageWritable } from "@/lib/staff-store";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!staffStorageWritable()) {
    return NextResponse.json({ error: "Vercel Free дээр local JSON хадгалалт read-only байна." }, { status: 503 });
  }
  const { id } = await params;
  if (!id || id.length > 80) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await deleteStaffMember(id);
  return NextResponse.json({ ok: true });
}
