"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";
import { cosmetics, type CosmeticItem } from "@/lib/data";

type BoardCategory = "Skins" | "Knives" | "Gloves" | "Agents" | "Music Kits" | "Medals";
type FeedKey = "skins" | "stickers" | "charms" | "agents" | "music" | "medals";
type TeamSide = "CT" | "T";
type CatalogItem = {
  id: string;
  name: string;
  kind: BoardCategory | "Stickers" | "Charms";
  weapon: string;
  finish: string;
  rarity: string;
  color: string;
  collection: string;
  effect: string;
  minFloat: number | null;
  maxFloat: number | null;
  symbol: string;
  image: string;
  team?: string;
};
type Placement = { item: CatalogItem; x: number; y: number; rotation: number; scale: number };
type CraftState = { stickers: (Placement | null)[]; charm: CatalogItem | null; wear: number; pattern: number; statTrak: boolean; nameTag: string };
type SavedLoadout = { version: 2; equipped: Record<string, CatalogItem>; crafts: Record<string, CraftState> };
type LoadoutGroup = { label: string; slots: readonly string[] };

const VANILLA_COLOR = "#89909d";

const categoryTabs: { id: BoardCategory; label: string; feed: FeedKey }[] = [
  { id: "Skins", label: "WEAPONS", feed: "skins" },
  { id: "Knives", label: "KNIVES", feed: "skins" },
  { id: "Gloves", label: "GLOVES", feed: "skins" },
  { id: "Agents", label: "AGENTS", feed: "agents" },
  { id: "Music Kits", label: "MUSIC KITS", feed: "music" },
  { id: "Medals", label: "MEDALS", feed: "medals" },
];

const vanillaWeapons = [
  { id: "GLOCK-18", name: "Glock-18", group: "PISTOLS", color: "#ff7ac8" },
  { id: "USP-S", name: "USP-S", group: "PISTOLS", color: "#9f8cff" },
  { id: "P2000", name: "P2000", group: "PISTOLS", color: "#72ddff" },
  { id: "DUAL BERETTAS", name: "Dual Berettas", group: "PISTOLS", color: "#ffcb7b" },
  { id: "P250", name: "P250", group: "PISTOLS", color: "#71efc1" },
  { id: "FIVE-SEVEN", name: "Five-SeveN", group: "PISTOLS", color: "#78a8ff" },
  { id: "TEC-9", name: "Tec-9", group: "PISTOLS", color: "#ff7ac8" },
  { id: "CZ75-AUTO", name: "CZ75-Auto", group: "PISTOLS", color: "#9f8cff" },
  { id: "DESERT EAGLE", name: "Desert Eagle", group: "PISTOLS", color: "#ffcb7b" },
  { id: "R8 REVOLVER", name: "R8 Revolver", group: "PISTOLS", color: "#78a8ff" },
  { id: "MAC-10", name: "MAC-10", group: "SMGS", color: "#ff7ac8" },
  { id: "MP9", name: "MP9", group: "SMGS", color: "#72ddff" },
  { id: "MP7", name: "MP7", group: "SMGS", color: "#9f8cff" },
  { id: "MP5-SD", name: "MP5-SD", group: "SMGS", color: "#71efc1" },
  { id: "UMP-45", name: "UMP-45", group: "SMGS", color: "#ffcb7b" },
  { id: "P90", name: "P90", group: "SMGS", color: "#78a8ff" },
  { id: "PP-BIZON", name: "PP-Bizon", group: "SMGS", color: "#72ddff" },
  { id: "AK-47", name: "AK-47", group: "RIFLES", color: "#ff7ac8" },
  { id: "M4A4", name: "M4A4", group: "RIFLES", color: "#72ddff" },
  { id: "M4A1-S", name: "M4A1-S", group: "RIFLES", color: "#9f8cff" },
  { id: "FAMAS", name: "FAMAS", group: "RIFLES", color: "#78a8ff" },
  { id: "GALIL AR", name: "Galil AR", group: "RIFLES", color: "#ffcb7b" },
  { id: "AUG", name: "AUG", group: "RIFLES", color: "#71efc1" },
  { id: "SG 553", name: "SG 553", group: "RIFLES", color: "#ff7ac8" },
  { id: "SSG 08", name: "SSG 08", group: "SNIPERS", color: "#72ddff" },
  { id: "AWP", name: "AWP", group: "SNIPERS", color: "#9f8cff" },
  { id: "SCAR-20", name: "SCAR-20", group: "SNIPERS", color: "#ffcb7b" },
  { id: "G3SG1", name: "G3SG1", group: "SNIPERS", color: "#71efc1" },
  { id: "NOVA", name: "Nova", group: "HEAVY", color: "#ff7ac8" },
  { id: "XM1014", name: "XM1014", group: "HEAVY", color: "#72ddff" },
  { id: "MAG-7", name: "MAG-7", group: "HEAVY", color: "#9f8cff" },
  { id: "SAWED-OFF", name: "Sawed-Off", group: "HEAVY", color: "#ffcb7b" },
  { id: "M249", name: "M249", group: "HEAVY", color: "#78a8ff" },
  { id: "NEGEV", name: "Negev", group: "HEAVY", color: "#71efc1" },
  { id: "ZEUS X27", name: "Zeus x27", group: "HEAVY", color: "#72ddff" },
] as const;

const groups = ["ALL", "PISTOLS", "SMGS", "RIFLES", "SNIPERS", "HEAVY"];
const loadoutShortcuts = [
  { label: "STARTER", note: "PISTOLS", category: "Skins" as BoardCategory, group: "PISTOLS" },
  { label: "MID-TIER", note: "SMGS", category: "Skins" as BoardCategory, group: "SMGS" },
  { label: "RIFLES", note: "RIFLES", category: "Skins" as BoardCategory, group: "RIFLES" },
  { label: "GEAR", note: "GLOVES", category: "Gloves" as BoardCategory, group: "ALL" },
  { label: "SPECIAL", note: "KNIVES", category: "Knives" as BoardCategory, group: "ALL" },
];

