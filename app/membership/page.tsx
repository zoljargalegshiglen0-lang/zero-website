import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const tiers = [
  { name: "CORE", note: "Community access", price: "Тун удахгүй", features: ["Discord role sync", "Basic profile badge", "Community announcements"] },
  { name: "PLUS", note: "Expanded identity", price: "Тун удахгүй", features: ["Enhanced profile styling", "Priority queue perks", "Extra community panels"] },
  { name: "PRO", note: "Power user plan", price: "Тун удахгүй", features: ["Advanced site features", "Priority support", "Future premium integrations"] },
  { name: "ELITE", note: "Highest membership tier", price: "Тун удахгүй", features: ["Exclusive identity pack", "Special event access", "Premium server utility roadmap"] },
];

export default function MembershipPage() {
  return (
    <main className="page-wrap">
      <PageHeading icon="crown" eyebrow="COMMUNITY MEMBERSHIP" title="MEMBERSHIP" description="Planned membership system with clean cards and no fake purchase data" />

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Tiers</span>
            <h2>Planned membership ladder</h2>
          </div>
        </div>
        <div className="mono-card-grid four">
          {tiers.map((tier) => (
            <article key={tier.name} className="mono-tier-card">
              <span>{tier.note}</span>
              <strong>{tier.name}</strong>
              <b>{tier.price}</b>
              <ul>
                {tier.features.map((feature) => <li key={feature}><Icon name="check" size={14} /> {feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
