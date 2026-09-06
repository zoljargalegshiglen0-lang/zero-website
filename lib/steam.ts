export type SteamProfile = {
  steamId64: string;
  name: string;
  profileUrl: string;
  avatar: string;
  avatarMedium: string;
  avatarFull: string;
  personaState: number;
  communityVisibilityState: number;
  lastLogoff: number;
};

type PlayerSummary = {
  steamid?: string;
  personaname?: string;
  profileurl?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  personastate?: number;
  communityvisibilitystate?: number;
  lastlogoff?: number;
};

function apiKey() {
  return process.env.STEAM_WEB_API_KEY?.trim() || "";
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function xmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function publicProfileFromXml(xml: string, fallbackSteamId = ""): SteamProfile {
  const steamId64 = xmlValue(xml, "steamID64") || fallbackSteamId;
  if (!/^\d{17}$/.test(steamId64)) throw new Error("Steam profile олдсонгүй.");

  const onlineState = xmlValue(xml, "onlineState").toLowerCase();
  const privacyState = xmlValue(xml, "privacyState").toLowerCase();
  const profileUrl = xmlValue(xml, "profileURL") || `https://steamcommunity.com/profiles/${steamId64}/`;
  const avatar = xmlValue(xml, "avatarIcon");
  const avatarMedium = xmlValue(xml, "avatarMedium") || avatar;
  const avatarFull = xmlValue(xml, "avatarFull") || avatarMedium || avatar;

  return {
    steamId64,
    name: xmlValue(xml, "steamID") || "Steam User",
    profileUrl,
    avatar,
    avatarMedium,
    avatarFull,
    personaState: onlineState === "online" || onlineState === "in-game" ? 1 : 0,
    communityVisibilityState: privacyState === "public" ? 3 : 1,
    lastLogoff: 0,
  };
}

async function fetchPublicSteamXml(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}xml=1`, {
    cache: "no-store",
    headers: {
      accept: "application/xml,text/xml;q=0.9,text/html;q=0.8",
      "user-agent": "ZERO-Network/1.0",
    },
  });
  if (!response.ok) throw new Error("Steam public profile татаж чадсангүй.");
  const xml = await response.text();
  if (!xml.includes("<profile>")) throw new Error("Steam profile public биш эсвэл олдсонгүй.");
  return xml;
}

export function normalizeSteamInput(input: string) {
  return input.trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
}

export async function resolveSteamId64(input: string): Promise<string> {
  const value = normalizeSteamInput(input);
  if (/^7656119\d{10}$/.test(value)) return value;

  const profileMatch = value.match(/^https?:\/\/(?:www\.)?steamcommunity\.com\/profiles\/(\d{17})$/i);
  if (profileMatch) return profileMatch[1];

  const vanityMatch = value.match(/^https?:\/\/(?:www\.)?steamcommunity\.com\/id\/([^/]+)$/i);
  if (!vanityMatch) throw new Error("SteamID64 эсвэл Steam profile link оруулна уу.");

  const key = apiKey();
  if (key) {
    try {
      const params = new URLSearchParams({ key, vanityurl: decodeURIComponent(vanityMatch[1]) });
      const response = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?${params.toString()}`, { cache: "no-store" });
      if (response.ok) {
        const json = await response.json() as { response?: { success?: number; steamid?: string } };
        if (json.response?.success === 1 && json.response.steamid) return json.response.steamid;
      }
    } catch {
      // Public XML fallback below.
    }
  }

  const xml = await fetchPublicSteamXml(`https://steamcommunity.com/id/${encodeURIComponent(decodeURIComponent(vanityMatch[1]))}/`);
  const steamId64 = xmlValue(xml, "steamID64");
  if (!/^\d{17}$/.test(steamId64)) throw new Error("Steam vanity profile resolve хийж чадсангүй.");
  return steamId64;
}

async function getSteamProfileFromApi(steamId64: string, key: string): Promise<SteamProfile> {
  const params = new URLSearchParams({ key, steamids: steamId64 });
  const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Steam Web API profile татаж чадсангүй.");
  const json = await response.json() as { response?: { players?: PlayerSummary[] } };
  const player = json.response?.players?.[0];
  if (!player?.steamid) throw new Error("Steam profile олдсонгүй.");

  return {
    steamId64: player.steamid,
    name: player.personaname || "Steam User",
    profileUrl: player.profileurl || `https://steamcommunity.com/profiles/${player.steamid}/`,
    avatar: player.avatar || "",
    avatarMedium: player.avatarmedium || player.avatar || "",
    avatarFull: player.avatarfull || player.avatarmedium || player.avatar || "",
    personaState: Number(player.personastate) || 0,
    communityVisibilityState: Number(player.communityvisibilitystate) || 0,
    lastLogoff: Number(player.lastlogoff) || 0,
  };
}

export async function getSteamProfile(steamId64: string): Promise<SteamProfile> {
  if (!/^\d{17}$/.test(steamId64)) throw new Error("SteamID64 буруу байна.");
  const key = apiKey();

  if (key) {
    try {
      return await getSteamProfileFromApi(steamId64, key);
    } catch {
      // Web API may be unavailable/restricted. Use public profile XML instead.
    }
  }

  const xml = await fetchPublicSteamXml(`https://steamcommunity.com/profiles/${steamId64}/`);
  return publicProfileFromXml(xml, steamId64);
}

export async function resolveSteamProfile(input: string) {
  const value = normalizeSteamInput(input);
  const vanityMatch = value.match(/^https?:\/\/(?:www\.)?steamcommunity\.com\/id\/([^/]+)$/i);

  if (!apiKey() && vanityMatch) {
    const xml = await fetchPublicSteamXml(`https://steamcommunity.com/id/${encodeURIComponent(decodeURIComponent(vanityMatch[1]))}/`);
    return publicProfileFromXml(xml);
  }

  return getSteamProfile(await resolveSteamId64(input));
}