const specialPanels = [
  { category: "Knives" as BoardCategory, label: "KNIFE", teamAware: false },
  { category: "Gloves" as BoardCategory, label: "GLOVES", teamAware: false },
  { category: "Music Kits" as BoardCategory, label: "MUSIC KIT", teamAware: false },
  { category: "Medals" as BoardCategory, label: "MEDAL", teamAware: false },
];

const teamLoadouts: Record<TeamSide, readonly LoadoutGroup[]> = {
  CT: [
    { label: "STARTING PISTOL", slots: ["USP-S", "P2000"] },
    { label: "OTHER PISTOLS", slots: ["Dual Berettas", "P250", "Five-SeveN", "CZ75-Auto", "Desert Eagle", "R8 Revolver", "Zeus x27"] },
    { label: "MID-TIER", slots: ["MP9", "MP7", "MP5-SD", "UMP-45", "P90", "PP-Bizon", "Nova", "XM1014", "MAG-7", "M249", "Negev"] },
    { label: "RIFLES", slots: ["M4A4", "M4A1-S", "FAMAS", "AUG", "SSG 08", "AWP", "SCAR-20"] },
  ],
  T: [
    { label: "STARTING PISTOL", slots: ["Glock-18"] },
    { label: "OTHER PISTOLS", slots: ["Dual Berettas", "P250", "Tec-9", "CZ75-Auto", "Desert Eagle", "R8 Revolver", "Zeus x27"] },
    { label: "MID-TIER", slots: ["MAC-10", "MP7", "MP5-SD", "UMP-45", "P90", "PP-Bizon", "Nova", "XM1014", "Sawed-Off", "M249", "Negev"] },
    { label: "RIFLES", slots: ["AK-47", "Galil AR", "SG 553", "SSG 08", "AWP", "G3SG1"] },
  ],
};

const rarityScale = [
  { terms: ["contraband"], rank: 100, color: "#e4ae39" },
  { terms: ["extraordinary"], rank: 95, color: "#eb4b4b" },
  { terms: ["covert", "master"], rank: 90, color: "#eb4b4b" },
  { terms: ["classified", "superior", "exotic"], rank: 80, color: "#d32ce6" },
  { terms: ["restricted", "exceptional", "remarkable"], rank: 70, color: "#8847ff" },
  { terms: ["mil-spec", "milspec", "distinguished", "high grade"], rank: 60, color: "#4b69ff" },
  { terms: ["industrial"], rank: 40, color: "#5e98d9" },
  { terms: ["consumer", "base grade"], rank: 30, color: "#b0c3d9" },
] as const;

