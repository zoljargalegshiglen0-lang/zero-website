"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) setError(result.error ?? "Нэвтрэх боломжгүй байна.");
      else {
        router.replace("/admin");
        router.refresh();
      }
    } catch {
      setError("Сервертэй холбогдож чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="page-wrap"><PageHeading icon="admin" eyebrow="WINGS OWNER" title="ADMIN LOGIN" description="WINGS owner access нууц үгээр нэвтэрнэ." /><section className="admin-form-panel" style={{ maxWidth: 450 }}><form onSubmit={submit} className="admin-form"><label><span>ADMIN PASSWORD</span><input autoFocus required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Нууц үг" /></label><button disabled={loading} type="submit">{loading ? "ШАЛГАЖ БАЙНА..." : "НЭВТРЭХ"}<Icon name="arrow" size={15} /></button>{error && <p className="form-status">{error}</p>}</form></section></main>;
}
