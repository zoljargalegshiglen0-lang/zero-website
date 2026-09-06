"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

type Server={id:string;name:string;address:string;mode:string;map:string;players:number;capacity:number;ping:number|null;state:"ONLINE"|"OFFLINE";updatedAt?:string};
export default function ServersPage(){
 const[servers,setServers]=useState<Server[]>([]);const[loading,setLoading]=useState(true);const[query,setQuery]=useState("");const[filter,setFilter]=useState("ALL");
 async function load(){setLoading(true);try{const r=await fetch('/api/community/servers',{cache:'no-store'});const d=await r.json();setServers(Array.isArray(d.servers)?d.servers:[])}finally{setLoading(false)}}
 useEffect(()=>{void load();const id=window.setInterval(load,15000);return()=>window.clearInterval(id)},[]);
 const modes=useMemo(()=>["ALL",...Array.from(new Set(servers.map(s=>s.mode).filter(Boolean)))],[servers]);
 const visible=useMemo(()=>servers.filter(s=>(filter==="ALL"||s.mode===filter)&&`${s.name} ${s.map} ${s.address}`.toLowerCase().includes(query.toLowerCase())),[servers,filter,query]);
 const online=servers.filter(s=>s.state==="ONLINE").length,players=servers.reduce((a,s)=>a+s.players,0),avgPing=Math.round(servers.filter(s=>s.ping!==null).reduce((a,s)=>a+(s.ping||0),0)/Math.max(1,servers.filter(s=>s.ping!==null).length));
 return <main className="page-wrap"><PageHeading icon="server" eyebrow="LIVE NETWORK" title="СЕРВЕРҮҮД" description="CS2 bridge-с автоматаар шинэчлэгдэнэ" actions={<button className="page-button" onClick={load}><Icon name="bolt"/> REFRESH</button>}/>
 <div className="server-live-stats"><article><span>PLAYERS</span><strong>{players}</strong><small>online now</small></article><article><span>SERVERS</span><strong>{online}/{servers.length}</strong><small>online</small></article><article><span>AVG PING</span><strong>{servers.length?`${avgPing}ms`:"—"}</strong><small>reported</small></article><article><span>SYNC</span><strong>{loading?"SYNC":"LIVE"}</strong><small>15 sec refresh</small></article></div>
 <div className="toolbar"><div className="filter-set">{modes.map(m=><button key={m} className={filter===m?"filter-chip active":"filter-chip"} onClick={()=>setFilter(m)}>{m}</button>)}</div><label className="search-box"><Icon name="search" size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Server, map, IP..."/></label></div>
 <div className="server-list">{visible.map((s,i)=><article className="server-item" key={s.id}><div className="server-index">#{String(i+1).padStart(2,'0')}</div><div className="server-identity"><span>{s.mode}</span><strong>{s.name}</strong><small>{s.map||"—"}</small></div><div className="server-live"><span className={`status-${s.state.toLowerCase()}`}><i/> {s.state}</span><b>{s.players}<small> / {s.capacity}</small></b></div><div className="player-meter"><i style={{width:`${s.capacity?Math.min(100,s.players/s.capacity*100):0}%`}}/></div><div className="ping-value"><span>PING</span><b>{s.ping===null?"—":`${s.ping} ms`}</b></div><div className="server-address"><span>{s.address}</span></div></article>)}{!loading&&!visible.length&&<div className="connection-ready-empty"><Icon name="server" size={26}/><strong>NO LIVE SERVERS YET</strong><span>CS2_BRIDGE_URL холбоход серверүүд автоматаар энд гарна.</span></div>}</div>
 </main>;
}
