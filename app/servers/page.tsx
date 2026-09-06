"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

type Server = {
  id: string;
  name: string;
  address: string;
  mode: string;
  map: string;
  players: number;
  capacity: number;
  ping: number | null;
  state: "ONLINE" | "OFFLINE";
  updatedAt?: string;
};

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [copied, setCopied] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/community/servers", { cache: "no-store" });
      const data = await response.json();
      setServers(Array.isArray(data.servers) ? data.servers : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
  }, []);

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  const modes = useMemo(() => ["ALL", ...Array.from(new Set(servers.map((server) => server.mode).filter(Boolean)))], [servers]);
  const visible = useMemo(
    () => servers.filter((server) => (filter === "ALL" || server.mode === filter) && `${server.name} ${server.map} ${server.address}`.toLowerCase().includes(query.toLowerCase())),
    [servers, filter, query],
  );

  const liveCount = servers.filter((server) => server.state === "ONLINE").length;
  const players = servers.reduce((sum, server) => sum + server.players, 0);
  const capacity = servers.reduce((sum, server) => sum + server.capacity, 0);
  const avgPing = Math.round(servers.filter((server) => server.ping !== null).reduce((sum, server) => sum + (server.ping || 0), 0) / Math.max(1, servers.filter((server) => server.ping !== null).length));
  const featured = visible[0] ?? servers[0] ?? null;

  return (
    <main className="page-wrap servers-v8-page">
      <PageHeading icon="server" eyebrow="LIVE MATCH DIRECTORY" title="SERVERS" description="Live queue browser · fast copy-IP controls · compact match cards" actions={<button className="page-button" onClick={load}><Icon name="bolt" size={15} /> REFRESH</button>} />

      <section className="servers-v8-hero">
        <article className="servers-v8-brand">
          <span className="server-live-line"><i /> {players} players online</span>
          <div className="servers-v8-brand-row">
            <img src="/wings-mark-mono.svg" alt="WINGS" />
            <div>
              <strong>WINGS</strong>
              <small>CS2 NETWORK</small>
            </div>
          </div>
          <p>Fast server list. Real states only. Copy the address and join from CS2.</p>
          <div className="servers-v8-metrics">
            <div><strong>{players}</strong><span>PLAYERS</span></div>
            <div><strong>{liveCount}</strong><span>LIVE SERVERS</span></div>
            <div><strong>{capacity || "—"}</strong><span>TOTAL SLOTS</span></div>
          </div>
        </article>

        <article className="servers-v8-featured">
          <div className="servers-v8-featured-bg" />
          <div className="servers-v8-featured-copy">
            <span>FEATURED MATCH</span>
            <strong>{featured?.name ?? "No live server"}</strong>
            <p>{featured ? `${featured.mode} · ${featured.map}` : "Connect your CS2 bridge to show live server data."}</p>
            {featured ? (
              <button onClick={() => copyAddress(featured.address)}><Icon name="copy" size={15} /> {copied === featured.address ? "COPIED" : "COPY IP"}</button>
            ) : null}
          </div>
          {featured ? <b>{featured.players}/{featured.capacity}</b> : <b>OFFLINE</b>}
        </article>
      </section>

      <section className="servers-v8-controlbar">
        <div className="filter-set servers-v8-filters">
          {modes.map((mode) => (
            <button key={mode} className={filter === mode ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(mode)}>{mode}</button>
          ))}
        </div>
        <label className="search-box servers-v8-search"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Server, map, IP..." /></label>
        <span className="servers-v8-ping">AVG {servers.length ? `${avgPing} MS` : "—"}</span>
      </section>

      <section className="servers-v8-grid">
        {visible.map((server, index) => (
          <article className="servers-v8-card" key={server.id}>
            <div className="servers-v8-map">
              <span>#{String(index + 1).padStart(2, "0")}</span>
              <strong>{server.map || "MAP"}</strong>
              <small>{server.mode}</small>
            </div>
            <div className="servers-v8-card-body">
              <div className="servers-v8-card-top">
                <div>
                  <strong>{server.name}</strong>
                  <small>{server.address}</small>
                </div>
                <em className={`status-${server.state.toLowerCase()}`}><i /> {server.state}</em>
              </div>
              <div className="servers-v8-slotline">
                <div className="neo-progress compact"><i style={{ width: `${server.capacity ? Math.min(100, (server.players / server.capacity) * 100) : 0}%` }} /></div>
                <b>{server.players}/{server.capacity}</b>
              </div>
              <div className="servers-v8-card-foot">
                <span>{server.ping === null ? "—" : `${server.ping} ms`}</span>
                <button onClick={() => copyAddress(server.address)}><Icon name="copy" size={14} /> {copied === server.address ? "COPIED" : "COPY"}</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !visible.length ? (
          <div className="mono-empty-panel large"><i><Icon name="server" size={28} /></i><strong>No live servers</strong><p>CS2 bridge холбоход бодит server list энд автоматаар гарна.</p></div>
        ) : null}
      </section>
    </main>
  );
}
