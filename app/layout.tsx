import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const title = "WINGS — CS2 Community";
const description = "WINGS community platform — premium dashboards, live servers, cosmetic loadouts, community tools and team profiles.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "WINGS — CS2 Community" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className="antialiased cosmic-shell">
        <SiteHeader />
        {children}
        <footer className="site-footer wings-site-footer">
          <Link className="logo wings-footer-brand" href="/"><span className="logo-mark"><img src="/wings-mark-aurora.svg" alt="WINGS" /></span><span>WINGS<small>CS2 COMMUNITY</small></span></Link>
          <nav>
            <Link href="/servers">SERVERS</Link>
            <Link href="/clans">CLANS</Link>
            <Link href="/staff">STAFF</Link>
          </nav>
          <span><i /> ULAANBAATAR · 2026</span>
        </footer>
      </body>
    </html>
  );
}
