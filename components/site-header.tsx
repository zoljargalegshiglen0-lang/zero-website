"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { navigation } from "@/lib/data";

const navigationGroups = [
  { title: "CORE", routes: ["/", "/servers", "/leaderboard", "/clans"] },
  { title: "CUSTOMIZE", routes: ["/skinchanger", "/collection", "/membership"] },
  { title: "CONTROL", routes: ["/staff", "/bans", "/admin"] },
];

type HeaderSteamProfile = { name: string; avatar: string; steamId64: string };

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [steamProfile, setSteamProfile] = useState<HeaderSteamProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (mounted && data?.profile) setSteamProfile(data.profile); })
      .catch(() => null);

    return () => { mounted = false; };
  }, []);

  return (
    <>
      <div className="wings-utility-rail neo-utility-rail compact">
        <span><i /> WINGS NETWORK ONLINE</span>
      </div>

      <header className="wings-topbar neo-topbar cleaner">
        <div className="wings-topbar-left">
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Цэс">
            <Icon name={open ? "close" : "menu"} />
          </button>

          <Link className="wings-brand neo-brand" href="/">
            <span className="wings-brand-mark"><img src="/wings-mark-aurora.svg" alt="WINGS" /></span>
            <span className="wings-brand-copy"><b>WINGS</b><small>CS2 COMMUNITY HUB</small></span>
          </Link>
        </div>

        <div className="wings-topbar-right">
          <label className="wings-searchbox neo-searchbox">
            <Icon name="search" size={16} />
            <input aria-label="Search player" placeholder="Search player" />
          </label>
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
                    {item.href === "/skinchanger" ? <b className="wings-nav-badge">new</b> : null}
                  </Link>
                ))}
            </nav>
          </section>
        ))}
      </aside>
    </>
  );
}
