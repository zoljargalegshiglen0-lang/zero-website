import { cookies } from "next/headers";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";
import { getSteamProfile } from "@/lib/steam";
import { getPlayerCommunityProfile, getUserLoadout } from "@/lib/community";

export const dynamic = "force-dynamic";
function fmtTime(sec:number|null){if(sec===null)return "—";const h=Math.floor(sec/3600);const m=Math.floor((sec%3600)/60);return `${h}h ${m}m`;}
function fmt(v:number|null,digits=0){return v===null?"—":v.toFixed(digits)}

export default async function ProfilePage(){
  const store=await cookies(); const steamId=store.get("zero_steam_id")?.value??"";
  if(!steamId)return <main className="page-wrap"><PageHeading icon="staff" eyebrow="WINGS ACCOUNT" title="PROFILE" description="Steam account-аа холбоно уу."/><section className="profile-empty"><strong>STEAM ACCOUNT ХОЛБОГДООГҮЙ</strong><p>Steam-ээр нэвтэрсний дараа profile автоматаар үүснэ.</p><Link className="page-button" href="/login">SIGN IN WITH STEAM <Icon name="arrow" size={14}/></Link></section></main>;

  let steam:any={steamId64:steamId,name:"Steam User",profileUrl:`https://steamcommunity.com/profiles/${steamId}/`,avatarFull:"",personaState:0,communityVisibilityState:0};
  try{steam=await getSteamProfile(steamId)}catch{}
  const stats=await getPlayerCommunityProfile(steamId); const loadout:any=await getUserLoadout(steamId); const equippedCount=loadout?.version===2&&loadout?.equipped?Object.keys(loadout.equipped).length:Object.keys(loadout||{}).length;
  return <main className="page-wrap profile-pro-page">
    <PageHeading icon="staff" eyebrow="WINGS IDENTITY" title="PLAYER PROFILE" description="Steam identity · community performance · loadout" actions={<a className="page-button" href="/api/auth/steam/logout">LOG OUT</a>}/>
    <section className="profile-pro-hero">
      <div className="profile-pro-avatar">{steam.avatarFull?<img src={steam.avatarFull} alt=""/>:<span>S</span>}<i className={steam.personaState>0?"online":"offline"}/></div>
      <div className="profile-pro-main"><span>STEAM VERIFIED</span><h1>{steam.name}</h1><p>{steam.steamId64}</p><div><a href={steam.profileUrl} target="_blank" rel="noreferrer">STEAM PROFILE ↗</a><Link href="/skinchanger">OPEN LOADOUT ↗</Link></div></div>
      <div className="profile-rank-orb"><span>FACEIT</span><strong>{stats.faceitLevel??"—"}</strong><small>{stats.faceitElo!==null?`${stats.faceitElo} ELO`:"NOT CONNECTED"}</small></div>
    </section>

    <section className="profile-metric-grid">
      <article><span>PLAYTIME</span><strong>{fmtTime(stats.playtimeSeconds)}</strong><small>community servers</small></article>
      <article><span>K / D</span><strong>{stats.kd===null?"—":stats.kd.toFixed(2)}</strong><small>{fmt(stats.kills)} K · {fmt(stats.deaths)} D</small></article>
      <article><span>MATCHES</span><strong>{fmt(stats.matches)}</strong><small>completed maps</small></article>
      <article><span>MAPS</span><strong>{fmt(stats.mapsPlayed)}</strong><small>{stats.favoriteMap||"—"}</small></article>
      <article><span>MAP RECORD</span><strong>{stats.mapRecord||"—"}</strong><small>best recorded map</small></article>
      <article><span>LOADOUT</span><strong>{equippedCount}</strong><small>saved selections</small></article>
    </section>

    <section className="profile-pro-grid">
      <article className="profile-panel recent-maps-panel"><header><div><span>PERFORMANCE</span><strong>RECENT 10 MAPS</strong></div><small>{stats.recentMaps.length}/10</small></header>{stats.recentMaps.length?<div className="recent-map-list">{stats.recentMaps.slice(0,10).map((m,i)=><div key={`${m.playedAt||i}-${m.map}`}><b>{String(i+1).padStart(2,"0")}</b><div><strong>{m.map}</strong><small>{m.playedAt?new Date(m.playedAt).toLocaleDateString():""}</small></div><span>{m.kills}K / {m.deaths}D</span><em>{m.result||"—"}</em></div>)}</div>:<div className="profile-data-empty">SERVER STATS CONNECTION AWAITING DATA</div>}</article>
      <article className="profile-panel loadout-summary-panel"><header><div><span>PERSONAL</span><strong>SAVED LOADOUT</strong></div><Link href="/skinchanger">EDIT ↗</Link></header><div className="profile-loadout-empty"><Icon name="skin" size={28}/><strong>{equippedCount?`${equippedCount} SAVED ITEMS`:"NO SAVED LOADOUT"}</strong><span>SteamID64-аар хадгалагдана</span></div></article>
      <article className="profile-panel collection-summary-panel"><header><div><span>INVENTORY</span><strong>COLLECTION</strong></div><Link href="/collection">VIEW ↗</Link></header><div className="profile-loadout-empty"><Icon name="skin" size={28}/><strong>COLLECTION READY</strong><span>inventory connector залгахад автоматаар бөглөгдөнө</span></div></article>
    </section>
  </main>;
}