function initials(name: string) {
  return name.replace(/^★\s*/, "").split(/\s+|\|/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "CS";
}

function fallbackCatalog(item: CosmeticItem, index: number): CatalogItem {
  const kind = item.category as CatalogItem["kind"];
  const weapon = item.weapon ?? (kind === "Knives" || kind === "Gloves" ? item.name.split(" | ")[0] : "");
  return {
    id: `fallback-${item.category}-${index}`,
    name: item.name,
    kind,
    weapon,
    finish: item.name.includes(" | ") ? item.name.split(" | ").slice(1).join(" | ") : item.name,
    rarity: item.rarity,
    color: ({ pink: "#ff7ac8", violet: "#9f8cff", cyan: "#72ddff", amber: "#ffcb7b", mint: "#71efc1", red: "#ff7f9f", blue: "#78a8ff" } as Record<string, string>)[item.tone] ?? "#9f8cff",
    collection: item.collection,
    effect: "",
    minFloat: null,
    maxFloat: null,
    symbol: item.symbol || initials(item.name),
    image: "",
    team: "",
  };
}

function emptyCatalog() {
  const all = cosmetics.map(fallbackCatalog);
  return {
    skins: all.filter(item => item.kind === "Skins" || item.kind === "Knives" || item.kind === "Gloves"),
    stickers: all.filter(item => item.kind === "Stickers"),
    charms: all.filter(item => item.kind === "Charms"),
    agents: all.filter(item => item.kind === "Agents"),
    music: all.filter(item => item.kind === "Music Kits"),
    medals: all.filter(item => item.kind === "Medals"),
  } satisfies Record<FeedKey, CatalogItem[]>;
}

function cleanName(item: CatalogItem) {
  if (item.kind === "Skins" || item.kind === "Knives" || item.kind === "Gloves") return item.finish;
  return item.name.replace(/^Sticker \| |^Charm \| |^Music Kit \| /i, "");
}

function sameText(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function rarityInfo(item: CatalogItem) {
  const value = item.rarity.trim().toLowerCase();
  const match = rarityScale.find(entry => entry.terms.some(term => value.includes(term)));
  return { rank: match?.rank ?? 10, color: match?.color ?? item.color ?? VANILLA_COLOR };
}

function compareRarity(left: CatalogItem, right: CatalogItem) {
  return rarityInfo(right).rank - rarityInfo(left).rank || cleanName(left).localeCompare(cleanName(right));
}

function equippedColor(item?: CatalogItem) {
  return item && item.rarity !== "Default" ? rarityInfo(item).color : VANILLA_COLOR;
}

function rarityStyle(item: CatalogItem) {
  return { "--item-color": rarityInfo(item).color } as CSSProperties;
}

function CatalogThumb({ item, className = "" }: { item: CatalogItem; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(item.image) && !failed;
  return <span className={`catalog-thumb ${className} ${showImage ? "has-image" : ""}`.trim()} style={rarityStyle(item)}>
    {showImage ? <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <i>{item.symbol}</i>}
    <b />
  </span>;
}

export default function SkinChangerPage() {
  const [catalog, setCatalog] = useState<Record<FeedKey, CatalogItem[]>>(emptyCatalog);
  const [remoteTotals, setRemoteTotals] = useState<Partial<Record<FeedKey, number>>>({});
  const [side, setSide] = useState<TeamSide>("CT");
  const [category, setCategory] = useState<BoardCategory>("Skins");
  const [group, setGroup] = useState("ALL");
  const [boardView, setBoardView] = useState<"loadout" | "catalog">("loadout");
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [boardQuery, setBoardQuery] = useState("");
  const [skinQuery, setSkinQuery] = useState("");
  const [equipped, setEquipped] = useState<Record<string, CatalogItem>>({});
  const [crafts, setCrafts] = useState<Record<string, CraftState>>({});
  const [editorItem, setEditorItem] = useState<CatalogItem | null>(null);
  const [editorKey, setEditorKey] = useState<string | null>(null);
  const [accessoryTab, setAccessoryTab] = useState<"stickers" | "charms">("stickers");
  const [accessoryQuery, setAccessoryQuery] = useState("");
  const [accessoryLimit, setAccessoryLimit] = useState(48);
  const [boardLimit, setBoardLimit] = useState(120);
  const [skinLimit, setSkinLimit] = useState(120);
  const [stickers, setStickers] = useState<(Placement | null)[]>(() => Array(5).fill(null));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [charm, setCharm] = useState<CatalogItem | null>(null);
  const [wear, setWear] = useState(60);
  const [pattern, setPattern] = useState(348);
  const [statTrak, setStatTrak] = useState(false);
  const [nameTag, setNameTag] = useState("");
  const [previewRotation, setPreviewRotation] = useState({ x: -4, y: 0 });
  const [draggingPreview, setDraggingPreview] = useState(false);
  const previewDragRef = useRef({ x: 0, y: 0, rx: -4, ry: 0 });
  const [draggedSticker, setDraggedSticker] = useState<CatalogItem | null>(null);
  const [notice, setNotice] = useState("");
  const [steamAuthed, setSteamAuthed] = useState<boolean | null>(null);
  const [steamId64, setSteamId64] = useState("");
  const [loadoutHydrated, setLoadoutHydrated] = useState(false);
  const [catalogState, setCatalogState] = useState<"loading" | "live" | "fallback">("loading");
  const loadingFeeds = useRef(new Set<FeedKey>());
  const loadedFeeds = useRef(new Set<FeedKey>());
  const latestLoadoutRef = useRef<SavedLoadout>({ version: 2, equipped: {}, crafts: {} });

  const persistLoadoutNow = useCallback((payload?: SavedLoadout) => {
    const current = payload ?? latestLoadoutRef.current;
    if (!steamAuthed || !steamId64) return;
    try { window.localStorage.setItem(`zero:loadout:${steamId64}`, JSON.stringify(current)); } catch {}
    void fetch("/api/loadout", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ loadout: current }),
      keepalive: true,
    }).catch(() => undefined);
  }, [steamAuthed, steamId64]);

  const loadFeed = useCallback(async (feed: FeedKey) => {
    if (loadedFeeds.current.has(feed) || loadingFeeds.current.has(feed)) return;
    loadingFeeds.current.add(feed);
    try {
      const response = await fetch(`/api/catalog/${feed}`);
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.items)) throw new Error("catalog");
      setCatalog(previous => ({ ...previous, [feed]: result.items as CatalogItem[] }));
      setRemoteTotals(previous => ({ ...previous, [feed]: Number(result.total) || result.items.length }));
      loadedFeeds.current.add(feed);
      setCatalogState("live");
    } catch {
      setCatalogState(previous => previous === "live" ? previous : "fallback");
    } finally {
      loadingFeeds.current.delete(feed);
    }
  }, []);

  useEffect(() => { void loadFeed("skins"); void loadFeed("agents"); }, [loadFeed]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await fetch("/api/auth/me", { cache: "no-store" });
        if (!me.ok) { if (active) setSteamAuthed(false); return; }
        const meData = await me.json().catch(() => ({}));
        const sid = String(meData?.profile?.steamId64 || "");
        if (active) { setSteamAuthed(true); setSteamId64(sid); }

        let restored: SavedLoadout | null = null;
        const response = await fetch("/api/loadout", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const raw = data?.loadout;
          if (raw && typeof raw === "object") {
            if (raw.version === 2 && raw.equipped && typeof raw.equipped === "object") restored = raw as SavedLoadout;
            else if (!Array.isArray(raw)) restored = { version: 2, equipped: raw as Record<string, CatalogItem>, crafts: {} };
          }
        }
        if (!restored && sid) {
          try {
            const local = window.localStorage.getItem(`zero:loadout:${sid}`);
            if (local) {
              const parsed = JSON.parse(local);
              if (parsed?.version === 2) restored = parsed as SavedLoadout;
            }
          } catch {}
        }
        if (active && restored) { setEquipped(restored.equipped || {}); setCrafts(restored.crafts || {}); }
      } catch { if (active) setSteamAuthed(false); }
      finally { if (active) setLoadoutHydrated(true); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loadoutHydrated || !steamAuthed) return;
    const payload: SavedLoadout = { version: 2, equipped, crafts };
    latestLoadoutRef.current = payload;
    if (steamId64) {
      try { window.localStorage.setItem(`zero:loadout:${steamId64}`, JSON.stringify(payload)); } catch {}
    }
    const timer = window.setTimeout(() => persistLoadoutNow(payload), 250);
    return () => window.clearTimeout(timer);
  }, [equipped, crafts, loadoutHydrated, steamAuthed, steamId64, persistLoadoutNow]);

  useEffect(() => {
    if (!steamAuthed) return;
    const flush = () => persistLoadoutNow();
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [steamAuthed, persistLoadoutNow]);

  useEffect(() => {
    const feed = categoryTabs.find(item => item.id === category)?.feed;
    if (feed && feed !== "skins") void loadFeed(feed);
  }, [category, loadFeed]);

  useEffect(() => {
    if (editorItem) void loadFeed(accessoryTab);
  }, [accessoryTab, editorItem, loadFeed]);

  useEffect(() => {
    if (!editorItem || !editorKey) return;
    setCrafts(previous => ({ ...previous, [editorKey]: { stickers, charm, wear, pattern, statTrak, nameTag } }));
  }, [editorItem, editorKey, stickers, charm, wear, pattern, statTrak, nameTag]);

  const skinCatalog = useMemo(() => catalog.skins.filter(item => item.kind === category), [catalog.skins, category]);
  const selectedSkins = useMemo(() => selectedBase
    ? skinCatalog
      .filter(item => sameText(item.weapon, selectedBase) && `${item.name} ${item.rarity} ${item.collection}`.toLowerCase().includes(skinQuery.toLowerCase()))
      .sort(compareRarity)
    : [], [selectedBase, skinCatalog, skinQuery]);

  const weaponPreviewByName = useMemo(() => {
    const map = new Map<string, CatalogItem>();
    for (const item of catalog.skins) {
      if (item.kind !== "Skins" || !item.weapon || !item.image) continue;
      const key = item.weapon.trim().toLowerCase();
      if (!map.has(key)) map.set(key, item);
    }
    return map;
  }, [catalog.skins]);

  const teamAgentPreview = useMemo(() => ({
    CT: equipped[slotKey("CT", "Agents")] ?? null,
    T: equipped[slotKey("T", "Agents")] ?? null,
  }), [equipped]);

  const baseItems = useMemo(() => {
    if (category === "Skins") return vanillaWeapons
      .filter(item => (group === "ALL" || item.group === group) && item.name.toLowerCase().includes(boardQuery.toLowerCase()))
      .map(item => {
        const source = skinCatalog.find(skin => sameText(skin.weapon, item.name)) ?? null;
        return { name: item.name, group: item.group, color: item.color, image: source?.image ?? "", source };
      });

    if (category === "Knives" || category === "Gloves") {
      const unique = new Map<string, CatalogItem>();
      for (const item of skinCatalog) if (item.weapon && !unique.has(item.weapon)) unique.set(item.weapon, item);
      return [...unique.entries()]
        .filter(([name]) => name.toLowerCase().includes(boardQuery.toLowerCase()))
        .map(([name, item]) => ({ name, group: category.toUpperCase(), color: item.color, image: item.image, source: item }));
    }

    return [];
  }, [boardQuery, category, group, skinCatalog]);

  const directItems = useMemo(() => {
    const feed = category === "Agents" ? catalog.agents : category === "Music Kits" ? catalog.music : category === "Medals" ? catalog.medals : [];
    return feed
      .filter(item => {
        if (category !== "Agents" || !item.team) return true;
        const team = item.team.toLowerCase();
        return side === "CT" ? team.includes("counter") : team.includes("terror") && !team.includes("counter");
      })
      .filter(item => `${item.name} ${item.rarity} ${item.collection}`.toLowerCase().includes(boardQuery.toLowerCase()))
      .sort(compareRarity);
  }, [boardQuery, catalog, category, side]);

  const accessoryItems = (accessoryTab === "stickers" ? catalog.stickers : catalog.charms)
    .filter(item => `${item.name} ${item.rarity} ${item.collection} ${item.effect}`.toLowerCase().includes(accessoryQuery.toLowerCase()));
  const selectedPlacement = selectedSlot === null ? null : stickers[selectedSlot];
  const stickerCount = stickers.filter(Boolean).length;
  const equippedCount = Object.keys(equipped).filter(key => key.startsWith(`${side}:`)).length;
  const floatValue = (wear / 1000).toFixed(3);
  const wearName = wear <= 70 ? "FACTORY NEW" : wear <= 150 ? "MINIMAL WEAR" : wear <= 380 ? "FIELD-TESTED" : wear <= 450 ? "WELL-WORN" : "BATTLE-SCARRED";
  const selectedEquipped = selectedBase ? equipped[slotKey(side, category, selectedBase)] : undefined;
  const visibleTeamLoadout = teamLoadouts[side];
  const teamSlotCount = visibleTeamLoadout.reduce((total, section) => total + section.slots.length, 0);
  const showTeamLoadout = category === "Skins" && boardView === "loadout" && group === "ALL" && !boardQuery;

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1600);
  }

  function switchCategory(next: BoardCategory) {
    setCategory(next);
    setSelectedBase(null);
    setBoardQuery("");
    setSkinQuery("");
    setGroup("ALL");
    setBoardLimit(120);
  }

  function switchSide(next: TeamSide) {
    setSide(next);
    setSelectedBase(null);
    setSkinQuery("");
    setBoardQuery("");
  }

  function openLoadoutShortcut(next: typeof loadoutShortcuts[number]) {
    switchCategory(next.category);
    setGroup(next.group);
  }

  function sideCount(team: TeamSide) {
    return Object.keys(equipped).filter(key => key.startsWith(`${team}:`)).length;
  }

  function slotKey(team: TeamSide, slotCategory: BoardCategory, baseName?: string | null) {
    if (slotCategory === "Skins") return `${team}:${slotCategory}:${baseName ?? ""}`;
    return `${team}:${slotCategory}`;
  }

  function chooseBase(name: string) {
    setSelectedBase(name);
    setSkinQuery("");
    setSkinLimit(120);
  }

  function chooseLoadoutSlot(name: string) {
    setGroup("ALL");
    chooseBase(name);
  }

  function equip(item: CatalogItem, key: string) {
    setEquipped(previous => ({ ...previous, [key]: item }));
    flash(`${cleanName(item)} сонгогдлоо`);
  }

  function openEditor(item: CatalogItem, preferredKey?: string) {
    const key = preferredKey || Object.entries(equipped).find(([entryKey, value]) => entryKey.startsWith(`${side}:`) && value?.id === item.id)?.[0] || Object.entries(equipped).find(([, value]) => value?.id === item.id)?.[0] || null;
    const saved = key ? crafts[key] : undefined;
    setEditorKey(key);
    setEditorItem(item);
    setSelectedSlot(null);
    setAccessoryQuery("");
    setAccessoryLimit(48);
    setAccessoryTab("stickers");
    setStickers(saved?.stickers?.length ? saved.stickers : Array(5).fill(null));
    setCharm(saved?.charm ?? null);
    setWear(saved?.wear ?? 60);
    setPattern(saved?.pattern ?? 348);
    setStatTrak(saved?.statTrak ?? false);
    setNameTag(saved?.nameTag ?? "");
  }

  function addSticker(item: CatalogItem) {
    const slot = selectedSlot ?? stickers.findIndex(entry => entry === null);
    if (slot < 0) {
      flash("5 sticker slot дүүрсэн байна");
      return;
    }
    setStickers(previous => previous.map((entry, index) => index === slot ? { item, x: 50, y: 50, rotation: 0, scale: 100 } : entry));
    setSelectedSlot(slot);
  }

  function updatePlacement(property: "x" | "y" | "rotation" | "scale", value: number) {
    if (selectedSlot === null) return;
    setStickers(previous => previous.map((entry, index) => index === selectedSlot && entry ? { ...entry, [property]: value } : entry));
  }

  function beginPreviewRotate(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".preview-sticker-dot")) return;
    setDraggingPreview(true);
    previewDragRef.current = { x: event.clientX, y: event.clientY, rx: previewRotation.x, ry: previewRotation.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePreviewRotate(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingPreview) return;
    const dx = event.clientX - previewDragRef.current.x;
    const dy = event.clientY - previewDragRef.current.y;
    setPreviewRotation({ x: Math.max(-24, Math.min(24, previewDragRef.current.rx - dy * .12)), y: previewDragRef.current.ry + dx * .22 });
  }

  function placeStickerAt(item: CatalogItem, clientX: number, clientY: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100));
    const slot = selectedSlot ?? stickers.findIndex(entry => entry === null);
    if (slot < 0) return flash("5 sticker slot дүүрсэн байна");
    setStickers(previous => previous.map((entry, index) => index === slot ? { item, x, y, rotation: 0, scale: 100 } : entry));
    setSelectedSlot(slot);
  }

  function dragPlacedSticker(event: ReactPointerEvent<HTMLButtonElement>, index: number) {
    event.stopPropagation();
    setSelectedSlot(index);
    const stage = event.currentTarget.closest(".fake-3d-stage") as HTMLElement | null;
    if (!stage) return;
    const move = (moveEvent: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = Math.max(4, Math.min(96, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(8, Math.min(92, ((moveEvent.clientY - rect.top) / rect.height) * 100));
      setStickers(previous => previous.map((entry, slot) => slot === index && entry ? { ...entry, x, y } : entry));
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function categoryCount(id: BoardCategory) {
    if (id === "Skins") return catalog.skins.filter(item => item.kind === "Skins").length;
    if (id === "Knives" || id === "Gloves") return catalog.skins.filter(item => item.kind === id).length;
    if (id === "Agents") return remoteTotals.agents ?? catalog.agents.length;
    if (id === "Music Kits") return remoteTotals.music ?? catalog.music.length;
    return remoteTotals.medals ?? catalog.medals.length;
  }

  function specialKey(team: TeamSide, panelCategory: BoardCategory) {
    return `${team}:${panelCategory}`;
  }

  function openSpecialCategory(nextCategory: BoardCategory, nextSide: TeamSide) {
    setSide(nextSide);
    setCategory(nextCategory);
    setSelectedBase(null);
    setBoardQuery("");
    setSkinQuery("");
    setGroup("ALL");
    setBoardView(nextCategory === "Skins" ? "loadout" : "catalog");
  }

  function renderSpecialPanel(team: TeamSide) {
    return <aside className={`cs2-side-panel ${team.toLowerCase()} ${side === team ? "active" : ""}`}>
      <button className={`side-panel-hero ${teamAgentPreview[team]?.image ? "has-agent" : ""}`} onClick={() => openSpecialCategory("Agents", team)}>
        {teamAgentPreview[team]?.image && <img className="side-agent-image" src={teamAgentPreview[team]!.image} alt={cleanName(teamAgentPreview[team]!)} loading="lazy" referrerPolicy="no-referrer" />}
        <div className="side-panel-copy">
          <span className="side-panel-tag">EQUIP {team}</span>
          <strong>{teamAgentPreview[team] ? cleanName(teamAgentPreview[team]!) : team === "CT" ? "DEFAULT CT AGENT" : "DEFAULT T AGENT"}</strong>
          <small>{teamAgentPreview[team]?.rarity ?? `${sideCount(team)} EQUIPPED`}</small>
        </div>
        <b>{team}</b>
      </button>
      <div className="side-panel-specials">
        {specialPanels.map(panel => {
          const item = equipped[slotKey(team, panel.category)];
          return <button key={`${team}-${panel.category}`} className={`side-special-card ${category === panel.category && side === team ? "active" : ""}`} style={{ "--item-color": equippedColor(item) } as CSSProperties} onClick={() => openSpecialCategory(panel.category, team)}>
            <div>
              <span>{panel.label}</span>
              <strong>{item ? cleanName(item) : panel.category === "Agents" ? `DEFAULT ${team} AGENT` : panel.category === "Knives" ? "VANILLA KNIFE" : panel.category === "Gloves" ? "DEFAULT GLOVES" : `DEFAULT ${panel.label}`}</strong>
              <small>{item ? item.rarity : panel.teamAware ? `TEAM ${team}` : "LOADOUT"}</small>
            </div>
            {item?.image ? <CatalogThumb item={item} className="side-special-thumb" /> : <i>{panel.label[0]}</i>}
          </button>;
        })}
      </div>
    </aside>;
  }

  return <main className={`page-wrap changer-page pro-changer-page ${steamAuthed === false ? "skinchanger-locked" : ""}`}>
    {steamAuthed === false && <div className="steam-skin-gate"><div className="steam-skin-gate-card"><span><Icon name="steam" size={28} /></span><small>WINGS LOADOUT ACCESS</small><strong>STEAM LOGIN REQUIRED</strong><p>Skin Changer болон SteamID64-д хадгалагдах loadout ашиглахын тулд Steam-ээр нэвтэрнэ үү.</p><a href="/login">SIGN IN WITH STEAM <Icon name="arrow" size={15} /></a></div></div>}
    <PageHeading icon="skin" eyebrow="LIVE COSMETIC STUDIO" title="SKIN CHANGER" description="Steam-д холбогдсон personal loadout" />

    <section className="catalog-status-strip">
      <div><i className={catalogState} /><span>{catalogState === "live" ? "LIVE CS2 CATALOG" : catalogState === "loading" ? "CATALOG SYNCING" : "LOCAL CATALOG"}</span></div>
      <div><span>SIDE</span><strong>{side}</strong><b /> <span>LOADOUT</span><strong>{equippedCount}</strong><b /> <span>SKINS</span><strong>{remoteTotals.skins ?? catalog.skins.length}</strong><b /> <span>STICKERS</span><strong>{remoteTotals.stickers ?? catalog.stickers.length}</strong></div>
    </section>

    <section className="loadout-team-toggle" aria-label="Loadout side">
      <button className={side === "CT" ? "active ct" : "ct"} onClick={() => switchSide("CT")}><span>CT</span><strong>COUNTER-TERRORIST</strong><small>{sideCount("CT")} EQUIPPED</small></button>
      <button className={side === "T" ? "active t" : "t"} onClick={() => switchSide("T")}><span>T</span><strong>TERRORIST</strong><small>{sideCount("T")} EQUIPPED</small></button>
    </section>

    <section className="pro-loadout-shell">
      <section className="team-loadout-switch" aria-label="CT болон T loadout сонголт">
        <button className={`team-side-card team-ct ${side === "CT" ? "active" : ""}`} onClick={() => switchSide("CT")}><i><Icon name="shield" size={20} /></i><div><span>COUNTER-TERRORISTS</span><strong>CT LOADOUT</strong><small>{sideCount("CT")} EQUIPPED</small></div><b>CT</b></button>
        <nav className="loadout-shortcuts" aria-label="Loadout slots">{loadoutShortcuts.map(item => <button key={item.label} className={category === item.category && (item.category !== "Skins" || group === item.group) ? "active" : ""} onClick={() => openLoadoutShortcut(item)}><i /><span>{item.label}<small>{item.note}</small></span></button>)}</nav>
        <button className={`team-side-card team-t ${side === "T" ? "active" : ""}`} onClick={() => switchSide("T")}><b>T</b><div><span>TERRORISTS</span><strong>T LOADOUT</strong><small>{sideCount("T")} EQUIPPED</small></div><i><Icon name="spark" size={20} /></i></button>
      </section>

      <div className="pro-loadout-body">
        {selectedBase && <div className="skin-picker-overlay" role="presentation" onClick={event => { if (event.target === event.currentTarget) setSelectedBase(null); }}>
          <section className="loadout-picker-drawer skin-picker-modal" role="dialog" aria-modal="true" aria-label={`${selectedBase} skin selection`}>
            <header><div><span>{side} / {category.toUpperCase()}</span><strong>{selectedBase}</strong><small>SKIN SELECT</small></div><button onClick={() => setSelectedBase(null)} aria-label="Close selection"><Icon name="close" size={14} /></button></header>
            <div className="loadout-picker-toolbar">
              <div className="selected-base-chip" style={{ "--item-color": equippedColor(selectedEquipped) } as CSSProperties}>{selectedEquipped?.image ? <CatalogThumb item={selectedEquipped} className="selected-base-thumb" /> : (weaponPreviewByName.get(selectedBase.trim().toLowerCase()) ? <CatalogThumb item={weaponPreviewByName.get(selectedBase.trim().toLowerCase())!} className="selected-base-thumb" /> : <span>{initials(selectedBase)}</span>)}<div><small>CURRENT</small><strong>{selectedEquipped ? cleanName(selectedEquipped) : selectedBase}</strong><em>{selectedEquipped?.rarity ?? "Default / No Skin"}</em></div></div>
              <label className="pro-search rail-search"><Icon name="search" size={14} /><input value={skinQuery} onChange={event => setSkinQuery(event.target.value)} placeholder="Skin нэрээр хайх..." autoFocus /></label>
              <div className="rail-result-count"><span>SKINS</span><strong>{selectedSkins.length}</strong></div>
            </div>
            <div className="drawer-skin-grid">
              {selectedSkins.slice(0, skinLimit).map(item => <article key={item.id} className={`pro-skin-row ${selectedEquipped?.id === item.id ? "active" : ""}`} style={rarityStyle(item)}><button onClick={() => { equip(item, slotKey(side, category, selectedBase)); setSelectedBase(null); openEditor(item, slotKey(side, category, selectedBase)); }}><CatalogThumb item={item} className="rail-skin-thumb" /><span><small>{item.rarity}</small><strong>{cleanName(item)}</strong><em>{item.collection}</em></span></button>{selectedEquipped?.id === item.id && <button className="rail-settings" onClick={() => openEditor(item, slotKey(side, category, selectedBase))} aria-label="Open settings"><Icon name="settings" size={14} /></button>}</article>)}
            </div>
            {selectedSkins.length > skinLimit && <button className="catalog-more" onClick={() => setSkinLimit(value => value + 120)}>MORE SKINS <span>{selectedSkins.length - skinLimit}</span></button>}
            {selectedSkins.length === 0 && <div className="rail-empty">Энэ item-ийн skin олдсонгүй.</div>}
          </section>
        </div>}

        <section className="pro-catalog-board loadout-board-full">
          <header className="pro-board-toolbar"><div><span>{side} / {category === "Skins" ? "LOADOUT" : `${category.toUpperCase()} SELECT`}</span><strong>{category === "Agents" || category === "Music Kits" || category === "Medals" ? directItems.length : baseItems.length}</strong></div><div className="pro-board-actions">{category !== "Skins" && <button className="loadout-back-button" onClick={() => { setCategory("Skins"); setSelectedBase(null); setBoardQuery(""); setSkinQuery(""); setGroup("ALL"); setBoardView("loadout"); }}>← LOADOUT</button>}{category === "Skins" && <nav className="catalog-view-switch" aria-label="Loadout view"><button className={boardView === "loadout" ? "active" : ""} onClick={() => { setBoardView("loadout"); setGroup("ALL"); setBoardQuery(""); }}>LOADOUT</button><button className={boardView === "catalog" ? "active" : ""} onClick={() => setBoardView("catalog")}>ALL ITEMS</button></nav>}<label className="pro-search"><Icon name="search" size={14} /><input value={boardQuery} onChange={event => { setBoardQuery(event.target.value); setBoardLimit(120); }} placeholder="Catalog хайх..." /></label></div></header>
          {category === "Skins" && <nav className="pro-group-tabs">{groups.map(item => <button key={item} className={group === item ? "active" : ""} onClick={() => setGroup(item)}>{item}</button>)}</nav>}

          {showTeamLoadout ? <section className="cs2-loadout-stage">
            {renderSpecialPanel("CT")}
            <section className={`match-loadout-board side-${side.toLowerCase()}`} aria-label={`${side} loadout`}>
              <header className="match-loadout-heading"><div><span>ACTIVE SIDE</span><strong>{side === "CT" ? "COUNTER-TERRORIST" : "TERRORIST"} LOADOUT</strong></div><small>{sideCount(side)} / {teamSlotCount} EQUIPPED</small></header>
              <div className="match-loadout-groups">{visibleTeamLoadout.map(section => <section key={section.label} className={`match-loadout-section section-${section.label.toLowerCase().replace(/\s+/g, "-")}`}><header><span>{section.label}</span><i /><small>{section.slots.length}</small></header><div className="match-loadout-slots">{section.slots.map(name => {
                const selected = equipped[`${side}:Skins:${name}`];
                const preview = weaponPreviewByName.get(name.trim().toLowerCase());
                return <button key={name} className={`match-loadout-slot ${selectedBase === name ? "focused" : ""} ${selected && selected.rarity !== "Default" ? "equipped" : ""}`} style={{ "--item-color": equippedColor(selected) } as CSSProperties} onClick={() => chooseLoadoutSlot(name)}>{selected?.image ? <CatalogThumb item={selected} className="loadout-slot-thumb" /> : preview?.image ? <CatalogThumb item={preview} className="loadout-slot-thumb vanilla-preview" /> : <span className="loadout-slot-mark">{initials(name)}</span>}<span><strong>{name}</strong><small>{selected ? cleanName(selected) : "DEFAULT"}</small></span>{selected && selected.rarity !== "Default" && <i />}</button>;
              })}</div></section>)}</div>
            </section>
            {renderSpecialPanel("T")}
          </section> : <div className="pro-catalog-grid">
            {(category === "Skins" || category === "Knives" || category === "Gloves") ? baseItems.map(item => {
              const selected = category === "Skins" ? equipped[slotKey(side, category, item.name)] : Object.values(equipped).find(entry => entry && entry.kind === category && sameText(entry.weapon, item.name) && true) && equipped[slotKey(side, category)];
              const activeSelected = category === "Skins" ? selected : (equipped[slotKey(side, category)] && sameText(equipped[slotKey(side, category)].weapon, item.name) ? equipped[slotKey(side, category)] : undefined);
              const count = skinCatalog.filter(skin => sameText(skin.weapon, item.name)).length;
              return <article key={item.name} className={`pro-item-card ${selectedBase === item.name ? "focused" : ""} ${(activeSelected ?? selected) && (activeSelected ?? selected)!.rarity !== "Default" ? "equipped" : "vanilla-item"}`} style={{ "--item-color": equippedColor((activeSelected ?? selected) || undefined) } as CSSProperties}><button onClick={() => chooseBase(item.name)}>{item.source && item.image ? <CatalogThumb item={item.source} className="item-aurora-glyph" /> : <span className="item-aurora-glyph"><i>{initials(item.name)}</i><b /></span>}<div><small>{(activeSelected ?? selected) && (activeSelected ?? selected)!.rarity !== "Default" ? (activeSelected ?? selected)!.rarity : item.group}</small><strong>{item.name}</strong><em>{(activeSelected ?? selected) ? cleanName((activeSelected ?? selected)!) : `${count} SKINS`}</em></div></button>{(activeSelected ?? selected) && (activeSelected ?? selected)!.rarity !== "Default" && <button className="card-settings" onClick={() => openEditor((activeSelected ?? selected)!, slotKey(side, category, item.name))} aria-label="Configure selected skin"><Icon name="settings" size={14} /></button>}</article>;
            }) : directItems.slice(0, boardLimit).map(item => {
              const selected = equipped[slotKey(side, category)]?.id === item.id;
              return <article key={item.id} className={`pro-item-card direct ${selected ? "focused equipped" : ""}`} style={rarityStyle(item)}><button onClick={() => { equip(item, slotKey(side, category)); setCategory("Skins"); setBoardQuery(""); setGroup("ALL"); setBoardView("loadout"); }}><CatalogThumb item={item} className="item-aurora-glyph" /><div><small>{item.rarity}</small><strong>{cleanName(item)}</strong><em>{item.collection}</em></div></button></article>;
            })}
          </div>}

          {directItems.length > boardLimit && <button className="catalog-more board-more" onClick={() => setBoardLimit(value => value + 120)}>MORE ITEMS <span>{directItems.length - boardLimit}</span></button>}
          {(category === "Agents" || category === "Music Kits" || category === "Medals") && directItems.length === 0 && <div className="board-empty">Catalog ачаалж байна...</div>}
          {(category === "Skins" || category === "Knives" || category === "Gloves") && baseItems.length === 0 && <div className="board-empty">Item олдсонгүй.</div>}
        </section>
      </div>
    </section>

    {editorItem && <div className="pro-editor-overlay" role="presentation" onClick={event => { if (event.target === event.currentTarget) setEditorItem(null); setEditorKey(null); }}><section className="pro-editor-modal" role="dialog" aria-modal="true" aria-label="Cosmetic settings">
      <header className="pro-editor-heading"><div><span>COSMETIC SETTINGS</span><strong>{editorItem.name}</strong></div><button onClick={() => { setEditorItem(null); setEditorKey(null); }} aria-label="Close editor"><Icon name="close" size={16} /></button></header>
      <div className="pro-editor-layout">
        <section className="craft-preview-panel fullscreen-craft-preview">
          <div className="fake-3d-stage" style={rarityStyle(editorItem)}
            onPointerDown={beginPreviewRotate} onPointerMove={movePreviewRotate} onPointerUp={() => setDraggingPreview(false)} onPointerCancel={() => setDraggingPreview(false)}
            onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (draggedSticker) placeStickerAt(draggedSticker, event.clientX, event.clientY, event.currentTarget); setDraggedSticker(null); }}>
            <span className="preview-grid" />
            <div className="preview-identity"><small>FAKE 3D PREVIEW · DRAG TO ROTATE</small><strong>{editorItem.weapon || editorItem.kind} | {cleanName(editorItem)}</strong><em>{editorItem.rarity}</em></div>
            <div className="fake-3d-object" style={{ transform: `perspective(1100px) rotateX(${previewRotation.x}deg) rotateY(${previewRotation.y}deg)` }}>
              <span className="fake-3d-depth" />
              {editorItem.image ? <CatalogThumb item={editorItem} className="preview-weapon-image fake-model-image" /> : <span className="preview-core">{initials(editorItem.weapon || editorItem.name)}</span>}
            </div>
            {editorItem.kind === "Skins" && stickers.map((entry, index) => entry && <button key={index} className={`preview-sticker-dot ${selectedSlot === index ? "selected" : ""}`} style={{ left: `${entry.x}%`, top: `${entry.y}%`, transform: `translate(-50%,-50%) rotate(${entry.rotation}deg) scale(${entry.scale / 100})` }} onPointerDown={event => dragPlacedSticker(event, index)}><CatalogThumb item={entry.item} /></button>)}
            {editorItem.kind === "Skins" && charm && <span className="preview-charm"><CatalogThumb item={charm} /></span>}
            <div className="preview-meta"><span>FLOAT {floatValue}</span><span>PATTERN #{pattern}</span><span>{statTrak ? "STATTRAK" : "STANDARD"}</span></div>
            <button className="reset-3d" onClick={event => { event.stopPropagation(); setPreviewRotation({ x: -4, y: 0 }); }}>RESET VIEW</button>
          </div>
          <p>Зэвсгийг mouse-аар чирээд 360° эргүүлнэ. Sticker-ээ доорх catalog-оос preview дээр чирж тавиад, наасан sticker-ээ mouse-аар шууд зөөнө.</p>
        </section>

        <section className="pro-editor-controls">
          {editorItem.kind === "Skins" && <>
          <div className="editor-control-head"><span>STICKER CRAFT</span><strong>{stickerCount}/5</strong></div>
          <div className="pro-sticker-slots">{stickers.map((entry, index) => <button key={index} className={`${entry ? "filled" : ""} ${selectedSlot === index ? "active" : ""}`} onClick={() => { setSelectedSlot(index); setAccessoryTab("stickers"); }}>{entry ? <CatalogThumb item={entry.item} /> : <Icon name="plus" size={14} />}</button>)}</div>
          {selectedPlacement && <div className="placement-card drag-placement-card"><div><strong>{cleanName(selectedPlacement.item)}</strong><button onClick={() => { setStickers(previous => previous.map((entry, index) => index === selectedSlot ? null : entry)); setSelectedSlot(null); }}>REMOVE</button></div><p>Sticker-ээ preview дээр mouse-аар drag хийнэ.</p><div className="sticker-transform-buttons"><button onClick={() => updatePlacement("rotation", selectedPlacement.rotation - 15)}>↶ ROTATE</button><button onClick={() => updatePlacement("rotation", selectedPlacement.rotation + 15)}>ROTATE ↷</button><button onClick={() => updatePlacement("scale", Math.max(50, selectedPlacement.scale - 10))}>− SIZE</button><button onClick={() => updatePlacement("scale", Math.min(180, selectedPlacement.scale + 10))}>+ SIZE</button></div></div>}
          </>}
          <label className="pro-editor-range"><span>FLOAT<b>{floatValue}</b></span><input type="range" min="0" max="1000" value={wear} onChange={event => setWear(Number(event.target.value))} /><small>{wearName}</small></label>
          <label className="pro-editor-range"><span>PATTERN<b>#{pattern}</b></span><input type="range" min="0" max="999" value={pattern} onChange={event => setPattern(Number(event.target.value))} /></label>
          {editorItem.kind !== "Gloves" && <label className="name-tag-field"><span>NAME TAG <b>{nameTag.length}/20</b></span><input maxLength={20} value={nameTag} onChange={event => setNameTag(event.target.value)} placeholder="Custom NameTag" /></label>}
          {editorItem.kind !== "Gloves" && <button className={`stattrak-toggle ${statTrak ? "active" : ""}`} onClick={() => setStatTrak(value => !value)}><span>STATTRAK™</span><i /></button>}
          {editorItem.kind === "Skins" && <div className="charm-row"><span>CHARM</span><button onClick={() => setAccessoryTab("charms")}>{charm ? cleanName(charm) : "+ SELECT CHARM"}</button>{charm && <button onClick={() => setCharm(null)} aria-label="Remove charm"><Icon name="close" size={12} /></button>}</div>}
          <button className="save-craft" onClick={() => { flash("Тохиргоо автоматаар хадгалагдлаа"); setEditorItem(null); setEditorKey(null); }}>APPLY SETTINGS <Icon name="arrow" size={14} /></button>
        </section>

        {editorItem.kind === "Skins" && <aside className="pro-accessory-catalog">
          <nav><button className={accessoryTab === "stickers" ? "active" : ""} onClick={() => { setAccessoryTab("stickers"); setAccessoryLimit(48); setAccessoryQuery(""); }}>STICKERS <small>{remoteTotals.stickers ?? catalog.stickers.length}</small></button><button className={accessoryTab === "charms" ? "active" : ""} onClick={() => { setAccessoryTab("charms"); setAccessoryLimit(48); setAccessoryQuery(""); }}>CHARMS <small>{remoteTotals.charms ?? catalog.charms.length}</small></button></nav>
          <label className="pro-search accessory-search"><Icon name="search" size={14} /><input value={accessoryQuery} onChange={event => { setAccessoryQuery(event.target.value); setAccessoryLimit(48); }} placeholder="Нэр, rarity, event..." /></label>
          <div className="accessory-result-label"><span>RESULTS</span><strong>{accessoryItems.length}</strong></div>
          <div className="pro-accessory-grid">{accessoryItems.slice(0, accessoryLimit).map(item => <button key={item.id} className="pro-accessory-item" style={rarityStyle(item)} draggable={accessoryTab === "stickers"} onDragStart={() => accessoryTab === "stickers" && setDraggedSticker(item)} onDragEnd={() => setDraggedSticker(null)} onClick={() => accessoryTab === "stickers" ? addSticker(item) : setCharm(item)}><CatalogThumb item={item} /><strong>{cleanName(item)}</strong><small>{item.effect || item.rarity}</small></button>)}</div>
          {accessoryItems.length > accessoryLimit && <button className="catalog-more" onClick={() => setAccessoryLimit(value => value + 96)}>MORE <span>{accessoryItems.length - accessoryLimit}</span></button>}
          {accessoryItems.length === 0 && <div className="accessory-empty">Catalog ачаалж байна...</div>}
        </aside>}
      </div>
    </section></div>}

    {notice && <div className="toast">{notice}</div>}
  </main>;
}
