"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

type RecordItem = {
  id: string;
  playerName: string;
  steamId64: string;
  type: string;
  reason: string;
  durationMinutes: number | null;
  expiresAt: string | null;
  permanent: boolean;
  server: string;
  issuedByName: string;
  notes?: string;
  createdAt: string;
  status: string;
};

type ModType = "BAN" | "MUTE" | "GAG" | "SILENCE";

const durations = [30, 60, 360, 1440, 10080];

function durationLabel(minutes: number) {
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440}D`;
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}H`;
  return `${minutes}M`;
}

export default function BansPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [canModerate, setCanModerate] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    playerName: "",
    steamId64: "",
    type: "BAN" as ModType,
    reason: "",
    durationMinutes: 60,
    permanent: false,
    server: "ALL",
    notes: "",
  });

  async function load() {
    const response = await fetch("/api/moderation", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    setRecords(Array.isArray(data.records) ? data.records : []);
    setCanModerate(Boolean(data.canModerate));
  }

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => records.filter((item) => {
    const matchesFilter = filter === "ALL" || item.type === filter;
    const hay = `${item.playerName} ${item.steamId64} ${item.reason} ${item.server} ${item.issuedByName}`.toLowerCase();
    return matchesFilter && hay.includes(query.toLowerCase());
  }), [records, filter, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const response = await fetch("/api/moderation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(data.error || "Failed");
      return;
    }
    setStatus("Action saved");
    setForm({ ...form, playerName: "", steamId64: "", reason: "", notes: "" });
    await load();
  }

  return (
    <main className="page-wrap">
      <PageHeading icon="ban" eyebrow="MODERATION LOG" title="BANS & ACTIONS" description="Real stored moderation records only" />

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Integrity center</span>
            <h2>Moderation history</h2>
          </div>
          <button className="page-button" onClick={load}>Refresh</button>
        </div>

        <div className="toolbar mono-toolbar-simple">
          <div className="filter-set">
            {["ALL", "BAN", "MUTE", "GAG", "SILENCE"].map((value) => (
              <button key={value} className={filter === value ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(value)}>{value}</button>
            ))}
          </div>
          <label className="search-box"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Player, SteamID64, reason..." /></label>
        </div>

        {canModerate ? (
          <form className="mono-form-panel" onSubmit={submit}>
            <div className="mono-form-grid three">
              <label><span>Player</span><input required value={form.playerName} onChange={(event) => setForm({ ...form, playerName: event.target.value })} /></label>
              <label><span>SteamID64</span><input required value={form.steamId64} onChange={(event) => setForm({ ...form, steamId64: event.target.value })} placeholder="7656119..." /></label>
              <label><span>Server</span><input value={form.server} onChange={(event) => setForm({ ...form, server: event.target.value })} /></label>
            </div>
            <div className="mono-form-grid three">
              <label><span>Action</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ModType })}>{["BAN", "MUTE", "GAG", "SILENCE"].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>Reason</span><input required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label>
              <label><span>Notes</span><input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
            </div>
            <div className="mono-form-footer">
              <div className="mono-duration-row">
                {durations.map((minutes) => (
                  <button type="button" key={minutes} className={!form.permanent && form.durationMinutes === minutes ? "filter-chip active" : "filter-chip"} onClick={() => setForm({ ...form, permanent: false, durationMinutes: minutes })}>{durationLabel(minutes)}</button>
                ))}
                <button type="button" className={form.permanent ? "filter-chip active" : "filter-chip"} onClick={() => setForm({ ...form, permanent: true })}>PERMA</button>
              </div>
              <button className="page-button" type="submit">Save action</button>
            </div>
            {status ? <div className="mono-form-status">{status}</div> : null}
          </form>
        ) : null}

        {visible.length ? (
          <div className="mono-record-list">
            {visible.map((item) => (
              <article key={item.id} className="mono-record-card">
                <div className="mono-record-top">
                  <div>
                    <strong>{item.playerName}</strong>
                    <small>{item.steamId64}</small>
                  </div>
                  <b>{item.type}</b>
                </div>
                <p>{item.reason}</p>
                <div className="mono-record-meta">
                  <span>{item.server}</span>
                  <span>{item.permanent ? "Permanent" : item.durationMinutes ? durationLabel(item.durationMinutes) : "—"}</span>
                  <span>{item.issuedByName}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mono-empty-panel large">
            <i><Icon name="shield" size={28} /></i>
            <strong>No moderation records yet</strong>
            <p>Энд зөвхөн бодитоор хадгалагдсан actions л харагдана.</p>
          </div>
        )}
      </section>
    </main>
  );
}
