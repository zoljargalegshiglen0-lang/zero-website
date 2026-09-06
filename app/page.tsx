import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { getLiveServers } from "@/lib/community";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const external = /^https?:\/\//i.test(href);
  return external
    ? <a href={href} className={className} target="_blank" rel="noreferrer">{children}</a>
    : <Link href={href || "/"} className={className}>{children}</Link>;
}

export default async function Home() {
  const [liveServers, config] = await Promise.all([getLiveServers(), getSiteConfig()]);
  const servers = (liveServers.length ? liveServers : config.servers).slice(0, 6);
  const onlinePlayers = servers.reduce((sum, server) => sum + Number(server.players || 0), 0);
  const capacity = servers.reduce((sum, server) => sum + Number(server.capacity || 0), 0);
  const occupancy = capacity ? Math.round((onlinePlayers / capacity) * 100) : 0;
  const onlineServers = servers.filter((server) => server.state === "ONLINE").length;

  const metrics = [
    { label: "Servers", value: String(onlineServers || servers.length).padStart(2, "0"), icon: "server" as const, tone: "blue" },
    { label: "Players online", value: String(onlinePlayers), icon: "users" as const, tone: "mint" },
    { label: "Occupancy", value: capacity ? `${occupancy}%` : "—", icon: "chart" as const, tone: "violet" },
    { label: "Season", value: "S01", icon: "trophy" as const, tone: "amber" },
  ];

  const quickLinks = [
    { title: "Skinchanger", text: "Loadout studio", href: "/skinchanger", icon: "skin" as const, tone: "violet" },
    { title: "Leaderboard", text: "Competitive ladder", href: "/leaderboard", icon: "trophy" as const, tone: "blue" },
    { title: "Clans", text: "Teams & rosters", href: "/clans", icon: "clan" as const, tone: "amber" },
    { title: "Membership", text: "Community tiers", href: "/membership", icon: "crown" as const, tone: "mint" },
  ];

  return (
    <main className="page-wrap home-v10">
      {config.announcement.enabled ? (
        <SmartLink href={config.announcement.buttonHref} className="v10-announcement">
          <div><span>{config.announcement.badge}</span><strong>{config.announcement.title}</strong></div>
          <Icon name="arrow" size={13} />
        </SmartLink>
      ) : null}

      <section className="v10-hero">
        <div className="v10-hero-bg" />
        <div className="v10-hero-content">
          <div className="v10-hero-copy">
            <span className="v10-eyebrow">WINGS / CS2 COMMUNITY</span>
            <h1>Play better.<br />Build your setup.</h1>
            <p>Servers, loadouts, clans, rankings and community tools — нэг premium hub дотор.</p>
            <div className="v10-actions">
              <Link href="/servers" className="v10-primary">Play now <Icon name="arrow" size={14} /></Link>
              <Link href="/skinchanger" className="v10-secondary"><Icon name="skin" size={15} /> Skinchanger</Link>
              <a href={config.discordUrl} target="_blank" rel="noreferrer" className="v10-secondary discord"><Icon name="discord" size={16} /> Discord</a>
            </div>
          </div>

          <div className="v10-hero-card">
            <div className="v10-hero-card-head">
              <div><span>NETWORK</span><strong>Live status</strong></div>
              <b><i /> ONLINE</b>
            </div>
            <div className="v10-hero-card-grid">
              <div><span>Players</span><strong>{onlinePlayers}</strong></div>
              <div><span>Servers</span><strong>{servers.length}</strong></div>
              <div><span>Slots</span><strong>{capacity || "—"}</strong></div>
            </div>
            <Link href="/servers" className="v10-hero-card-link">Browse servers <Icon name="arrow" size={13} /></Link>
          </div>
        </div>
      </section>

      <section className="v10-metrics">
        {metrics.map((item) => (
          <article key={item.label} className={`v10-metric tone-${item.tone}`}>
            <i><Icon name={item.icon} size={17} /></i>
            <div><span>{item.label}</span><strong>{item.value}</strong></div>
          </article>
        ))}
      </section>

      <section className="v10-section">
        <div className="v10-section-head">
          <div><span>LIVE SERVERS</span><h2>Find your match</h2></div>
          <Link href="/servers">View all <Icon name="arrow" size={13} /></Link>
        </div>

        <div className="v10-server-grid">
          {servers.length ? servers.map((server, index) => {
            const fill = server.capacity ? Math.min(100, Math.round((server.players / server.capacity) * 100)) : 0;
            return (
              <article key={`${server.id}-${index}`} className="v10-server-card">
                <div className="v10-server-map">
                  <span>{server.mode}</span>
                  <small>{server.map}</small>
                  <b>#{String(index + 1).padStart(2, "0")}</b>
                </div>
                <div className="v10-server-body">
                  <div className="v10-server-title">
                    <div><strong>{server.name}</strong><small>{server.map}</small></div>
                    <i className={server.state === "ONLINE" ? "online" : "offline"} />
                  </div>
                  <div className="v10-server-progress"><i style={{ width: `${fill}%` }} /></div>
                  <div className="v10-server-foot"><span>{server.players}/{server.capacity} players</span><b>{server.state}</b></div>
                </div>
              </article>
            );
          }) : <div className="v10-empty">No servers connected.</div>}
        </div>
      </section>

      <section className="v10-content-grid">
        <article className="v10-feature-card">
          <div className="v10-feature-copy">
            <span>LOADOUT STUDIO</span>
            <h2>Build your CS2 identity</h2>
            <p>Weapons, knives, gloves, stickers, charms, agents, music kits and medals.</p>
            <Link href="/skinchanger">Open skinchanger <Icon name="arrow" size={13} /></Link>
          </div>
          <div className="v10-feature-visual">
            <div className="v10-feature-orb"><Icon name="skin" size={34} /></div>
          </div>
        </article>

        <article className="v10-quick-panel">
          <div className="v10-section-head compact"><div><span>DISCOVER</span><h2>Quick access</h2></div></div>
          <div className="v10-quick-list">
            {quickLinks.map((item) => (
              <Link key={item.title} href={item.href} className={`v10-quick-row tone-${item.tone}`}>
                <i><Icon name={item.icon} size={16} /></i>
                <div><strong>{item.title}</strong><small>{item.text}</small></div>
                <Icon name="arrow" size={13} />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="v10-community-strip">
        <div>
          <span>WINGS COMMUNITY</span>
          <strong>Stay connected with the server.</strong>
        </div>
        <div className="v10-community-actions">
          <a href={config.discordUrl} target="_blank" rel="noreferrer"><Icon name="discord" size={16} /> Join Discord</a>
          <Link href="/staff">Staff team</Link>
          <Link href="/bans">Moderation</Link>
        </div>
      </section>
    </main>
  );
}
