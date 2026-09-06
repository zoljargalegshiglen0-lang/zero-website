"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import type { HomeCard, HomeServerWidget, SiteConfig } from "@/lib/site-config";

const iconOptions: HomeCard["icon"][] = ["rent", "discord", "crown", "skin", "server", "users", "trophy", "spark"];

export function AdminSiteConfigManager({ initialConfig, writable }: { initialConfig: SiteConfig; writable: boolean }) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  function updateCard(index: number, patch: Partial<HomeCard>) {
    setConfig((current) => ({ ...current, cards: current.cards.map((card, i) => i === index ? { ...card, ...patch } : card) }));
  }

  function updateServer(index: number, patch: Partial<HomeServerWidget>) {
    setConfig((current) => ({ ...current, servers: current.servers.map((server, i) => i === index ? { ...server, ...patch } : server) }));
  }

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Хадгалж чадсангүй.");
      setConfig(data.config);
      setStatus("WINGS site configuration хадгалагдлаа. Homepage refresh хийхэд шинэчлэгдэнэ.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Хадгалж чадсангүй.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="site-config" className="wings-config-manager">
      <div className="wings-config-head wings-panel">
        <div>
          <span>LIVE CONTENT CONTROL</span>
          <h2>Website controls</h2>
          <p>Discord link, announcement, homepage cards болон fallback server widgets-ийг admin panel-аас өөрчилнө.</p>
        </div>
        <button className="wings-config-save" onClick={save} disabled={saving}>
          <Icon name="check" size={17} /> {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>

      {!writable && (
        <div className="wings-config-warning">
          <Icon name="bolt" size={18} />
          <div>
            <strong>Vercel persistent storage холбогдоогүй байна</strong>
            <span>Одоогийн default утгууд ажиллана. Admin-аас production дээр хадгалах бол Upstash Redis environment variables холбоно.</span>
          </div>
        </div>
      )}

      <div className="wings-config-grid">


        <article className="wings-config-panel">
          <header><Icon name="spark" size={19} /><div><span>HOMEPAGE NOTICE</span><strong>Announcement manager</strong></div></header>
          <label className="wings-toggle-row"><span>SHOW ANNOUNCEMENT</span><input type="checkbox" checked={config.announcement.enabled} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, enabled: e.target.checked } })} /></label>
          <div className="wings-form-pair">
            <label><span>BADGE</span><input value={config.announcement.badge} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, badge: e.target.value } })} /></label>
            <label><span>BUTTON TEXT</span><input value={config.announcement.buttonText} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, buttonText: e.target.value } })} /></label>
          </div>
          <label><span>TITLE</span><input value={config.announcement.title} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, title: e.target.value } })} /></label>
          <label><span>MESSAGE</span><textarea value={config.announcement.body} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, body: e.target.value } })} /></label>
          <label><span>BUTTON LINK</span><input value={config.announcement.buttonHref} onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, buttonHref: e.target.value } })} /></label>
        </article>
      </div>

      <article className="wings-config-panel wings-config-wide">
        <header><Icon name="spark" size={19} /><div><span>HOMEPAGE</span><strong>Editable quick cards</strong></div></header>
        <div className="wings-card-editor-grid">
          {config.cards.map((card, index) => (
            <section className="wings-card-editor" key={`${index}-${card.title}`}>
              <div className="wings-card-editor-title"><span>0{index + 1}</span><Icon name={card.icon} size={18} /></div>
              <label><span>TITLE</span><input value={card.title} onChange={(e) => updateCard(index, { title: e.target.value })} /></label>
              <label><span>DESCRIPTION</span><textarea value={card.text} onChange={(e) => updateCard(index, { text: e.target.value })} /></label>
              <label><span>LINK</span><input value={card.href} onChange={(e) => updateCard(index, { href: e.target.value })} /></label>
              <label><span>ICON</span><select value={card.icon} onChange={(e) => updateCard(index, { icon: e.target.value as HomeCard["icon"] })}>{iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label>
            </section>
          ))}
        </div>
      </article>

      <article className="wings-config-panel wings-config-wide">
        <header><Icon name="server" size={19} /><div><span>LIVE BOARD</span><strong>Server widget manager</strong></div></header>
        <p className="wings-config-note">Real CS2 bridge data байвал homepage тэрийг түрүүлж ашиглана. Bridge холбогдоогүй үед доорх fallback widgets харагдана.</p>
        <div className="wings-server-editor-list">
          {config.servers.map((server, index) => (
            <section className="wings-server-editor" key={`${server.id}-${index}`}>
              <div className="wings-server-editor-index">{String(index + 1).padStart(2, "0")}</div>
              <label><span>NAME</span><input value={server.name} onChange={(e) => updateServer(index, { name: e.target.value })} /></label>
              <label><span>MODE</span><input value={server.mode} onChange={(e) => updateServer(index, { mode: e.target.value })} /></label>
              <label><span>MAP</span><input value={server.map} onChange={(e) => updateServer(index, { map: e.target.value })} /></label>
              <label><span>PLAYERS</span><input type="number" min="0" max="64" value={server.players} onChange={(e) => updateServer(index, { players: Number(e.target.value) })} /></label>
              <label><span>CAPACITY</span><input type="number" min="1" max="64" value={server.capacity} onChange={(e) => updateServer(index, { capacity: Number(e.target.value) })} /></label>
              <label><span>PING</span><input type="number" min="0" max="999" value={server.ping} onChange={(e) => updateServer(index, { ping: Number(e.target.value) })} /></label>
              <label><span>STATE</span><select value={server.state} onChange={(e) => updateServer(index, { state: e.target.value as HomeServerWidget["state"] })}><option value="ONLINE">ONLINE</option><option value="OFFLINE">OFFLINE</option></select></label>
            </section>
          ))}
        </div>
      </article>

      {status && <div className={status.includes("хадгалагдлаа") ? "wings-config-status success" : "wings-config-status"}>{status}</div>}
    </section>
  );
}
