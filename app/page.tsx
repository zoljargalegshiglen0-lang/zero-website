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

  const stats = [
    { label: "Servers", value: String(servers.length || 0).padStart(2, "0"), icon: "server" as const },
    { label: "Online", value: String(onlinePlayers), icon: "users" as const },
    { label: "Occupancy", value: capacity ? `${occupancy}%` : "—", icon: "chart" as const },
    { label: "Season", value: "S01", icon: "trophy" as const },
  ];

  const shortcuts = [
    { title: "Play", text: "Open live server browser", href: "/servers", icon: "server" as const, tone: "blue" },
    { title: "Skinchanger", text: "Build and save your loadout", href: "/skinchanger", icon: "skin" as const, tone: "violet" },
    { title: "Clans", text: "Teams, roster and rankings", href: "/clans", icon: "clan" as const, tone: "amber" },
    { title: "Discord", text: "Community, support and news", href: config.discordUrl, icon: "discord" as const, tone: "discord" },
  ];

  return (
    <main className="page-wrap home-v9">
      <section className="home-v9-hero">
        <div className="home-v9-copy">
          {config.announcement.enabled ? (
            <SmartLink href={config.announcement.buttonHref} className="home-v9-notice">
              <span>{config.announcement.badge}</span>
              <strong>{config.announcement.title}</strong>
              <Icon name="arrow" size={13} />
            </SmartLink>
          ) : null}

          <span className="home-v9-kicker">WINGS / CS2 COMMUNITY</span>
          <h1>Play. Build.<br /><em>Own your loadout.</em></h1>
          <p>Competitive servers, custom loadouts, clans, staff болон community tools — нэг clean hub дотор.</p>

          <div className="home-v9-actions">
            <Link href="/servers" className="home-v9-primary">Play now <Icon name="arrow" size={14} /></Link>
            <Link href="/skinchanger" className="home-v9-secondary"><Icon name="skin" size={16} /> Skinchanger</Link>
            <a href={config.discordUrl} target="_blank" rel="noreferrer" className="home-v9-secondary discord"><Icon name="discord" size={17} /> Discord</a>
          </div>

          <div className="home-v9-stats">
            {stats.map((stat) => (
              <article key={stat.label}>
                <i><Icon name={stat.icon} size={17} /></i>
                <div><span>{stat.label}</span><strong>{stat.value}</strong></div>
              </article>
            ))}
          </div>
        </div>

        <aside className="home-v9-live">
          <div className="home-v9-live-head">
            <div>
              <span>LIVE SERVERS</span>
              <h2>Find a match</h2>
            </div>
            <Link href="/servers">View all</Link>
          </div>

          <div className="home-v9-server-list">
            {servers.length ? servers.slice(0, 4).map((server, index) => (
              <article key={`${server.id}-${index}`}>
                <div className="home-v9-server-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="home-v9-server-copy">
                  <strong>{server.name}</strong>
                  <small>{server.mode} · {server.map}</small>
                </div>
                <div className="home-v9-server-count"><b>{server.players}</b><span>/{server.capacity}</span></div>
                <i className={server.state === "ONLINE" ? "online" : "offline"} />
              </article>
            )) : (
              <div className="home-v9-empty">No servers connected yet.</div>
            )}
          </div>

          <div className="home-v9-live-foot">
            <span><i /> Network status</span>
            <b>{servers.length ? "ONLINE" : "WAITING"}</b>
          </div>
        </aside>
      </section>

      <section className="home-v9-shortcuts">
        {shortcuts.map((item) => (
          <SmartLink key={item.title} href={item.href} className={`home-v9-shortcut tone-${item.tone}`}>
            <i><Icon name={item.icon} size={20} /></i>
            <div><strong>{item.title}</strong><span>{item.text}</span></div>
            <Icon name="arrow" size={14} />
          </SmartLink>
        ))}
      </section>

      <section className="home-v9-bottom-grid">
        <article className="home-v9-panel home-v9-featured">
          <div>
            <span>LOADOUT STUDIO</span>
            <h2>Build your CS2 setup</h2>
            <p>Weapons, knives, gloves, stickers, charms, agents, music kits болон medals нэг дор.</p>
            <Link href="/skinchanger" className="home-v9-text-link">Open studio <Icon name="arrow" size={14} /></Link>
          </div>
          <div className="home-v9-feature-mark"><Icon name="skin" size={34} /></div>
        </article>

        <article className="home-v9-panel home-v9-community">
          <div className="home-v9-live-head">
            <div><span>COMMUNITY</span><h2>Stay connected</h2></div>
          </div>
          <div className="home-v9-community-links">
            {config.cards.slice(0, 3).map((card) => (
              <SmartLink href={card.href} key={card.title} className="home-v9-community-row">
                <i><Icon name={card.icon} size={16} /></i>
                <div><strong>{card.title}</strong><small>{card.text}</small></div>
                <Icon name="arrow" size={13} />
              </SmartLink>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
