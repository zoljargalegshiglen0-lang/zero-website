import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";
import { getStaffMembers } from "@/lib/staff-store";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await getStaffMembers();
  const departments = Array.from(new Set(staff.map((member) => member.department).filter(Boolean)));

  return (
    <main className="page-wrap">
      <PageHeading icon="staff" eyebrow="STAFF DIRECTORY" title="STAFF TEAM" description="Steam-verified public team directory" />

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Public staff</span>
            <h2>Moderation and support team</h2>
          </div>
          <a className="ghost-button" href="https://discord.gg/tFNYKQpHZe" target="_blank" rel="noreferrer">
            <Icon name="discord" size={16} /> Join Discord
          </a>
        </div>

        <div className="mono-card-grid three">
          <article className="mono-info-card"><strong>{staff.length}</strong><p>Visible staff profiles</p></article>
          <article className="mono-info-card"><strong>{departments.length}</strong><p>Departments configured</p></article>
          <article className="mono-info-card"><strong>{staff.filter((member) => member.steamId64).length}</strong><p>Steam-linked members</p></article>
        </div>

        {staff.length ? (
          <div className="mono-card-grid three staff-grid-v6">
            {staff.map((member) => (
              <article key={member.id} className="mono-staff-card">
                <div className="mono-staff-top">
                  {member.steamAvatar ? <img src={member.steamAvatar} alt="" /> : <span>{member.initials || member.name.slice(0, 2).toUpperCase()}</span>}
                  <div>
                    <strong>{member.steamName || member.name}</strong>
                    <small>{member.role}</small>
                  </div>
                </div>
                <p>{member.bio}</p>
                <div className="mono-staff-meta">
                  <span>{member.department}</span>
                  <b>{member.steamId64 ? "STEAM VERIFIED" : "MANUAL"}</b>
                </div>
                {member.steamProfileUrl ? <a href={member.steamProfileUrl} target="_blank" rel="noreferrer">Steam profile <Icon name="arrow" size={14} /></a> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mono-empty-panel large">
            <i><Icon name="staff" size={28} /></i>
            <strong>No staff profiles published</strong>
            <p>Admin panel-аас staff members нэмбэл энэ page дээр автоматаар гарна.</p>
          </div>
        )}
      </section>
    </main>
  );
}
