"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

type Rec = {
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

const actionOptions: { id: ModType; title: string; note: string }[] = [
  { id: "BAN", title: "BAN", note: "Server access" },
  { id: "MUTE", title: "MUTE", note: "Voice chat" },
  { id: "GAG", title: "GAG", note: "Text chat" },
  { id: "SILENCE", title: "SILENCE", note: "Voice + text" },
];

const durationOptions = [
  { label: "30M", minutes: 30 },
  { label: "1H", minutes: 60 },
  { label: "6H", minutes: 360 },
  { label: "1D", minutes: 1440 },
  { label: "7D", minutes: 10080 },
  { label: "30D", minutes: 43200 },
] as const;

const reasonOptions = ["Cheating", "Toxicity", "Mic spam", "Chat abuse", "Griefing", "Exploiting"];

function formatDuration(record: Rec) {
  if (record.permanent) return "PERMANENT";
  const value = Number(record.durationMinutes || 0);
  if (value >= 1440 && value % 1440 === 0) return `${value / 1440}D`;
  if (value >= 60 && value % 60 === 0) return `${value / 60}H`;
  return `${value}M`;
}

export default function BansPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [canModerate, setCan] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [status, setStatus] = useState("");
  const [customDuration, setCustomDuration] = useState(false);
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
    if (!response.ok) {
      setCan(false);
      setRecords([]);
      return;
    }
    setCan(Boolean(data.canModerate));
    setRecords(Array.isArray(data.records) ? data.records : []);
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () =>
      records.filter(
        (record) =>
          (filter === "ALL" || record.type === filter) &&
          `${record.playerName} ${record.steamId64} ${record.reason} ${record.issuedByName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [records, filter, query],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const response = await fetch("/api/moderation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setStatus("ACTION SAVED");
      setForm((previous) => ({ ...previous, playerName: "", steamId64: "", reason: "", notes: "" }));
      await load();
    } else {
      setStatus(data.error || "FAILED");
    }
  }

  return (
    <main className="page-wrap moderation-page">
      <PageHeading icon="ban" eyebrow="INTEGRITY CENTER" title="MODERATION" description="Ban · mute · gag · silence history" />

      <div className="toolbar moderation-toolbar">
        <div className="filter-set">
          {["ALL", "BAN", "MUTE", "GAG", "SILENCE"].map((value) => (
            <button key={value} className={filter === value ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(value)}>
              {value}
            </button>
          ))}
        </div>
        <label className="search-box"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Player, SteamID64, reason, staff..." /></label>
      </div>

      {canModerate ? <form className="moderation-quick" onSubmit={submit}>
        <header className="moderation-quick-head">
          <div><span>STAFF ACTION</span><strong>QUICK MODERATION</strong><small>Player → action → duration → reason</small></div>
          <Icon name="shield" size={20} />
        </header>

        <section className="moderation-player-row">
          <label><span>PLAYER NAME</span><input required value={form.playerName} onChange={(event) => setForm({ ...form, playerName: event.target.value })} placeholder="Player name" /></label>
          <label><span>STEAMID64</span><input required value={form.steamId64} onChange={(event) => setForm({ ...form, steamId64: event.target.value })} placeholder="7656119..." /></label>
          <label><span>SERVER</span><input value={form.server} onChange={(event) => setForm({ ...form, server: event.target.value })} placeholder="ALL" /></label>
        </section>

        <section className="moderation-choice-block">
          <header><span>1</span><strong>ACTION</strong></header>
          <div className="moderation-action-grid">
            {actionOptions.map((option) => (
              <button type="button" key={option.id} className={`mod-action-card ${form.type === option.id ? "active" : ""} action-${option.id.toLowerCase()}`} onClick={() => setForm({ ...form, type: option.id })}>
                <b>{option.title}</b><small>{option.note}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="moderation-choice-block">
          <header><span>2</span><strong>DURATION</strong></header>
          <div className="moderation-duration-row">
            {durationOptions.map((option) => (
              <button type="button" key={option.label} className={!form.permanent && !customDuration && form.durationMinutes === option.minutes ? "active" : ""} onClick={() => { setCustomDuration(false); setForm({ ...form, permanent: false, durationMinutes: option.minutes }); }}>
                {option.label}
              </button>
            ))}
            <button type="button" className={form.permanent ? "active perma" : "perma"} onClick={() => { setCustomDuration(false); setForm({ ...form, permanent: true }); }}>PERMA</button>
            <button type="button" className={customDuration && !form.permanent ? "active" : ""} onClick={() => { setCustomDuration(true); setForm({ ...form, permanent: false }); }}>CUSTOM</button>
            {customDuration && !form.permanent && <label className="custom-duration"><input type="number" min="1" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Math.max(1, Number(event.target.value) || 1) })} /><span>MIN</span></label>}
          </div>
        </section>

        <section className="moderation-choice-block">
          <header><span>3</span><strong>REASON</strong></header>
          <div className="moderation-reasons">
            {reasonOptions.map((reason) => <button type="button" key={reason} className={form.reason === reason ? "active" : ""} onClick={() => setForm({ ...form, reason })}>{reason}</button>)}
          </div>
          <label className="moderation-reason-input"><input required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Reason эсвэл дээрх preset-ээс сонго..." /></label>
        </section>

        <details className="moderation-notes"><summary>+ OPTIONAL NOTES</summary><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Staff-only note..." /></details>

        <footer className="moderation-submit-row">
          <div><span>{form.type}</span><strong>{form.permanent ? "PERMANENT" : `${form.durationMinutes} MIN`}</strong><small>{form.reason || "Reason required"}</small></div>
          <button className="moderation-save" type="submit">APPLY ACTION <Icon name="arrow" size={14} /></button>
        </footer>
        {status && <p className={`moderation-status ${status === "ACTION SAVED" ? "ok" : ""}`}>{status}</p>}
      </form> : <section className="moderation-public-note"><Icon name="shield" size={18}/><div><span>PUBLIC HISTORY</span><strong>BAN / MUTE HISTORY</strong><p>Энд moderation history-г хүн бүр харж болно. Шинэ action үүсгэх эрх зөвхөн Staff Team-д бүртгэлтэй SteamID64 болон owner/admin-д байна.</p></div><a href="/login">STAFF LOGIN <Icon name="arrow" size={12}/></a></section>}

      <section className="moderation-history-head"><div><span>HISTORY</span><strong>MODERATION RECORDS</strong></div><small>{visible.length} RECORDS</small></section>
      <div className="moderation-records refined">
        {visible.map((record) => (
          <article key={record.id}>
            <div className={`moderation-type type-${record.type.toLowerCase()}`}>{record.type}</div>
            <div className="moderation-main"><strong>{record.playerName}</strong><span>{record.steamId64}</span><p>{record.reason}</p>{record.notes && <em>{record.notes}</em>}</div>
            <dl>
              <div><dt>DURATION</dt><dd>{formatDuration(record)}</dd></div>
              <div><dt>STAFF</dt><dd>{record.issuedByName}</dd></div>
              <div><dt>SERVER</dt><dd>{record.server}</dd></div>
              <div><dt>CREATED</dt><dd>{new Date(record.createdAt).toLocaleString()}</dd></div>
            </dl>
          </article>
        ))}
        {!visible.length && <div className="connection-ready-empty"><Icon name="shield" size={26} /><strong>NO MODERATION RECORDS</strong><span>Staff actions энд бүртгэгдэнэ.</span></div>}
      </div>
    </main>
  );
}
