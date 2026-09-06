import Link from "next/link";
import { Icon } from "@/components/icon";
import { AdminSiteConfigManager } from "@/components/admin-site-config-manager";
import { AdminStaffManager } from "@/components/admin-staff-manager";
import { PageHeading } from "@/components/page-heading";
import { getModerationRecords, getLiveServers } from "@/lib/community";
import { requireAdminUser } from "@/lib/admin-auth";
import { getSiteConfig, siteConfigWritable } from "@/lib/site-config";
import { getStaffMembers } from "@/lib/staff-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminUser();
  const [staff, liveServers, moderation, config] = await Promise.all([
    getStaffMembers(),
    getLiveServers(),
    getModerationRecords(),
    getSiteConfig(),
  ]);

  const bridgeReady = Boolean(process.env.CS2_BRIDGE_URL);
  const storageReady = siteConfigWritable();
  const steamReady = Boolean(process.env.STEAM_REALM || process.env.STEAM_WEB_API_KEY);

  const metrics = [
    { label: "LIVE SERVERS", value: String(liveServers.length), note: bridgeReady ? "bridge connected" : "fallback mode" },
    { label: "STAFF", value: String(staff.length), note: "public profiles" },
    { label: "MOD ACTIONS", value: String(moderation.length), note: "stored records" },
    { label: "STORAGE", value: storageReady ? "READY" : "SETUP", note: "persistent edits" },
  ];

  const integrations = [
    { title: "Steam sign-in", state: steamReady ? "READY" : "SETUP", note: "Login + profile enrichment" },
    { title: "Persistent storage", state: storageReady ? "READY" : "SETUP", note: "Required for durable edits on Vercel" },
    { title: "CS2 bridge", state: bridgeReady ? "READY" : "PENDING", note: "Live servers and loadout sync" },
    { title: "Skinchanger bridge", state: "READY", note: "Endpoints documented in COMMUNITY_INTEGRATION.md" },
  ];

  const quickLinks = [
    { href: "/servers", title: "Servers", text: "Open live server directory", icon: "server" as const },
    { href: "/bans", title: "Moderation", text: "Review stored actions", icon: "shield" as const },
    { href: "/skinchanger", title: "Skinchanger", text: "Preview public loadout studio", icon: "skin" as const },
    { href: "/staff", title: "Staff", text: "Open public team page", icon: "staff" as const },
  ];

  return (
    <main className="page-wrap admin-v8-page">
      <PageHeading
        icon="admin"
        eyebrow="OWNER CONTROL"
        title="ADMIN"
        description="Website controls · staff management · integrations"
        actions={<a className="page-button" href="/api/admin/logout"><Icon name="admin" size={15} /> LOG OUT</a>}
      />

      <section className="admin-v8-command">
        <article className="admin-v8-owner">
          <span>OWNER SESSION</span>
          <h2>{user.displayName}</h2>
          <p>Site control болон integration state-үүдийг нэг compact dashboard дээр харуулна.</p>
          <div className="admin-v8-owner-actions">
            <Link href="/">Homepage</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </article>

        <div className="admin-v8-metric-grid">
          {metrics.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-v8-main-grid">
        <article className="admin-v8-panel">
          <div className="admin-v8-panel-head">
            <div><span>INTEGRATIONS</span><h2>System readiness</h2></div>
          </div>
          <div className="admin-v8-status-list">
            {integrations.map((item) => (
              <article key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.note}</small>
                </div>
                <b>{item.state}</b>
              </article>
            ))}
          </div>
        </article>

        <article className="admin-v8-panel">
          <div className="admin-v8-panel-head">
            <div><span>QUICK ACCESS</span><h2>Public tools</h2></div>
          </div>
          <div className="admin-v8-quick-grid">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                <i><Icon name={item.icon} size={18} /></i>
                <div><strong>{item.title}</strong><small>{item.text}</small></div>
                <Icon name="arrow" size={13} />
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-v8-editors">
        <AdminSiteConfigManager initialConfig={config} writable={storageReady} />
        <AdminStaffManager initialStaff={staff} />
      </section>
    </main>
  );
}
