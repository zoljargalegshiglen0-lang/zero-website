"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const maps = [{ name: "MIRAGE", tone: "amber" }, { name: "ANCIENT", tone: "mint" }, { name: "INFERNO", tone: "pink" }, { name: "ANUBIS", tone: "cyan" }, { name: "NUKE", tone: "violet" }, { name: "VERTIGO", tone: "blue" }];
const hourlyRate = 6000;

export default function SessionStudioPage() {
  const [hours, setHours] = useState(2);
  const [map, setMap] = useState("MIRAGE");
  const [mode, setMode] = useState("Premier");
  const [customMap, setCustomMap] = useState("");
  const [notice, setNotice] = useState("");

  function update() {
    setNotice("Серверийн тохиргоо шинэчлэгдлээ");
    setTimeout(() => setNotice(""), 1800);
  }

  return <main className="page-wrap"><PageHeading icon="rent" eyebrow="SERVER RENTAL" title="СЕРВЕР ТҮРЭЭС" description="Mode · map · цагийн сонголт" /><div className="session-layout"><section className="session-builder"><div className="builder-step"><span>01 / MODE</span><div className="session-modes">{["Premier", "Retake", "Practice", "Custom"].map(item => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}><Icon name={item === "Custom" ? "settings" : "server"} size={17} />{item}</button>)}</div></div><div className="builder-step"><span>02 / MAP</span><div className="map-grid">{maps.map(item => <button key={item.name} className={`map-choice map-${item.tone} ${map === item.name ? "active" : ""}`} onClick={() => setMap(item.name)}><span>WINGS MAP</span><strong>{item.name}</strong><small>{map === item.name ? "SELECTED" : "PREVIEW"}</small></button>)}</div><label className="custom-map"><Icon name="globe" size={16} /><input value={customMap} onChange={event => setCustomMap(event.target.value)} placeholder="Community map link эсвэл нэр" /></label></div><div className="builder-step"><span>03 / TIME · 6,000₮ / ЦАГ</span><div className="hours-grid">{[1, 2, 3, 4, 6, 8].map(value => <button key={value} className={hours === value ? "active" : ""} onClick={() => setHours(value)}><strong>{value}</strong><span>ЦАГ</span></button>)}</div></div></section><aside className="session-preview"><span>SERVER CONFIGURATION</span><div className="session-map-label">{customMap.trim() || map}</div><h2>{mode.toUpperCase()}</h2><div className="session-meta"><div><span>TIME</span><strong>{hours} ЦАГ</strong></div><div><span>MAP</span><strong>{customMap.trim() || map}</strong></div><div><span>PRICE</span><strong>{(hours * hourlyRate).toLocaleString()}₮</strong></div></div><button onClick={update}>PREVIEW SERVER <Icon name="arrow" size={15} /></button></aside></div>{notice && <div className="toast">{notice}</div>}</main>;
}
