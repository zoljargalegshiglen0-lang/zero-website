import type { ReactNode } from "react";

export type IconName = "home" | "server" | "trophy" | "crown" | "clan" | "ban" | "skin" | "rent" | "staff" | "admin" | "arrow" | "steam" | "search" | "copy" | "menu" | "close" | "bolt" | "shield" | "check" | "users" | "clock" | "globe" | "plus" | "trash" | "settings" | "chart" | "spark" | "discord";

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    server: <><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/></>,
    trophy: <><path d="M8 21h8m-4-4v4m-6-8a6 6 0 0 0 12 0V4H6zm0-7H3v3a4 4 0 0 0 3 4m12-7h3v3a4 4 0 0 1-3 4"/></>,
    crown: <><path d="m3 7 4 4 5-7 5 7 4-4-2 11H5z"/><path d="M5 21h14"/></>,
    clan: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20v-2a5 5 0 0 1 10 0v2m2-6a4 4 0 0 1 6 3.5V20"/></>,
    ban: <><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></>,
    skin: <><path d="M7 3h10l2 5-4 2v11H9V10L5 8z"/><path d="M9 6h6"/></>,
    rent: <><path d="M4 7h16v12H4zM8 7V4h8v3"/><path d="M8 12h8m-8 3h5"/></>,
    staff: <><path d="M12 3 5 6v5c0 4.8 2.9 8 7 10 4.1-2 7-5.2 7-10V6z"/><path d="M9 12h6M12 9v6"/></>,
    admin: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="m17 11 2 2 3-3"/></>,
    arrow: <><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
    steam: <><circle cx="17" cy="7" r="4"/><circle cx="7.5" cy="16.5" r="3.5"/><path d="m4.4 14.8-2.1-1.1m8.3 1 3.2-5.1m-5.7 9.5 1.2.5a4 4 0 0 0 5.1-2.2l2.9-6.5"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    menu: <><path d="M4 8h16M4 16h16"/></>, close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-12h-7z"/>,
    shield: <><path d="m12 22 7-4V7l-7-4-7 4v11z"/><path d="m9 12 2 2 4-4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m13-13a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-3.87"/><circle cx="10" cy="8" r="4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7M10 11v6M14 11v6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></>,
    chart: <><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></>,
    spark: <path d="m12 3 2.1 6.3L20 11l-5.9 1.7L12 19l-2.1-6.3L4 11l5.9-1.7z"/>,
    discord: <><path d="M8.2 8.4a10.9 10.9 0 0 1 7.6 0"/><path d="M7 17c1.7 1.2 3.4 1.8 5 1.8s3.3-.6 5-1.8c1.1-2.1 1.7-4.6 1.5-7.1-1.4-1-2.8-1.7-4.2-2.1l-.7 1.2a7.6 7.6 0 0 0-3.2 0l-.7-1.2c-1.4.4-2.8 1.1-4.2 2.1-.2 2.5.4 5 1.5 7.1Z"/><circle cx="9.4" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="14.6" cy="13" r="1" fill="currentColor" stroke="none"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
