import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { communityBridgeConfigured, getLiveServers, getModerationRecords } from "@/lib/community";
import { getSiteConfig } from "@/lib/site-config";
import { getStaffMembers } from "@/lib/staff-store";

export const dynamic = "force-dynamic";

function ExternalOrInternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const external = /^https?:\/\//i.test(href);
  return external
    ? <a href={href} className={className} target="_blank" rel="noreferrer">{children}</a>
    : <Link href={href || "/"} className={className}>{children}</Link>;
}

export default async function Home() {
  const [liveServers, moderation, config, staff] = await Promise.all([
    getLiveServers(),
    getModerationRecords(),
    getSiteConfig(),
    getStaffMembers(),
  ]);

  const bridgeReady = communityBridgeConfigured();
  const serverPool = (liveServers.length ? liveServers : config.servers).slice(0, 6);
  const onlinePlayers = serverPool.reduce((sum, server) => sum + Number(server.players || 0), 0);
  const capacity = serverPool.reduce((sum, server) => sum + Number(server.capacity || 0), 0);
  const occupancy = capacity ? Math.round((onlinePlayers / capacity) * 100) : 0;
  const onlineServers = serverPool.filter((server) => server.state === "ONLINE").length;
  const shortcutCards = config.cards.slice(0, 4);

  const highlights = [
    { label: "Live servers", value: String(serverPool.length), note: bridgeReady ? "bridge data" : "fallback widgets", icon: "server" as const },
    { label: "Online players", value: String(onlinePlayers), note: capacity ? `${occupancy}% occupancy` : "awaiting traffic", icon: "users" as const },
    { label: "Staff profiles", value: String(staff.length), note: staff.length ? "public team page ready" : "add from admin panel", icon: "staff" as const },
    { label: "Moderation records", value: String(moderation.length), note: moderation.length ? "live stored actions" : "no fake logs shown", icon: "shield" as const },
  ];

  const readiness = [
    { title: "Steam sign-in", status: "READY", note: "OpenID login page is active." },
    { title: "CS2 bridge", status: bridgeReady ? "CONNECTED" : "PENDING", note: bridgeReady ? "Live server / loadout sync endpoint configured." : "Set CS2_BRIDGE_URL to connect plugin data." },
    { title: "Admin editing", status: "READY", note: "Homepage links, Discord URL, widgets and staff can be managed." },
    { title: "Fake demo content", status: "REMOVED", note: "Homepage avoids placeholder players / fake ladders." },
  ];

  return (
    <main className="page-wrap mono-home-page">
      {config.announcement.enabled && (
        <section className="mono-banner">
          <div>
            <span>{config.announcement.badge}</span>
            <strong>{config.announcement.title}</strong>
            <p>{config.announcement.body}</p>
          </div>
          <ExternalOrInternalLink href={config.announcement.buttonHref} className="mono-inline-action">
            <Icon name="discord" size={17} /> {config.announcement.buttonText || "Join Discord"}
          </ExternalOrInternalLink>
        </section>
      )}

      <section className="mono-hero-grid">
        <article className="mono-hero-block mono-hero-main">
          <span className="mono-kicker">WINGS / COMMUNITY PLATFORM</span>
          <h1>Build your hub.<br />Sharper, cleaner, better.</h1>
          <p>
            Homepage, server browser, community tools болон control хэсгүүдийг илүү цэвэр, modern хэлбэрт оруулж шинэчилсэн. Суурь нь dark / clean, харин skinchanger болон контентын өнгө хэвээр хадгалагдана.
          </p>
          <div className="mono-action-row">
            <Link href="/servers" className="page-button">Open servers <Icon name="arrow" size={14} /></Link>
            <a href={config.discordUrl} target="_blank" rel="noreferrer" className="ghost-button">
              <Icon name="discord" size={17} /> Join Discord
            </a>
            <Link href="/skinchanger" className="ghost-button">Skinchanger</Link>
          </div>
          <div className="mono-stat-grid">
            {highlights.map((item) => (
              <article key={item.label}>
                <i><Icon name={item.icon} size={18} /></i>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.note}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="mono-hero-block mono-hero-side">
          <div className="mono-panel-head">
            <div>
              <span>Network overview</span>
              <h2>Current state</h2>
            </div>
            <b>{bridgeReady ? "LIVE" : "SETUP"}</b>
          </div>
          <div className="mono-overview-stack">
            <div><span>Online servers</span><strong>{onlineServers}</strong></div>
            <div><span>Total slots</span><strong>{capacity || "—"}</strong></div>
            <div><span>Occupancy</span><strong>{capacity ? `${occupancy}%` : "—"}</strong></div>
          </div>
          <div className="mono-mini-list">
            {serverPool.length ? serverPool.slice(0, 4).map((server, index) => (
              <article key={`${server.id}-${index}`}>
                <div>
                  <strong>{server.name}</strong>
                  <small>{server.mode} · {server.map}</small>
                </div>
                <b>{server.players}/{server.capacity}</b>
              </article>
            )) : (
              <div className="mono-empty-compact">No server widgets configured yet.</div>
            )}
          </div>
        </article>
      </section>

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Shortcut panels</span>
            <h2>Core navigation</h2>
          </div>
          <Link href="/admin">Admin panel</Link>
        </div>
        <div className="mono-card-grid four">
          {shortcutCards.map((card) => (
            <ExternalOrInternalLink key={card.title} href={card.href} className="mono-nav-card">
              <i><Icon name={card.icon} size={20} /></i>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
              <span>Open <Icon name="arrow" size={14} /></span>
            </ExternalOrInternalLink>
          ))}
        </div>
      </section>

      <section className="mono-two-column">
        <article className="mono-section-block">
          <div className="mono-section-head">
            <div>
              <span>Readiness</span>
              <h2>Platform status</h2>
            </div>
          </div>
          <div className="mono-check-grid">
            {readiness.map((item) => (
              <article key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.note}</small>
                </div>
                <b>{item.status}</b>
              </article>
            ))}
          </div>
        </article>

        <article className="mono-section-block">
          <div className="mono-section-head">
            <div>
              <span>Next integration</span>
              <h2>CS2 skinchanger bridge</h2>
            </div>
            <Link href="/skinchanger">Open</Link>
          </div>
          <div className="mono-note-stack">
            <article><strong>Loadout save API</strong><p>`/api/loadout` already stores the current loadout and can sync to the bridge.</p></article>
            <article><strong>Catalog feeds</strong><p>Skins, stickers, charms, agents, music kits, medals all fetch from live CS2 catalog sources.</p></article>
            <article><strong>Plugin connection</strong><p>Set bridge env values and connect your CS2 plugin / relay service using COMMUNITY_INTEGRATION.md.</p></article>
          </div>
        </article>
      </section>
    </main>
  );
}
