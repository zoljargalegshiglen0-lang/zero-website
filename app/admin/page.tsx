import Link from "next/link";
import { Icon } from "@/components/icon";
import { AdminStaffManager } from "@/components/admin-staff-manager";
import { AdminSiteConfigManager } from "@/components/admin-site-config-manager";
import { PageHeading, StatCard } from "@/components/page-heading";
import { requireAdminUser } from "@/lib/admin-auth";
import { getStaffMembers } from "@/lib/staff-store";
import { getLiveServers, getModerationRecords } from "@/lib/community";
import { getSiteConfig, siteConfigWritable } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const quickActions = [
  { href: "#site-config", title: "Site controls", text: "Discord, announcement, cards and server widgets.", icon: "settings" as const },
  { href: "#staff-manager", title: "Manage staff", text: "Steam verified staff add, reorder, remove.", icon: "staff" as const },
  { href: "/staff", title: "Public staff page", text: "Live team showcase page preview.", icon: "users" as const },
  { href: "/bans", title: "Moderation board", text: "Review bans, mutes and integrity feed.", icon: "shield" as const },
  { href: "/servers", title: "Server board", text: "Check public server cards and live widgets.", icon: "server" as const },
  { href: "/skinchanger", title: "Loadout preview", text: "Open skinchanger and test the new UI flow.", icon: "skin" as const },
];

const controlModules = [
  ["Homepage hero", "Live", "Main public dashboard redesigned"],
  ["Navigation system", "Live", "Sidebar + top utility header active"],
  ["Staff manager", "Live", "Owner can manage public staff showcase"],
  ["Moderation panel", "Ready", "Public database page connected"],
  ["Announcement manager", "Live", "Editable from owner control"],
  ["Storage bridge", "Optional", "Redis recommended for persistent edits"],
] as const;

async function AdminContent() {
  const user = await requireAdminUser();
  const [staff, liveServers, moderation, siteConfig] = await Promise.all([getStaffMembers(), getLiveServers(), getModerationRecords(), getSiteConfig()]);
  const online = liveServers.filter((server) => server.state === "ONLINE");

  return (
    <>
      <PageHeading
        icon="admin"
        eyebrow="WINGS CONTROL"
        title="ADMIN PANEL"
        description="Owner dashboard · staff control · public modules · design overview"
        actions={<a className="page-button" href="/api/admin/logout"><Icon name="admin" /> ГАРАХ</a>}
      />

      <section className="wings-admin-hero wings-panel">
        <div>
          <span>Signed in as</span>
          <h2>{user.displayName}</h2>
          <p>Шинэ WINGS design, public modules болон admin control блокуудыг эндээс удирдах бүтэцтэй болголоо.</p>
        </div>
        <div className="wings-admin-hero-meta">
          <article><strong>{staff.length}</strong><small>Staff entries</small></article>
          <article><strong>{online.length}</strong><small>Live servers</small></article>
          <article><strong>{moderation.length}</strong><small>Moderation logs</small></article>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard label="STAFF MEMBERS" value={String(staff.length)} note="public profiles" icon="staff" />
        <StatCard label="LIVE SERVERS" value={String(online.length)} note="network board" icon="server" tone="cyan" />
        <StatCard label="MODERATION" value={String(moderation.length)} note="stored records" icon="shield" tone="mint" />
        <StatCard label="SYSTEM" value="ONLINE" note="design + routes" icon="bolt" tone="amber" />
      </div>

      <section className="wings-admin-actions">
        {quickActions.map((item) => (
          <Link key={item.title} href={item.href} className="wings-admin-action-card">
            <i><Icon name={item.icon} size={20} /></i>
            <div>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
            <Icon name="arrow" size={14} />
          </Link>
        ))}
      </section>

      <section className="wings-admin-grid">
        <article className="wings-admin-panel">
          <div className="panel-title-row">
            <div>
              <span>System modules</span>
              <h2>What&apos;s inside</h2>
            </div>
          </div>
          <div className="wings-module-list">
            {controlModules.map(([title, state, description]) => (
              <article key={title}>
                <div>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </div>
                <b>{state}</b>
              </article>
            ))}
          </div>
        </article>

        <article className="wings-admin-panel">
          <div className="panel-title-row">
            <div>
              <span>Recommended next steps</span>
              <h2>Admin expansion</h2>
            </div>
          </div>
          <ul className="wings-check-list">
            <li><Icon name="check" size={16} /> Add real CS2 bridge to fill live server widgets.</li>
            <li><Icon name="check" size={16} /> Connect Upstash Redis if staff changes must persist on Vercel.</li>
            <li><Icon name="check" size={16} /> Announcement manager and homepage cards are now editable here.</li>
            <li><Icon name="check" size={16} /> Expand moderation panel with revoke / filter controls if needed.</li>
            <li><Icon name="check" size={16} /> Discord invite is connected to the supplied WINGS community link.</li>
          </ul>
        </article>
      </section>

      <AdminSiteConfigManager initialConfig={siteConfig} writable={siteConfigWritable()} />
      <AdminStaffManager initialStaff={staff} />
    </>
  );
}

export default function AdminPage() {
  return <main className="page-wrap"><AdminContent /></main>;
}
