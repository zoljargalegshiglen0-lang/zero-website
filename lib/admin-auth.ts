import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const adminCookieName = "zero_admin_session";

function configuredPassword() {
  return process.env.ZERO_ADMIN_PASSWORD ?? "";
}

function sessionToken() {
  const password = configuredPassword();
  return password ? createHmac("sha256", password).update("ZERO_ADMIN_SESSION_V1").digest("hex") : "";
}

export function checkAdminPassword(input: string) {
  const configured = Buffer.from(configuredPassword());
  const submitted = Buffer.from(input);
  return configured.length > 0 && configured.length === submitted.length && timingSafeEqual(configured, submitted);
}

export function createAdminSession() {
  return sessionToken();
}

export async function getAdminUser() {
  const current = (await cookies()).get(adminCookieName)?.value ?? "";
  const expected = sessionToken();
  if (!expected || current.length !== expected.length || !timingSafeEqual(Buffer.from(current), Buffer.from(expected))) return null;
  return { displayName: "WINGS Owner", email: "owner@wings.local", fullName: "WINGS Owner" };
}

export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
