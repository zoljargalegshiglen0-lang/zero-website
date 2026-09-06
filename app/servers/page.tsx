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
  const avgPing = Math.round(servers.filter((server) => server.ping !== null).reduce((sum, server) => sum + (server.ping || 0), 0) / Math.max(1, servers.filter((server) => server.ping !== null).length));

  return (
    <main className="page-wrap">
      <PageHeading icon="server" eyebrow="MATCH DIRECTORY" title="SERVERS" description="Live queue browser · mode filters · connect-ready layout" actions={<button className="page-button" onClick={load}><Icon name="bolt" /> REFRESH</button>} />

      <section className="neo-board-shell">
        <div className="neo-board-stats">
          <article><span>ONLINE NOW</span><strong>{players}</strong><small>players in queue</small></article>
          <article><span>SERVER COUNT</span><strong>{liveCount}/{servers.length}</strong><small>available boards</small></article>
          <article><span>AVG PING</span><strong>{servers.length ? `${avgPing} ms` : "—"}</strong><small>reported latency</small></article>
          <article><span>STATE</span><strong>{loading ? "SYNCING" : "READY"}</strong><small>auto refresh / 15s</small></article>
        </div>

        <div className="toolbar neo-toolbar">
          <div className="filter-set">
            {modes.map((mode) => (
              <button key={mode} className={filter === mode ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(mode)}>
                {mode}
              </button>
            ))}
          </div>
          <label className="search-box"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Server, map, IP..." /></label>
        </div>

        <div className="neo-match-grid">
          {visible.map((server, index) => (
            <article className="neo-match-card" key={server.id}>
              <div className="neo-match-thumb">
                <span>{server.map || "MAP"}</span>
                <b>{server.mode}</b>
                <small>#{String(index + 1).padStart(2, "0")}</small>
              </div>
              <div className="neo-match-main">
                <div className="neo-match-top">
                  <div>
                    <strong>{server.name}</strong>
                    <small>{server.address}</small>
                  </div>
                  <em className={`status-${server.state.toLowerCase()}`}><i /> {server.state}</em>
                </div>
                <div className="neo-progress compact"><i style={{ width: `${server.capacity ? Math.min(100, (server.players / server.capacity) * 100) : 0}%` }} /></div>
                <div className="neo-match-bottom">
                  <span>{server.players}/{server.capacity} players</span>
                  <span>{server.ping === null ? "—" : `${server.ping} ms`}</span>
                </div>
                <div className="neo-match-actions">
                  <button onClick={() => copyAddress(server.address)}>
                    <Icon name="copy" size={14} /> {copied === server.address ? "COPIED" : "COPY IP"}
                  </button>
                  <button className="ghost">QUEUE CARD</button>
                </div>
              </div>
            </article>
          ))}
          {!loading && !visible.length && <div className="connection-ready-empty"><Icon name="server" size={26} /><strong>NO LIVE SERVERS YET</strong><span>CS2 bridge холбоход live server list энд автоматаар гарна.</span></div>}
        </div>
      </section>
    </main>
  );
}
