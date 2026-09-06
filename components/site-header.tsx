"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { navigation } from "@/lib/data";

const navigationGroups = [
  { title: "CORE", routes: ["/", "/servers", "/leaderboard", "/clans"] },
  { title: "CUSTOMIZE", routes: ["/skinchanger", "/collection", "/membership", "/rent-server"] },
  { title: "CONTROL", routes: ["/staff", "/bans", "/admin"] },
];

type HeaderSteamProfile = { name: string; avatar: string; steamId64: string };
type PublicConfig = { discordUrl?: string };

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [steamProfile, setSteamProfile] = useState<HeaderSteamProfile | null>(null);
  const [discordUrl, setDiscordUrl] = useState("https://discord.gg/tFNYKQpHZe");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return data?.profile ?? null;
      }).catch(() => null),
      fetch("/api/site-config", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<PublicConfig>;
      }).catch(() => null),
    ]).then(([profile, config]) => {
      if (!mounted) return;
      if (profile) setSteamProfile(profile);
      if (config?.discordUrl) setDiscordUrl(config.discordUrl);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="wings-utility-rail neo-utility-rail">
        <span><i /> WINGS NETWORK ONLINE</span>
        <span>Premium CS2 community hub</span>
        <span>Season 01 · Mongolia</span>
      </div>

      <header className="wings-topbar neo-topbar">
        <div className="wings-topbar-left">
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Цэс">
            <Icon name={open ? "close" : "menu"} />
          </button>

          <Link className="wings-brand neo-brand" href="/">
            <span className="wings-brand-mark"><img src="/wings-mark.svg" alt="WINGS" /></span>
            <span className="wings-brand-copy"><b>WINGS</b><small>COMMUNITY CONTROL HUB</small></span>
          </Link>

          <div className="wings-live-pill neo-live-pill"><i /> Live</div>
        </div>

        <div className="wings-topbar-right">
          <label className="wings-searchbox neo-searchbox">
            <Icon name="search" size={16} />
            <input aria-label="Search player" placeholder="Search player" />
          </label>

          <a href={discordUrl} target="_blank" rel="noreferrer" className="wings-topbar-discord">
            <Icon name="discord" size={18} /> <span>Join Discord</span>
          </a>
          <Link href="/collection" className="wings-topbar-button gold">Top up</Link>
          {steamProfile ? (
            <Link href="/profile" className="wings-profile-chip">
              {steamProfile.avatar ? <img src={steamProfile.avatar} alt="" /> : <i className="steam-header-fallback">S</i>}
              <span>{steamProfile.name}</span>
            </Link>
          ) : (
            <Link href="/login" className="wings-topbar-button">Sign In</Link>
          )}
        </div>
      </header>

      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}

      <aside className={open ? "wings-sidebar open" : "wings-sidebar"}>
        <div className="wings-sidebar-head neo-sidebar-head">
          <div>
            <strong>WINGS Navigation</strong>
            <small>All pages and tools</small>
          </div>
          <button className="wings-sidebar-close" onClick={() => setOpen(false)} aria-label="Хаах">
            <Icon name="close" size={14} />
          </button>
        </div>

        {navigationGroups.map((group) => (
          <section className="wings-sidebar-group" key={group.title}>
            <span className="wings-sidebar-label">{group.title}</span>
            <nav className="wings-sidebar-nav" aria-label={group.title}>
              {group.routes
                .map((route) => navigation.find((item) => item.href === route) ?? (route === "/admin" ? { href: "/admin", label: "Admin", short: "Admin", icon: "admin" as const } : null))
                .filter((item): item is NonNullable<typeof item> => Boolean(item))
                .map((item) => (
                  <Link key={item.href} className={path === item.href ? "active" : ""} href={item.href} onClick={() => setOpen(false)}>
                    <i><Icon name={item.icon} size={16} /></i>
                    <span>{item.label}</span>
                    {item.href === "/skinchanger" || item.href === "/clans" ? <b className="wings-nav-badge">new</b> : null}
                  </Link>
                ))}
            </nav>
          </section>
        ))}

        <div className="neo-sidebar-foot">
          <a className="wings-sidebar-discord" href={discordUrl} target="_blank" rel="noreferrer">
            <i className="wings-sidebar-discord-icon"><Icon name="discord" size={24} /></i>
            <div>
              <span>COMMUNITY</span>
              <strong>Join Discord</strong>
            </div>
            <Icon name="arrow" size={16} />
          </a>
          <div className="neo-sidebar-mini-stats">
            <article><strong>24/7</strong><span>support</span></article>
            <article><strong>CS2</strong><span>hub</span></article>
          </div>
        </div>
      </aside>
    </>
  );
}
