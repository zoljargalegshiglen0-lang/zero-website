import { cookies } from "next/headers";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";
import { getPlayerCommunityProfile, getUserLoadout } from "@/lib/community";
import { getSteamProfile } from "@/lib/steam";

export const dynamic = "force-dynamic";

function timeLabel(seconds: number | null) {
  if (seconds === null) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default async function ProfilePage() {
  const store = await cookies();
  const steamId = store.get("zero_steam_id")?.value ?? "";

  if (!steamId) {
    return (
      <main className="page-wrap">
        <PageHeading icon="staff" eyebrow="PLAYER ACCOUNT" title="PROFILE" description="Steam account required" />
        <div className="mono-empty-panel large">
          <i><Icon name="steam" size={28} /></i>
          <strong>Steam account not linked</strong>
          <p>Нэвтэрсний дараа profile, saved loadout, community stats энд гарна.</p>
          <Link className="page-button" href="/login">Sign in with Steam</Link>
        </div>
      </main>
    );
  }

  let steam: any = { steamId64: steamId, name: "Steam User", profileUrl: `https://steamcommunity.com/profiles/${steamId}/`, avatarFull: "", personaState: 0 };
  try { steam = await getSteamProfile(steamId); } catch {}

  const stats = await getPlayerCommunityProfile(steamId);
  const loadout: any = await getUserLoadout(steamId);
  const equippedCount = loadout?.version === 2 && loadout?.equipped ? Object.keys(loadout.equipped).length : Object.keys(loadout || {}).length;

  return (
    <main className="page-wrap">
      <PageHeading icon="staff" eyebrow="PLAYER IDENTITY" title="PROFILE" description="Steam identity, loadout sync, community stats" />

      <section className="mono-profile-shell">
        <article className="mono-profile-hero">
          <div className="mono-profile-avatar">
            {steam.avatarFull ? <img src={steam.avatarFull} alt="" /> : <span>S</span>}
          </div>
          <div>
            <span>Steam verified</span>
            <h2>{steam.name}</h2>
            <p>{steam.steamId64}</p>
            <div className="mono-inline-links">
              <a className="ghost-button" href={steam.profileUrl} target="_blank" rel="noreferrer">Steam profile</a>
              <Link className="page-button" href="/skinchanger">Open skinchanger</Link>
            </div>
          </div>
        </article>

        <div className="mono-card-grid four">
          <article className="mono-info-card"><strong>{timeLabel(stats.playtimeSeconds)}</strong><p>Playtime</p></article>
          <article className="mono-info-card"><strong>{stats.kd === null ? "—" : stats.kd.toFixed(2)}</strong><p>K / D ratio</p></article>
          <article className="mono-info-card"><strong>{stats.matches ?? "—"}</strong><p>Matches</p></article>
          <article className="mono-info-card"><strong>{equippedCount}</strong><p>Saved loadout items</p></article>
        </div>

        <div className="mono-two-column">
          <article className="mono-section-block">
            <div className="mono-section-head"><div><span>Recent maps</span><h2>Performance</h2></div></div>
            {stats.recentMaps.length ? (
              <div className="mono-record-list">
                {stats.recentMaps.slice(0, 10).map((map, index) => (
                  <article key={`${map.map}-${map.playedAt || index}`} className="mono-record-card">
                    <div className="mono-record-top"><strong>{map.map}</strong><b>{map.result || "—"}</b></div>
                    <div className="mono-record-meta">
                      <span>{map.kills} K</span>
                      <span>{map.deaths} D</span>
                      <span>{map.assists ?? 0} A</span>
                      <span>{map.playedAt ? new Date(map.playedAt).toLocaleDateString() : ""}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mono-empty-compact">No recent community stats yet.</div>
            )}
          </article>

          <article className="mono-section-block">
            <div className="mono-section-head"><div><span>Community sync</span><h2>Status</h2></div></div>
            <div className="mono-note-stack">
              <article><strong>Steam link</strong><p>Account connected and usable for site features.</p></article>
              <article><strong>Loadout save</strong><p>{equippedCount ? `${equippedCount} item selection saved.` : "No saved selections yet."}</p></article>
              <article><strong>Faceit / extra stats</strong><p>{stats.faceitLevel !== null ? `Level ${stats.faceitLevel} · ${stats.faceitElo ?? "—"} ELO` : "Not connected yet."}</p></article>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
