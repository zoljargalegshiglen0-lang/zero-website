"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";
import { clans } from "@/lib/data";

const extraClans = [
  ...clans,
  { rank: 5, tag: "[SYNC]", name: "Synchronicity", members: 11, rating: 6920, wins: 29, tone: "blue" },
  { rank: 6, tag: "[AURA]", name: "Aurora Project", members: 8, rating: 6610, wins: 24, tone: "pink" },
];

export default function ClansPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(extraClans[0]);
  const [mode, setMode] = useState("ALL");
  const visible = useMemo(() => extraClans.filter((clan) => `${clan.tag} ${clan.name}`.toLowerCase().includes(query.toLowerCase()) && (mode !== "TOP 3" || clan.rank <= 3)), [query, mode]);

  return (
    <main className="page-wrap">
      <PageHeading icon="clan" eyebrow="TEAM LADDER" title="CLANS" description="Clan browser, ranking and detail showcase" />

      <section className="neo-clan-shell">
        <article className="neo-clan-hero">
          <div>
            <span>SEASON 01 / BUILD YOUR FIVE</span>
            <h2>Form your roster. Push your tag.</h2>
            <p>Leaderboard, clan directory, internal identity, seasonal wins болон community spotlight бүгдийг илүү цэгцтэй болгосон.</p>
          </div>
          <div className="neo-clan-hero-stats">
            <article><strong>84</strong><small>clans tracked</small></article>
            <article><strong>692</strong><small>members</small></article>
            <article><strong>19</strong><small>active wars</small></article>
          </div>
        </article>

        <div className="toolbar neo-toolbar">
          <div className="filter-set">{["ALL", "TOP 3"].map((item) => <button className={mode === item ? "filter-chip active" : "filter-chip"} key={item} onClick={() => setMode(item)}>{item}</button>)}</div>
          <label className="search-box"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Clan хайх..." /></label>
        </div>

        <div className="neo-clan-layout">
          <div className="clan-roster neo-clan-roster">
            {visible.map((clan) => (
              <button key={clan.tag} className={`roster-clan roster-${clan.tone} ${active.tag === clan.tag ? "active" : ""}`} onClick={() => setActive(clan)}>
                <span className="roster-rank">#{String(clan.rank).padStart(2, "0")}</span>
                <i>{clan.tag.slice(1, 3)}</i>
                <div><strong>{clan.name}</strong><small>{clan.tag} · {clan.members} MEMBERS</small></div>
                <b>{clan.rating.toLocaleString()}</b>
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>

          <aside className={`clan-detail detail-${active.tone} neo-clan-detail`}>
            <span>CLAN PROFILE / #{String(active.rank).padStart(2, "0")}</span>
            <div className="clan-detail-mark">{active.tag.slice(1, 3)}</div>
            <h2>{active.name}</h2>
            <p>{active.tag} · ULAANBAATAR</p>
            <div className="clan-detail-stats">
              <div><strong>{active.rating.toLocaleString()}</strong><span>RATING</span></div>
              <div><strong>{active.members}</strong><span>MEMBERS</span></div>
              <div><strong>{active.wins}</strong><span>WINS</span></div>
            </div>
            <div className="clan-activity"><span>RECENT FORM</span><div>{["W", "W", "L", "W", "W"].map((result, index) => <i className={result === "W" ? "win" : "loss"} key={`${result}-${index}`}>{result}</i>)}</div></div>
            <div className="neo-clan-detail-boxes">
              <article><span>Preferred mode</span><strong>Premier</strong></article>
              <article><span>Recruitment</span><strong>Open</strong></article>
            </div>
            <button>VIEW CLAN PROFILE <Icon name="arrow" size={15} /></button>
          </aside>
        </div>
      </section>
    </main>
  );
}
