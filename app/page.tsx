import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { getLiveServers, getModerationRecords } from "@/lib/community";
import { leaders } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function ExternalOrInternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const external = /^https?:\/\//i.test(href);
  return external
    ? <a href={href} className={className} target="_blank" rel="noreferrer">{children}</a>
    : <Link href={href || "/"} className={className}>{children}</Link>;
}

export default async function Home() {
  const [servers, moderation, config] = await Promise.all([getLiveServers(), getModerationRecords(), getSiteConfig()]);
  const onlineServers = servers.filter(server => server.state === "ONLINE");
  const configuredServers = config.servers.filter(server => server.state === "ONLINE");
  const board = onlineServers.length
    ? onlineServers.slice(0, 5).map(server => ({
        id: server.id,
        name: server.name,
        map: server.map || "MAP PENDING",
        mode: server.mode || "CS2",
        players: Number(server.players || 0),
        capacity: Number(server.capacity || 0),
        updated: server.ping == null ? "LIVE" : `${server.ping} ms`,
      }))
    : configuredServers.slice(0, 5).map(server => ({
        id: server.id,
        name: server.name,
        map: server.map,
        mode: server.mode,
        players: server.players,
        capacity: server.capacity,
        updated: `${server.ping} ms`,
      }));

  const playersOnline = board.reduce((sum, server) => sum + Number(server.players || 0), 0);
  const stats = [
    { label: "Total players", value: "498692", icon: "users" as const },
    { label: "Players in 7 d.", value: "17776", icon: "chart" as const },
    { label: "Players today", value: String(playersOnline || 2203), icon: "clock" as const },
    { label: "VIP players", value: "131", icon: "crown" as const, accent: true },
    { label: "Bans", value: String(moderation.length || 15383), icon: "ban" as const },
    { label: "Totally muted", value: "4241", icon: "staff" as const },
  ];

  return (
    <main className="wings-home">
      {config.announcement.enabled && (
        <section className="wings-announcement-bar wings-panel">
          <div className="wings-announcement-icon"><Icon name="spark" size={18} /></div>
          <div className="wings-announcement-copy">
            <span>{config.announcement.badge}</span>
            <strong>{config.announcement.title}</strong>
            <p>{config.announcement.body}</p>
          </div>
          {config.announcement.buttonHref && (
            <ExternalOrInternalLink href={config.announcement.buttonHref} className="wings-discord-button compact">
              <Icon name="discord" size={18} /> {config.announcement.buttonText || "JOIN DISCORD"}
            </ExternalOrInternalLink>
          )}
        </section>
      )}

      <section className="wings-home-hero">
        <div className="wings-hero-copy wings-panel">
          <span className="wings-tag"><i /> WINGS COMMUNITY</span>
          <h1>Тоглолтын шинэ орон зай.</h1>
          <p>
            WINGS бол CS2 community-д зориулсан modern hub — live server board, loadout tools,
            community staff, bans, clans болон rent system-ийг нэг дор илүү clean, premium
            байдлаар харуулсан шинэ хувилбар.
          </p>
          <div className="wings-hero-actions">
            <Link href="/servers" className="wings-primary-button">Play <Icon name="arrow" size={15} /></Link>
            <a href={config.discordUrl} target="_blank" rel="noreferrer" className="wings-discord-button">
              <Icon name="discord" size={19} /> Join Discord
            </a>
            <Link href="/skinchanger" className="wings-secondary-button">Skinchanger <Icon name="skin" size={15} /></Link>
          </div>
          <div className="wings-hero-pills">
            <span>Live servers</span>
            <span>Loadout system</span>
            <span>Community tools</span>
          </div>
        </div>

        <aside className="wings-network-card wings-panel">
          <div className="wings-network-head">
            <span>Network status</span>
            <b>ONLINE</b>
          </div>
          <div className="wings-network-grid">
            <article>
              <strong>{board.length}</strong>
              <small>Server modes</small>
            </article>
            <article>
              <strong>{playersOnline}</strong>
              <small>In game now</small>
            </article>
            <article>
              <strong>{moderation.length}</strong>
              <small>Moderation logs</small>
            </article>
            <article>
              <strong>24/7</strong>
              <small>Support window</small>
            </article>
          </div>
          <div className="wings-network-foot">
            <span>Ulaanbaatar · Mongolia</span>
            <Link href="/leaderboard">Open leaders</Link>
          </div>
        </aside>
      </section>

      <section className="wings-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className={stat.accent ? "wings-stat-card is-accent" : "wings-stat-card"}>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
            <i><Icon name={stat.icon} size={22} /></i>
          </article>
        ))}
      </section>

      <section className="wings-server-showcase">
        {board.map((server) => (
          <article key={server.id} className="wings-mode-card">
            <div className="wings-mode-top">
              <strong>{server.mode}</strong>
              <span>{server.players} in game</span>
            </div>
            <div className="wings-mode-art">
              <div className="wings-mode-glow" />
              <div className="wings-mode-emblem">{server.mode.slice(0, 2)}</div>
            </div>
            <h3>{server.name}</h3>
            <p>{server.map}</p>
            <div className="wings-mode-meta">
              <span>{server.players}/{server.capacity || 24} players</span>
              <small>{server.updated}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="wings-dashboard-grid">
        <article className="wings-donors-panel wings-panel">
          <div className="panel-title-row">
            <div>
              <span>Top players</span>
              <h2>Leaderboard focus</h2>
            </div>
            <Link href="/leaderboard">View all</Link>
          </div>
          <div className="wings-donor-tabs">
            <button className="active">7 days</button>
            <button>30 days</button>
            <button>All time</button>
          </div>
          <div className="wings-donor-list">
            {leaders.slice(0, 3).map((leader) => (
              <article key={leader.rank}>
                <div className="wings-avatar-mini">{leader.name.slice(0, 1)}</div>
                <div>
                  <strong>{leader.name}</strong>
                  <small>{leader.tag} · {leader.rating} rating</small>
                </div>
                <b>#{leader.rank}</b>
              </article>
            ))}
          </div>
        </article>

        <article className="wings-spotlight-panel wings-panel">
          <div className="wings-spotlight-copy">
            <span>Featured tool</span>
            <h2>Skinchanger</h2>
            <p>Loadout-аа categories, rarity, charms, stickers, agents болон music kits-тайгаар илүү premium хэлбэрээр хар.</p>
            <Link href="/skinchanger" className="wings-primary-button small">Open skins <Icon name="arrow" size={14} /></Link>
          </div>
          <div className="wings-spotlight-art">
            <div className="spotlight-blade" />
            <div className="spotlight-orb orb-a" />
            <div className="spotlight-orb orb-b" />
          </div>
        </article>
      </section>

      <section className="wings-link-grid">
        {config.cards.map((card) => (
          <ExternalOrInternalLink href={card.href} key={card.title} className="wings-link-card">
            <div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
            <i><Icon name={card.icon} size={28} /></i>
          </ExternalOrInternalLink>
        ))}
      </section>

      <section className="wings-review-strip wings-panel">
        <div>
          <span>Community activity</span>
          <h2>Recent review / moderation feed</h2>
          <p>Backend data ирэх үед энэ хэсэг real review, event card, announcement болон latest moderation-оор дүүрэхээр бүтэцлэв.</p>
        </div>
        <div className="wings-mini-feed">
          {(moderation.slice(0, 3).length ? moderation.slice(0, 3) : [
            { id: "a", playerName: "system", reason: "Community announcement slot ready", issuedByName: "WINGS Core" },
            { id: "b", playerName: "staff", reason: "Admin panel redesign completed", issuedByName: "WINGS Panel" },
            { id: "c", playerName: "event", reason: "Server widgets are ready for live bridge", issuedByName: "WINGS Live" },
          ]).map((item) => (
            <article key={item.id}>
              <i />
              <div>
                <strong>{item.playerName}</strong>
                <small>{item.reason}</small>
              </div>
              <span>{item.issuedByName}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
