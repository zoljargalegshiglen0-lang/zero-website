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
  const liveServers = servers.filter((server) => server.state === "ONLINE");
  const fallbackServers = config.servers.filter((server) => server.state === "ONLINE");
  const board = (liveServers.length ? liveServers : fallbackServers).slice(0, 6).map((server, index) => ({
    id: server.id || String(index + 1).padStart(2, "0"),
    name: server.name,
    address: "address" in server ? server.address : `connect-${String(index + 1).padStart(2, "0")}`,
    map: server.map || "MAP PENDING",
    mode: server.mode || "CS2",
    players: Number(server.players || 0),
    capacity: Number(server.capacity || 12),
    ping: "ping" in server ? server.ping : 0,
    state: server.state,
  }));

  const totalPlayers = board.reduce((sum, server) => sum + server.players, 0);
  const totalCapacity = board.reduce((sum, server) => sum + server.capacity, 0);
  const occupancy = totalCapacity ? Math.round((totalPlayers / totalCapacity) * 100) : 0;
  const topThree = leaders.slice(0, 3);
  const featureStats = [
    { label: "Live servers", value: String(board.length).padStart(2, "0"), note: "queue endpoints", icon: "server" as const },
    { label: "Online players", value: totalPlayers.toLocaleString(), note: `${occupancy}% occupancy`, icon: "users" as const },
    { label: "Moderation logs", value: String(moderation.length || 15383), note: "integrity history", icon: "shield" as const },
    { label: "Active season", value: "S01", note: "2026 ranked cycle", icon: "trophy" as const },
  ];

  const pipelines = [
    { title: "Matchmaking", text: "Competitive, retake, 1v1 болон casual modes-ийг нэг unified browser дотор.", href: "/servers", icon: "server" as const },
    { title: "Loadout Studio", text: "Skin, sticker, charm, medal, agent бүгдийг premium flow-оор харна.", href: "/skinchanger", icon: "skin" as const },
    { title: "Community Identity", text: "Clan, leaderboard, staff, membership, moderation бүгд тус тусын page дээр илүү цэгцтэй.", href: "/leaderboard", icon: "spark" as const },
  ];

  return (
    <main className="page-wrap wings-home-v3">
      {config.announcement.enabled && (
        <section className="neo-alert-bar">
          <div className="neo-alert-copy">
            <span>{config.announcement.badge}</span>
            <strong>{config.announcement.title}</strong>
            <p>{config.announcement.body}</p>
          </div>
          <ExternalOrInternalLink href={config.announcement.buttonHref} className="neo-ghost-link">
            <Icon name="discord" size={18} /> {config.announcement.buttonText || "JOIN DISCORD"}
          </ExternalOrInternalLink>
        </section>
      )}

      <section className="neo-home-hero">
        <div className="neo-home-copy">
          <span className="neo-kicker">WINGS NETWORK / PLAY DIFFERENT</span>
          <h1>
            BUILD YOUR HUB.<br />
            <em>OWN THE COMMUNITY.</em>
          </h1>
          <p>
            Reference-ээс санаа аваад шууд хуулалгүйгээр илүү clean, esports premium,
            функц төвтэй WINGS homepage болголоо. Live server browser, community tools,
            staff control, bans болон skinchanger-г нэг ecosystem болгож нэгтгэлээ.
          </p>
          <div className="neo-hero-actions">
            <Link href="/servers" className="neo-primary-link">Join a Server <Icon name="arrow" size={15} /></Link>
            <a href={config.discordUrl} target="_blank" rel="noreferrer" className="neo-discord-link">
              <Icon name="discord" size={18} /> Join Discord
            </a>
            <Link href="/skinchanger" className="neo-outline-link">Open Skinchanger</Link>
          </div>
          <div className="neo-stat-ribbon">
            {featureStats.map((stat) => (
              <article key={stat.label}>
                <i><Icon name={stat.icon} size={18} /></i>
                <div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.note}</small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="neo-hero-stack">
          <article className="neo-hero-card emphasis">
            <div className="neo-card-topline">
              <span>Live network</span>
              <b>{liveServers.length ? "REAL DATA" : "FALLBACK MODE"}</b>
            </div>
            <div className="neo-brand-board">
              <div className="neo-brand-mark"><img src="/wings-mark.svg" alt="WINGS" /></div>
              <div>
                <strong>WINGS</strong>
                <p>Play sharp. Build your stack. Keep your hub responsive.</p>
              </div>
            </div>
            <div className="neo-live-summary">
              <div><span>Total players</span><strong>{totalPlayers}</strong></div>
              <div><span>Active servers</span><strong>{board.length}</strong></div>
              <div><span>Avg slot fill</span><strong>{occupancy}%</strong></div>
            </div>
            <div className="neo-card-footer">
              <span>Current target</span>
              <Link href="/staff">Open staff board</Link>
            </div>
          </article>

          <article className="neo-hero-card compact">
            <div className="neo-card-topline">
              <span>Top queue</span>
              <b>Featured</b>
            </div>
            {board.slice(0, 3).map((server) => (
              <div key={server.id} className="neo-queue-line">
                <div>
                  <strong>{server.name}</strong>
                  <small>{server.mode} · {server.map}</small>
                </div>
                <b>{server.players}/{server.capacity}</b>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section className="neo-service-strip">
        {pipelines.map((item) => (
          <Link key={item.title} href={item.href} className="neo-service-card">
            <i><Icon name={item.icon} size={20} /></i>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
            <Icon name="arrow" size={14} />
          </Link>
        ))}
      </section>

      <section className="neo-home-grid">
        <article className="neo-surface neo-server-surface">
          <div className="neo-surface-head">
            <div>
              <span>Server browser</span>
              <h2>Live matches</h2>
            </div>
            <Link href="/servers">Open full board</Link>
          </div>
          <div className="neo-server-grid">
            {board.map((server, index) => (
              <article key={`${server.id}-${index}`} className="neo-server-card">
                <div className="neo-server-thumb">
                  <span>{server.map}</span>
                  <b>{server.mode}</b>
                </div>
                <div className="neo-server-body">
                  <strong>{server.name}</strong>
                  <small>{server.players}/{server.capacity} players</small>
                  <div className="neo-progress"><i style={{ width: `${server.capacity ? Math.min(100, (server.players / server.capacity) * 100) : 0}%` }} /></div>
                  <div className="neo-server-meta">
                    <span>{typeof server.ping === "number" ? `${server.ping} ms` : "live"}</span>
                    <em>{server.state}</em>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="neo-surface neo-rank-surface">
          <div className="neo-surface-head">
            <div>
              <span>Competitive ladder</span>
              <h2>Top players</h2>
            </div>
            <Link href="/leaderboard">Full leaderboard</Link>
          </div>
          <div className="neo-podium-grid">
            {topThree.map((player) => (
              <article key={player.rank} className={`neo-podium-card podium-${player.rank}`}>
                <span>#{player.rank}</span>
                <strong>{player.name}</strong>
                <small>{player.tag}</small>
                <b>{player.rating.toLocaleString()} ELO</b>
                <p>{player.winRate}% WR · {player.kd.toFixed(2)} K/D</p>
              </article>
            ))}
          </div>
          <div className="neo-mini-feed-list">
            {leaders.slice(3, 7).map((player) => (
              <article key={player.rank}>
                <span>#{player.rank}</span>
                <div>
                  <strong>{player.name}</strong>
                  <small>{player.tag}</small>
                </div>
                <b>{player.rating}</b>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="neo-home-grid secondary">
        <article className="neo-surface neo-actions-surface">
          <div className="neo-surface-head">
            <div>
              <span>Quick access</span>
              <h2>Community panels</h2>
            </div>
            <Link href="/admin">Owner control</Link>
          </div>
          <div className="neo-quick-grid">
            {config.cards.map((card) => (
              <ExternalOrInternalLink href={card.href} key={card.title} className="neo-quick-card">
                <i><Icon name={card.icon} size={22} /></i>
                <div>
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                </div>
              </ExternalOrInternalLink>
            ))}
          </div>
        </article>

        <article className="neo-surface neo-notes-surface">
          <div className="neo-surface-head">
            <div>
              <span>System highlights</span>
              <h2>What changed</h2>
            </div>
          </div>
          <div className="neo-note-list">
            {[
              "Homepage-ийг илүү premium, roomy, less-copy layout болгож өргөтгөв.",
              "Servers, leaderboard, clans, membership, store, staff pages бүгд шинэ surface design-той болов.",
              "Skinchanger-ийн үндсэн flow-г хадгалж, ecosystem-ийг тойруулж шинэчлэв.",
              "Admin panel дотор site control болон staff manager хэвээр ажиллана.",
            ].map((item) => (
              <article key={item}><Icon name="check" size={16} /><span>{item}</span></article>
            ))}
          </div>
          <div className="neo-inline-cta-row">
            <a href={config.discordUrl} target="_blank" rel="noreferrer" className="neo-outline-link inline"><Icon name="discord" size={16} /> Discord</a>
            <Link href="/clans" className="neo-outline-link inline">Clans</Link>
            <Link href="/rent-server" className="neo-outline-link inline">Rent server</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
