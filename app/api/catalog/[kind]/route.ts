import { NextResponse } from "next/server";

const API_ROOT = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";
const feeds = {
  skins: "skins.json",
  stickers: "stickers.json",
  charms: "keychains.json",
  agents: "agents.json",
  music: "music_kits.json",
  medals: "collectibles.json",
} as const;

type FeedKind = keyof typeof feeds;
type SourceItem = Record<string, unknown>;
type NamedValue = { id?: string; name?: string; color?: string };

function named(value: unknown): NamedValue {
  return value && typeof value === "object" ? value as NamedValue : {};
}

function listNames(value: unknown) {
  return Array.isArray(value) ? value.map(item => named(item).name).filter(Boolean).slice(0, 4).join(" · ") : "";
}

function symbolFrom(name: string) {
  return name.replace(/^Sticker \| |^Charm \| |^Music Kit \| /i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "CS";
}

function compact(item: SourceItem, kind: FeedKind, index: number) {
  const name = String(item.name ?? `CS2 Item ${index + 1}`);
  const rarity = named(item.rarity);
  const weapon = named(item.weapon).name ?? "";
  const category = named(item.category).name ?? "";
  const lowerIdentity = `${weapon} ${category} ${name}`.toLowerCase();
  const catalogKind = kind === "skins"
    ? /glove|hand wraps/.test(lowerIdentity)
      ? "Gloves"
      : /knife|bayonet|karambit|daggers|kukri/.test(lowerIdentity)
        ? "Knives"
        : "Skins"
    : kind === "stickers"
      ? "Stickers"
      : kind === "charms"
        ? "Charms"
        : kind === "agents"
          ? "Agents"
          : kind === "music"
            ? "Music Kits"
            : "Medals";

  return {
    id: String(item.id ?? `${kind}-${index}`),
    name,
    kind: catalogKind,
    weapon: weapon || (catalogKind === "Skins" ? name.split(" | ")[0] : ""),
    finish: named(item.pattern).name ?? (name.includes(" | ") ? name.split(" | ").slice(1).join(" | ") : name),
    rarity: rarity.name ?? String(item.type ?? "CS2 Item"),
    color: rarity.color ?? "#8f7cff",
    collection: listNames(item.collections) || named(item.tournament).name || "Counter-Strike 2",
    effect: String(item.effect ?? ""),
    team: named(item.team).id ?? named(item.team).name ?? "",
    minFloat: typeof item.min_float === "number" ? item.min_float : null,
    maxFloat: typeof item.max_float === "number" ? item.max_float : null,
    symbol: symbolFrom(name),
    image: String(item.image ?? ""),
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!(kind in feeds)) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  try {
    const feedKind = kind as FeedKind;
    const response = await fetch(`${API_ROOT}/${feeds[feedKind]}`, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Catalog upstream returned ${response.status}`);
    const source = await response.json();
    if (!Array.isArray(source)) throw new Error("Catalog response is invalid");

    return NextResponse.json({ updated: new Date().toISOString(), total: source.length, items: source.map((item, index) => compact(item as SourceItem, feedKind, index)) }, {
      headers: { "cache-control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "Catalog түр ачаалсангүй." }, { status: 502 });
  }
}
