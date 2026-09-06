import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

export type HomeCard = {
  title: string;
  text: string;
  href: string;
  icon: "rent" | "discord" | "crown" | "skin" | "server" | "users" | "trophy" | "spark";
};

export type HomeServerWidget = {
  id: string;
  name: string;
  mode: string;
  map: string;
  players: number;
  capacity: number;
  ping: number;
  state: "ONLINE" | "OFFLINE";
};

export type SiteConfig = {
  discordUrl: string;
  instagramUrl: string;
  announcement: {
    enabled: boolean;
    badge: string;
    title: string;
    body: string;
    buttonText: string;
    buttonHref: string;
  };
  cards: HomeCard[];
  servers: HomeServerWidget[];
};

export const defaultSiteConfig: SiteConfig = {
  discordUrl: "https://discord.gg/tFNYKQpHZe",
  instagramUrl: "",
  announcement: {
    enabled: true,
    badge: "WINGS UPDATE",
    title: "WINGS community шинэчлэгдлээ",
    body: "Шинэ dashboard, admin control, live server widgets болон community tools нэг дор.",
    buttonText: "JOIN DISCORD",
    buttonHref: "https://discord.gg/tFNYKQpHZe",
  },
  cards: [
    { title: "CS2 Server Rental", text: "Private session, custom map, hourly demo pricing.", href: "/rent-server", icon: "rent" },
    { title: "Join Discord Community", text: "Staff team, events and community support in one place.", href: "https://discord.gg/tFNYKQpHZe", icon: "discord" },
    { title: "Shop Page", text: "Membership, cosmetics and future add-ons showcase.", href: "/collection", icon: "crown" },
    { title: "Skinchanger", text: "Build your loadout with skins, charms, stickers and more.", href: "/skinchanger", icon: "skin" },
  ],
  servers: [
    { id: "01", name: "WINGS PREMIER #1", mode: "PREMIER", map: "ANCIENT", players: 8, capacity: 10, ping: 12, state: "ONLINE" },
    { id: "02", name: "WINGS PREMIER #2", mode: "PREMIER", map: "MIRAGE", players: 10, capacity: 10, ping: 9, state: "ONLINE" },
    { id: "03", name: "WINGS RETAKE", mode: "RETAKE", map: "INFERNO", players: 6, capacity: 12, ping: 14, state: "ONLINE" },
    { id: "04", name: "WINGS 1V1 ARENA", mode: "1V1", map: "AIM_MAP", players: 2, capacity: 8, ping: 11, state: "ONLINE" },
    { id: "05", name: "WINGS DEATHMATCH", mode: "DEATHMATCH", map: "DUST II", players: 18, capacity: 24, ping: 16, state: "ONLINE" },
  ],
};

const filePath = join(process.cwd(), "data", "site-config.json");
const redisKey = "wings:site-config:v1";

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(command: unknown[]) {
  const config = upstashConfig();
  if (!config) throw new Error("Persistent storage not configured");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Storage request failed");
  return response.json() as Promise<{ result?: unknown }>;
}

function sanitizeString(value: unknown, fallback = "", max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

function cleanConfig(input: unknown): SiteConfig {
  const source = input && typeof input === "object" ? input as Partial<SiteConfig> : {};
  const announcement = source.announcement && typeof source.announcement === "object" ? source.announcement : {} as SiteConfig["announcement"];
  const cards = Array.isArray(source.cards) ? source.cards.slice(0, 4).map((card, index) => {
    const fallback = defaultSiteConfig.cards[index] ?? defaultSiteConfig.cards[0];
    const candidate = card && typeof card === "object" ? card as Partial<HomeCard> : {};
    const allowedIcons: HomeCard["icon"][] = ["rent", "discord", "crown", "skin", "server", "users", "trophy", "spark"];
    const icon = allowedIcons.includes(candidate.icon as HomeCard["icon"]) ? candidate.icon as HomeCard["icon"] : fallback.icon;
    return {
      title: sanitizeString(candidate.title, fallback.title, 80),
      text: sanitizeString(candidate.text, fallback.text, 180),
      href: sanitizeString(candidate.href, fallback.href, 260),
      icon,
    };
  }) : defaultSiteConfig.cards;

  while (cards.length < 4) cards.push(defaultSiteConfig.cards[cards.length]);

  const servers = Array.isArray(source.servers) ? source.servers.slice(0, 8).map((server, index) => {
    const fallback = defaultSiteConfig.servers[index] ?? defaultSiteConfig.servers[0];
    const candidate = server && typeof server === "object" ? server as Partial<HomeServerWidget> : {};
    return {
      id: sanitizeString(candidate.id, fallback.id, 20),
      name: sanitizeString(candidate.name, fallback.name, 80),
      mode: sanitizeString(candidate.mode, fallback.mode, 40),
      map: sanitizeString(candidate.map, fallback.map, 50),
      players: clamp(candidate.players, 0, 64, fallback.players),
      capacity: clamp(candidate.capacity, 1, 64, fallback.capacity),
      ping: clamp(candidate.ping, 0, 999, fallback.ping),
      state: candidate.state === "OFFLINE" ? "OFFLINE" : "ONLINE",
    };
  }) : defaultSiteConfig.servers;

  return {
    discordUrl: sanitizeString(source.discordUrl, defaultSiteConfig.discordUrl, 260),
    instagramUrl: sanitizeString(source.instagramUrl, defaultSiteConfig.instagramUrl, 260),
    announcement: {
      enabled: typeof announcement.enabled === "boolean" ? announcement.enabled : defaultSiteConfig.announcement.enabled,
      badge: sanitizeString(announcement.badge, defaultSiteConfig.announcement.badge, 40),
      title: sanitizeString(announcement.title, defaultSiteConfig.announcement.title, 120),
      body: sanitizeString(announcement.body, defaultSiteConfig.announcement.body, 280),
      buttonText: sanitizeString(announcement.buttonText, defaultSiteConfig.announcement.buttonText, 40),
      buttonHref: sanitizeString(announcement.buttonHref, defaultSiteConfig.announcement.buttonHref, 260),
    },
    cards,
    servers,
  };
}

export function siteConfigWritable() {
  return Boolean(upstashConfig()) || process.env.VERCEL !== "1";
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (upstashConfig()) {
    try {
      const data = await redis(["GET", redisKey]);
      if (typeof data.result === "string") return cleanConfig(JSON.parse(data.result));
    } catch {}
  }

  try {
    const raw = await readFile(filePath, "utf8");
    return cleanConfig(JSON.parse(raw));
  } catch {
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(input: unknown): Promise<SiteConfig> {
  const config = cleanConfig(input);
  if (upstashConfig()) {
    await redis(["SET", redisKey, JSON.stringify(config)]);
    return config;
  }
  if (process.env.VERCEL === "1") throw new Error("Persistent site editing requires Upstash Redis on Vercel.");
  await mkdir(dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await rename(tmp, filePath);
  return config;
}
