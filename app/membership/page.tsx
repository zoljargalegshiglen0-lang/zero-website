"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const tiers = [
  { name: "VOID", color: "void", tag: "SIGNAL / I", price: "Тун удахгүй", features: ["VOID profile badge", "Custom profile accent", "Community role", "Extended profile stats"] },
  { name: "PHANTOM", color: "phantom", tag: "SIGNAL / II", price: "Тун удахгүй", features: ["PHANTOM profile theme", "Animated badge preview", "Exclusive profile frame", "Community spotlight", "Event access preview"] },
  { name: "ECLIPSE", color: "eclipse", tag: "SIGNAL / III", price: "Тун удахгүй", features: ["ECLIPSE identity pack", "Custom profile layout", "Exclusive visual effects", "Clan profile highlight", "Priority community support"] },
  { name: "SINGULARITY", color: "singularity", tag: "SIGNAL / IV", price: "Тун удахгүй", features: ["All visual identity options", "Season founder mark", "Custom name treatment", "Special community role", "Early feature preview", "Direct staff support"] },
];

export default function MembershipPage() {
  const [selected, setSelected] = useState("PHANTOM");
  const current = tiers.find((tier) => tier.name === selected) ?? tiers[1];

  return (
    <main className="page-wrap">
      <PageHeading icon="crown" eyebrow="IDENTITY TIERS" title="MEMBERSHIP" description="Role-based premium identity system for the WINGS ecosystem" />

      <section className="neo-membership-shell">
        <article className="neo-membership-hero">
          <div>
            <span>ROLE COLLECTION / 2026</span>
            <h2>{current.name}</h2>
            <p>Membership page-ийг plain жагсаалт биш, identity product showcase хэлбэртэй болгож шинэчлэв.</p>
          </div>
          <div className="neo-membership-preview">
            <span>CURRENT PREVIEW</span>
            <strong>{current.price}</strong>
            <small>{current.tag}</small>
          </div>
        </article>

        <div className="identity-grid neo-membership-grid">
          {tiers.map((tier, index) => (
            <article className={`identity-card identity-${tier.color} ${selected === tier.name ? "selected" : ""}`} key={tier.name}>
              <span>{tier.tag}</span>
              <h3>{tier.name}</h3>
              <div className="identity-mark">{String(index + 1).padStart(2, "0")}</div>
              <b className="neo-tier-price">{tier.price}</b>
              <ul>{tier.features.map((feature) => <li key={feature}><Icon name="check" size={14} />{feature}</li>)}</ul>
              <button onClick={() => setSelected(tier.name)}>{selected === tier.name ? "SELECTED" : "PREVIEW ROLE"}<Icon name="arrow" size={14} /></button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
