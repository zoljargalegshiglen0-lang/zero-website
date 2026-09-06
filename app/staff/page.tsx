import { Icon } from "@/components/icon";
import { PageHeading, StatCard } from "@/components/page-heading";
import { getStaffMembers } from "@/lib/staff-store";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await getStaffMembers();
  const departments = new Set(staff.map(member => member.department)).size;

  return <main className="page-wrap"><PageHeading icon="staff" eyebrow="TEAM WINGS" title="STAFF TEAM" description="Verified Steam profiles · community team" />
    <div className="stats-grid"><StatCard label="TEAM MEMBERS" value={String(staff.length)} note="active staff" icon="staff" /><StatCard label="DEPARTMENTS" value={String(departments)} note="specialized teams" icon="settings" tone="cyan" /><StatCard label="STEAM VERIFIED" value={String(staff.filter(member=>member.steamId64).length)} note="linked profiles" icon="shield" tone="mint" /><StatCard label="COVERAGE" value="24 / 7" note="moderation" icon="clock" tone="amber" /></div>
    <div className="steam-staff-grid">{staff.map((member,index)=><article className={`steam-staff-card staff-${member.color}`} key={member.id}>
      <span className="staff-number">{String(index+1).padStart(2,"0")}</span>
      <div className="steam-staff-cover"><div className="steam-staff-glow" />{member.steamAvatar?<img src={member.steamAvatar} alt=""/>:<div className="steam-staff-fallback">{member.initials}</div>}<span>{member.department}</span></div>
      <div className="steam-staff-body"><div className="steam-staff-name"><div><small>{member.steamId64?"STEAM VERIFIED":"WINGS STAFF"}</small><h2>{member.steamName||member.name}</h2></div>{member.steamId64&&<i title="Steam verified">✓</i>}</div><strong>{member.role}</strong><p>{member.bio}</p>{member.steamId64&&<code>{member.steamId64}</code>}
        <div className="steam-staff-foot"><span><i /> TEAM WINGS</span>{member.steamProfileUrl?<a href={member.steamProfileUrl} target="_blank" rel="noreferrer">STEAM PROFILE <Icon name="arrow" size={14}/></a>:<button aria-label="Profile"><Icon name="arrow" size={14}/></button>}</div>
      </div>
    </article>)}</div>
    <section className="join-staff"><div><span>JOIN TEAM WINGS</span><h2>STAFF БОЛОХЫГ ХҮСЭЖ БАЙНА УУ?</h2><p>Discord announcement-аар мэдээлнэ.</p></div><a href="https://discord.gg/tFNYKQpHZe" target="_blank" rel="noreferrer"><Icon name="discord" size={18} /> JOIN DISCORD <Icon name="arrow" size={15} /></a></section>
  </main>;
}
