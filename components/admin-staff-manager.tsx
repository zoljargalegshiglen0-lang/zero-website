"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import type { StaffMember } from "@/lib/staff-store";

type SteamPreview = { steamId64:string; name:string; profileUrl:string; avatarFull:string; avatar:string };
const initialForm = { steam:"", role:"", department:"Moderation", bio:"", color:"violet", sortOrder:100 };

export function AdminStaffManager({ initialStaff }: { initialStaff: StaffMember[] }) {
  const router=useRouter();
  const[staff,setStaff]=useState(initialStaff);
  const[form,setForm]=useState(initialForm);
  const[status,setStatus]=useState("");
  const[saving,setSaving]=useState(false);
  const[checking,setChecking]=useState(false);
  const[preview,setPreview]=useState<SteamPreview|null>(null);

  async function checkSteam(){
    if(!form.steam.trim())return setStatus("SteamID64 эсвэл Steam profile link оруулна уу.");
    setChecking(true);setStatus("");setPreview(null);
    const response=await fetch("/api/admin/steam-profile",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({steam:form.steam})});
    const data=await response.json().catch(()=>({}));
    if(response.ok)setPreview(data.profile);else setStatus(data.error??"Steam profile олдсонгүй.");
    setChecking(false);
  }

  async function submit(event:FormEvent){
    event.preventDefault();setSaving(true);setStatus("");
    const response=await fetch("/api/staff",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
    const data=await response.json().catch(()=>({}));
    if(response.ok){
      const profile=data.profile as SteamPreview;
      setStaff(old=>[...old,{id:data.id,createdAt:Date.now(),name:profile.name,steamName:profile.name,steamId64:profile.steamId64,steamAvatar:profile.avatarFull,steamProfileUrl:profile.profileUrl,role:form.role,department:form.department,bio:form.bio,initials:profile.name.split(/\s+/).slice(0,2).map(v=>v[0]).join("").toUpperCase(),color:form.color,sortOrder:form.sortOrder}]);
      setForm(initialForm);setPreview(null);setStatus("Steam staff profile амжилттай нэмэгдлээ.");router.refresh();
    } else setStatus(data.error??"Хадгалж чадсангүй.");
    setSaving(false);
  }

  async function remove(id:string){
    const response=await fetch(`/api/staff/${encodeURIComponent(id)}`,{method:"DELETE"});
    if(response.ok){setStaff(old=>old.filter(member=>member.id!==id));setStatus("Staff member устгагдлаа.");router.refresh()}else{const data=await response.json().catch(()=>({}));setStatus(data.error??"Устгаж чадсангүй.")}
  }

  return <section id="staff-manager" className="admin-staff-shell">
    <div className="wings-admin-manager-head wings-panel">
      <div>
        <span>Staff control</span>
        <h2>Steam staff manager</h2>
        <p>Public team page-д гарах staff-уудаа Steam profile-аас fetch хийгээд, role / department / order-оор нь удирдана.</p>
      </div>
      <div className="wings-admin-manager-actions">
        <Link href="/staff" className="wings-secondary-button small">Open public page</Link>
        <Link href="/admin/login" className="wings-ghost-link">Re-auth</Link>
      </div>
    </div>

    <div className="admin-layout">
      <section className="admin-form-panel">
        <div className="admin-panel-title"><span><Icon name="plus"/> STEAM STAFF MEMBER</span><small>Steam profile-аас автоматаар танина</small></div>
        <form onSubmit={submit} className="admin-form">
          <label><span>STEAMID64 / PROFILE LINK</span><div className="steam-resolve-row"><input required maxLength={180} value={form.steam} onChange={e=>{setForm({...form,steam:e.target.value});setPreview(null)}} placeholder="7656119... эсвэл steamcommunity profile link"/><button type="button" onClick={checkSteam} disabled={checking}>{checking?"CHECKING...":"FETCH STEAM"}</button></div></label>
          {preview&&<div className="admin-steam-preview"><img src={preview.avatarFull||preview.avatar} alt=""/><div><span>STEAM PROFILE FOUND</span><strong>{preview.name}</strong><small>{preview.steamId64}</small><a href={preview.profileUrl} target="_blank" rel="noreferrer">OPEN PROFILE ↗</a></div></div>}
          <div className="staff-core-fields">
            <label><span>ROLE</span><input required maxLength={60} value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="Senior Moderator"/></label>
            <label><span>DEPARTMENT</span><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}><option>Leadership</option><option>Development</option><option>Operations</option><option>Moderation</option><option>Integrity</option><option>Community</option></select></label>
          </div>
          <label><span>SHORT BIO</span><textarea required maxLength={180} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Ямар үүрэг хариуцдаг тухай..."/></label>
          <details className="staff-advanced"><summary>APPEARANCE / ORDER</summary><div className="form-split"><label><span>COLOR</span><select value={form.color} onChange={e=>setForm({...form,color:e.target.value})}><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="mint">Mint</option><option value="amber">Amber</option><option value="pink">Pink</option></select></label><label><span>SORT ORDER</span><input type="number" min="1" max="999" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/></label></div></details>
          <button disabled={saving||!preview} type="submit">{saving?"ХАДГАЛЖ БАЙНА...":"ADD STEAM STAFF"}<Icon name="arrow" size={15}/></button>
          {!preview && <p className="staff-fetch-hint">Steam profile-оо эхлээд <b>FETCH STEAM</b> хийж баталгаажуулна.</p>}
          {status && status.includes("UPSTASH") ? <div className="rage-storage-warning"><i><Icon name="bolt" size={15}/></i><div><strong>CLOUD STORAGE ХОЛБОГДООГҮЙ</strong><span>Staff өөрчлөлтийг deploy хооронд хадгалах бол Vercel project дээр Redis storage холбоно.</span><small>Setup: Vercel → Storage → Upstash Redis → Connect → Redeploy</small></div></div> : status && <p className="form-status">{status}</p>}
        </form>
      </section>
      <section className="admin-list-panel"><div className="admin-panel-title"><span><Icon name="staff"/> CURRENT TEAM</span><small>{staff.length} members</small></div><div className="admin-staff-list">{staff.map(member=><article key={member.id}>{member.steamAvatar?<img className="admin-staff-avatar" src={member.steamAvatar} alt=""/>:<i className={`mini-avatar mini-${member.color}`}>{member.initials}</i>}<div><strong>{member.steamName||member.name}</strong><span>{member.role} · {member.department}</span>{member.steamId64&&<small>STEAM · {member.steamId64}</small>}</div><b>#{member.sortOrder}</b><button onClick={()=>remove(member.id)} aria-label={`${member.name} устгах`}><Icon name="trash" size={16}/></button></article>)}</div></section>
    </div>
  </section>;
}
