"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

const categories = ["Бүгд", "Models", "Masks", "Hats", "Wings", "Backpacks", "Effects", "Music Kits", "Badges", "Stickers", "Charms"];

export default function StorePage() {
  const [filter, setFilter] = useState("Бүгд");
  const [query, setQuery] = useState("");

  return <main className="page-wrap collection-page empty-store-page">
    <section className="collection-hero"><div><span>WINGS NETWORK / COMMUNITY STORE</span><h1>ДЭЛГҮҮР<span>.</span></h1><p>Custom models · effects · accessories</p></div><div className="collection-hero-stats"><div><span>ITEMS</span><strong>0<small> ITEMS</small></strong></div></div></section>
    <nav className="collection-categories" aria-label="Дэлгүүрийн ангилал">{categories.map(category => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}<small>0</small></button>)}</nav>
    <section className="collection-control"><div><span>00 ITEM</span><h2>{filter === "Бүгд" ? "Бүх бараа" : filter}</h2></div><div><label className="collection-search"><Icon name="search" size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Бараа хайх..." /></label></div></section>
    <section className="store-empty-state"><i><Icon name="spark" size={27}/></i><h2>Бараа нэмэгдээгүй байна</h2><span>{query ? "Хайлтад тохирох бараа алга." : "Удахгүй"}</span></section>
  </main>;
}
