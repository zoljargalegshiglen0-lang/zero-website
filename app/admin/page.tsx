import Link from "next/link";
import { Icon } from "@/components/icon";
import { AdminStaffManager } from "@/components/admin-staff-manager";
import { AdminSiteConfigManager } from "@/components/admin-site-config-manager";
import { PageHeading } from "@/components/page-heading";
import { requireAdminUser } from "@/lib/admin-auth";
import { getStaffMembers } from "@/lib/staff-store";
import { getLiveServers, getModerationRecords } from "@/lib/community";
import { getSiteConfig, siteConfigWritable } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const quickActions = [
  { href: "#site-config", title: "Website Control", text: "Announcement, cards, Discord, server widgets.", icon: "settings" as const, tag: "CONTENT" },
  { href: "#staff-manager", title: "Staff Manager", text: "Steam verified staff create / remove / order.", icon: "staff" as const, tag: "TEAM" },
  { href: "/bans", title: "Moderation", text: "Ban, mute, gag, silence history and staff actions.", icon: "shield" as const, tag: "INTEGRITY" },
  { href: "/servers", title: "Server Board", text: "Live queue preview and bridge fallback state.", icon: "server" as const, tag: "LIVE" },
  { href: "/skinchanger", title: "Loadout Studio", text: "Preview the public skinchanger experience.", icon: "skin" as const, tag: "COSMETICS" },
  { href: "/leaderboard", title: "Player Ranking", text: "Season ladder and public competitive board.", icon: "trophy" as const, tag: "RANKING" },
];

async function AdminContent() {
  const user = await requireAdminUser();
  const [staff, liveServers, moderation, siteConfig] = await Promise.all([
    getStaffMembers(),
    getLiveServers(),
    getModerationRecords(),
    getSiteConfig(),
  ]);

  const online = liveServers.filter((server) => server.state === "ONLINE");
  const fallbackOnline = siteConfig.servers.filter((server) => server.state === "ONLINE");
  const storageReady = siteConfigWritable();
  const steamReady = Boolean(process.env.STEAM_WEB_API_KEY);
  const bridgeReady = Boolean(process.env.CS2_BRIDGE_URL);
  const discordReady = Boolean(siteConfig.discordUrl);

  const health = [
    { label: "Production", state: "ONLINE", note: "Next.js app", icon: "bolt" as const, ready: true },
    { label: "Storage", state: storageReady ? "READY" : "SETUP", note: storageReady ? "persistent edits" : "Upstash required on Vercel", icon: "settings" as const, ready: storageReady },
    { label: "Steam API", state: steamReady ? "READY" : "OPTIONAL", note: steamReady ? "profile enrichment" : "login still works via OpenID", icon: "steam" as const, ready: steamReady },
    { label: "CS2 Bridge", state: bridgeReady ? "LIVE" : "FALLBACK", note: bridgeReady ? "real server feed" : "site-config widgets", icon: "server" as const, ready: bridgeReady },
  ];

  return (
    <>
      <PageHeading
        icon="admin"
        eyebrow="OWNER COMMAND CENTER"
        title="ADMIN PANEL"
        description="Content control · staff · moderation · live services · deployment health"
        actions={<a className="page-button" href="/api/admin/logout"><Icon name="admin" /> LOG OUT</a>}
      />

      <section className="admin-v4-hero">
        <div className="admin-v4-copy">
          <span>WINGS CONTROL NODE / OWNER SESSION</span>
          <h2>Command the whole hub from one place.</h2>
          <p>Public site content, live server fallback, community links, staff profiles болон moderation pipeline-ийг нэг dashboard hierarchy дотор төвлөрүүлэв.</p>
          <div className="admin-v4-session">
            <i><Icon name="admin" size={20} /></i>
            <div><span>Signed in as</span><strong>{user.displayName}</strong></div>
            <b>OWNER</b>
          </div>
        </div>

        <div className="admin-v4-metrics">
          <article><span>Staff</span><strong>{staff.length}</strong><small>public team profiles</small></article>
          <article><span>Servers</span><strong>{online.length || fallbackOnline.length}</strong><small>{bridgeReady ? "live bridge" : "fallback widgets"}</small></article>
          <article><span>Moderation</span><strong>{moderation.length}</strong><small>stored records</small></article>
          <article><span>Community</span><strong>{discordReady ? "LINKED" : "SETUP"}</strong><small>Discord invite</small></article>
        </div>
      </section>

      <section className="admin-v4-health-grid">
        {health.map((item) => (
          <article key={item.label} className={item.ready ? "ready" : "optional"}>
            <i><Icon name={item.icon} size={20} /></i>
            <div>
              <span>{item.label}</span>
              <strong>{item.state}</strong>
              <small>{item.note}</small>
            </div>
            <b />
          </article>
        ))}
      </section>

      <section className="admin-v4-actions">
        {quickActions.map((item) => (
          <Link key={item.title} href={item.href} className="admin-v4-action-card">
            <div className="admin-v4-action-top"><span>{item.tag}</span><Icon name="arrow" size={14} /></div>
            <i><Icon name={item.icon} size={22} /></i>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </Link>
        ))}
      </section>

      <section className="admin-v4-grid">
        <article className="admin-v4-panel">
          <div className="admin-v4-panel-head">
            <div><span>PUBLIC SYSTEM</span><h2>Current site state</h2></div>
            <Link href="/">Open homepage</Link>
          </div>
          <div className="admin-v4-status-list">
            <article><div><strong>Homepage announcement</strong><small>{siteConfig.announcement.title}</small></div><b>{siteConfig.announcement.enabled ? "VISIBLE" : "HIDDEN"}</b></article>
            <article><div><strong>Editable quick cards</strong><small>{siteConfig.cards.length} homepage shortcuts configured</small></div><b>READY</b></article>
            <article><div><strong>Server widgets</strong><small>{siteConfig.servers.length} fallback definitions</small></div><b>{bridgeReady ? "BRIDGE" : "FALLBACK"}</b></article>
            <article><div><strong>Community Discord</strong><small>{siteConfig.discordUrl || "Not configured"}</small></div><b>{discordReady ? "LINKED" : "SETUP"}</b></article>
          </div>
        </article>

        <article className="admin-v4-panel">
          <div className="admin-v4-panel-head">
            <div><span>DEPLOYMENT</span><h2>Vercel readiness</h2></div>
            <span className="admin-v4-small-badge">GITHUB → VERCEL</span>
          </div>
          <div className="admin-v4-checklist">
            <article><Icon name="check" size={15} /><div><strong>Next.js production structure</strong><small>Root app/package/public structure ready.</small></div></article>
            <article><Icon name="check" size={15} /><div><strong>Environment-safe defaults</strong><small>Optional integrations fall back gracefully.</small></div></article>
            <article><Icon name="check" size={15} /><div><strong>Persistent editing path</strong><small>Use Upstash Redis on Vercel for admin edits.</small></div></article>
            <article><Icon name="check" size={15} /><div><strong>Auto deploy workflow</strong><small>Push main branch → Vercel rebuilds production.</small></div></article>
          </div>
        </article>
      </section>

      <AdminSiteConfigManager initialConfig={siteConfig} writable={storageReady} />
      <AdminStaffManager initialStaff={staff} />
    </>
  );
}

export default function AdminPage() {
  return <main className="page-wrap admin-v4-page"><AdminContent /></main>;
}
