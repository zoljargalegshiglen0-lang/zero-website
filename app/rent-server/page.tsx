"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const HOURLY_RATE = 6000;
const maps = ["MIRAGE", "ANCIENT", "INFERNO", "ANUBIS", "NUKE", "DUST2"];
const modes = ["Premier", "Retake", "Practice", "Custom"];

export default function RentServerPage() {
  const [hours, setHours] = useState(2);
  const [map, setMap] = useState("MIRAGE");
  const [mode, setMode] = useState("Premier");
  const [customMap, setCustomMap] = useState("");

  const total = useMemo(() => hours * HOURLY_RATE, [hours]);
  const displayMap = customMap.trim() || map;

  return (
    <main className="page-wrap">
      <PageHeading icon="rent" eyebrow="PRIVATE SERVER" title="RENT SERVER" description="Simple hourly calculator and request-ready layout" />

      <section className="mono-two-column rent-v6-layout">
        <article className="mono-section-block">
          <div className="mono-section-head"><div><span>Configuration</span><h2>Build your session</h2></div></div>
          <div className="mono-choice-grid four">
            {modes.map((item) => <button key={item} className={mode === item ? "filter-chip active" : "filter-chip"} onClick={() => setMode(item)}>{item}</button>)}
          </div>
          <div className="mono-choice-grid six">
            {maps.map((item) => <button key={item} className={map === item && !customMap ? "filter-chip active" : "filter-chip"} onClick={() => { setCustomMap(""); setMap(item); }}>{item}</button>)}
          </div>
          <label className="mono-form-row"><span>Custom map / workshop link</span><input value={customMap} onChange={(event) => setCustomMap(event.target.value)} placeholder="Optional" /></label>
          <div className="mono-choice-grid six">
            {[1, 2, 3, 4, 6, 8].map((value) => <button key={value} className={hours === value ? "filter-chip active" : "filter-chip"} onClick={() => setHours(value)}>{value}h</button>)}
          </div>
        </article>

        <article className="mono-section-block">
          <div className="mono-section-head"><div><span>Summary</span><h2>Estimated request</h2></div></div>
          <div className="mono-note-stack">
            <article><strong>Mode</strong><p>{mode}</p></article>
            <article><strong>Map</strong><p>{displayMap}</p></article>
            <article><strong>Duration</strong><p>{hours} hour</p></article>
            <article><strong>Total</strong><p>{total.toLocaleString()}₮</p></article>
          </div>
          <div className="mono-inline-links">
            <button className="page-button" type="button"><Icon name="rent" size={16} /> Preview request</button>
            <a className="ghost-button" href="https://discord.gg/tFNYKQpHZe" target="_blank" rel="noreferrer"><Icon name="discord" size={16} /> Contact on Discord</a>
          </div>
        </article>
      </section>
    </main>
  );
}
