import { cookies } from "next/headers";
import { getAdminUser } from "@/lib/admin-auth";
import { getStaffMembers } from "@/lib/staff-store";

export type CommunityServer = { id:string; name:string; address:string; mode:string; map:string; players:number; capacity:number; ping:number|null; state:"ONLINE"|"OFFLINE"; updatedAt?:string };
export type RecentMap = { map:string; kills:number; deaths:number; assists?:number; score?:number; result?:string; playedAt?:string };
export type PlayerCommunityProfile = { playtimeSeconds:number|null; kills:number|null; deaths:number|null; kd:number|null; matches:number|null; mapsPlayed:number|null; favoriteMap?:string; mapRecord?:string; faceitLevel:number|null; faceitElo:number|null; recentMaps:RecentMap[] };
export type ModerationRecord = { id:string; playerName:string; steamId64:string; type:"BAN"|"MUTE"|"GAG"|"SILENCE"; reason:string; durationMinutes:number|null; expiresAt:string|null; permanent:boolean; server:string; issuedByName:string; issuedBySteamId?:string; notes?:string; createdAt:string; status:"ACTIVE"|"EXPIRED"|"REVOKED" };

function bridgeConfig(){ const url=process.env.CS2_BRIDGE_URL?.trim().replace(/\/+$/,""); const token=process.env.CS2_BRIDGE_TOKEN?.trim(); return url?{url,token}:null; }
function upstashConfig(){ const url=process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/,""); const token=process.env.UPSTASH_REDIS_REST_TOKEN; return url&&token?{url,token}:null; }
async function redis(command:unknown[]){ const c=upstashConfig(); if(!c) throw new Error("Persistent storage not configured"); const r=await fetch(c.url,{method:"POST",headers:{authorization:`Bearer ${c.token}`,"content-type":"application/json"},body:JSON.stringify(command),cache:"no-store"}); if(!r.ok) throw new Error("Storage request failed"); return r.json() as Promise<{result?:unknown}>; }
async function bridge<T>(path:string, init?:RequestInit):Promise<T|null>{ const c=bridgeConfig(); if(!c)return null; try{ const headers=new Headers(init?.headers); headers.set("accept","application/json"); if(c.token)headers.set("authorization",`Bearer ${c.token}`); if(init?.body)headers.set("content-type","application/json"); const r=await fetch(`${c.url}${path}`,{...init,headers,cache:"no-store"}); if(!r.ok)return null; return await r.json() as T; }catch{return null;} }

export function communityBridgeConfigured(){ return Boolean(bridgeConfig()); }
export async function getLiveServers(){ const data=await bridge<{servers?:CommunityServer[]}|CommunityServer[]>("/api/servers"); const list=Array.isArray(data)?data:data?.servers; return Array.isArray(list)?list:[]; }
export async function getPlayerCommunityProfile(steamId64:string):Promise<PlayerCommunityProfile>{ const empty:PlayerCommunityProfile={playtimeSeconds:null,kills:null,deaths:null,kd:null,matches:null,mapsPlayed:null,faceitLevel:null,faceitElo:null,recentMaps:[]}; const data=await bridge<Partial<PlayerCommunityProfile>>(`/api/players/${encodeURIComponent(steamId64)}/profile`); return data?{...empty,...data,recentMaps:Array.isArray(data.recentMaps)?data.recentMaps:[]}:empty; }

const loadoutKey=(steamId:string)=>`zero:loadout:${steamId}`;
export async function getUserLoadout(steamId:string){ const c=upstashConfig(); if(!c)return {}; try{ const d=await redis(["GET",loadoutKey(steamId)]); if(typeof d.result!=="string")return {}; const v=JSON.parse(d.result); return v&&typeof v==="object"?v:{}; }catch{return{};} }
export async function saveUserLoadout(steamId:string, loadout:unknown){ const c=upstashConfig(); if(c)await redis(["SET",loadoutKey(steamId),JSON.stringify(loadout)]); await bridge(`/api/loadouts/${encodeURIComponent(steamId)}`,{method:"PUT",body:JSON.stringify({loadout})}); return {stored:Boolean(c),synced:communityBridgeConfigured()}; }

const moderationKey="zero:moderation:v1";
export async function getModerationRecords():Promise<ModerationRecord[]>{ const c=upstashConfig(); if(!c)return []; try{ const d=await redis(["GET",moderationKey]); if(typeof d.result!=="string")return []; const v=JSON.parse(d.result); return Array.isArray(v)?v:[]; }catch{return[];} }
export async function canModerate(){ if(await getAdminUser())return {allowed:true,name:"WINGS Owner",steamId:""}; const store=await cookies(); const steamId=store.get("zero_steam_id")?.value??""; if(!steamId)return {allowed:false,name:"",steamId:""}; const member=(await getStaffMembers()).find(v=>v.steamId64===steamId); return member?{allowed:true,name:member.steamName||member.name,steamId}:{allowed:false,name:"",steamId}; }
export async function createModerationRecord(input:Omit<ModerationRecord,"id"|"createdAt"|"status"|"issuedByName"|"issuedBySteamId">){ const actor=await canModerate(); if(!actor.allowed)throw new Error("Unauthorized"); const record:ModerationRecord={...input,id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:"ACTIVE",issuedByName:actor.name,issuedBySteamId:actor.steamId||undefined}; const c=upstashConfig(); if(c){const list=await getModerationRecords(); await redis(["SET",moderationKey,JSON.stringify([record,...list].slice(0,2000))]);} await bridge("/api/moderation",{method:"POST",body:JSON.stringify(record)}); return record; }
