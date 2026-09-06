"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const categories = ["Бүгд", "Models", "Masks", "Hats", "Wings", "Backpacks", "Effects", "Music Kits", "Badges", "Stickers", "Charms"];
const roadmap = [
  { title: "Character cosmetics", text: "Player models, mask, hats, wings, backpacks зэрэг custom cosmetic modules." },
  { title: "Server utilities", text: "Top up, rental boosts, VIP utility болон role-linked perks." },
  { title: "Collectibles", text: "Sticker, charm, medal, badge, seasonal drops болон limited items." },
];

export default function StorePage() {
  const [filter, setFilter] = useState("Бүгд");
  const [query, setQuery] = useState("");
  const title = useMemo(() => filter === "Бүгд" ? "Бүх бараа" : filter, [filter]);

  return (
    <main className="page-wrap">
      <PageHeading icon="spark" eyebrow="COMMUNITY STORE" title="STORE" description="Future store layout, category browser and roadmap showcase" />

      <section className="neo-store-shell">
        <section className="neo-store-hero">
          <div>
            <span>WINGS STORE / EARLY ACCESS</span>
            <h2>Flexible shop system.</h2>
            <p>Энэ page-ийг зүгээр хоосон state биш, category-driven storefront preview болгож шинэчиллээ.</p>
          </div>
          <div className="neo-store-info"><strong>00</strong><small>Live items for now</small></div>
        </section>

        <nav className="collection-categories neo-store-categories" aria-label="Дэлгүүрийн ангилал">
          {categories.map((category) => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}<small>0</small></button>)}
        </nav>

        <section className="collection-control neo-store-control">
          <div><span>00 ITEM</span><h2>{title}</h2></div>
          <div><label className="collection-search"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Бараа хайх..." /></label></div>
        </section>

        <div className="neo-store-roadmap">
          {roadmap.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <section className="store-empty-state neo-store-empty">
          <i><Icon name="spark" size={27} /></i>
          <h2>Бараа нэмэгдээгүй байна</h2>
          <span>{query ? "Хайлтад тохирох бараа алга." : "Удахгүй live inventory болон shop items энд нэмэгдэнэ."}</span>
        </section>
      </section>
    </main>
  );
}
