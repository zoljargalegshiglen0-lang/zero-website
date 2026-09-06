import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const categories = [
  { title: "Server utilities", text: "VIP perks, rental boosts, access utilities." },
  { title: "Cosmetics", text: "Future site-controlled cosmetic bundles or unlockables." },
  { title: "Community items", text: "Badges, identity packs, role-linked unlocks." },
];

export default function StorePage() {
  return (
    <main className="page-wrap">
      <PageHeading icon="spark" eyebrow="STORE SYSTEM" title="STORE" description="Clean store shell without fake inventory counters or fake products" />

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Store modules</span>
            <h2>Ready for real products</h2>
          </div>
          <Link href="/rent-server">Rent server</Link>
        </div>

        <div className="mono-card-grid three">
          {categories.map((item) => (
            <article key={item.title} className="mono-info-card">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mono-empty-panel large">
          <i><Icon name="spark" size={28} /></i>
          <strong>No fake items displayed</strong>
          <p>
            Product feed хараахан нэмэгдээгүй байна. Жинхэнэ shop data орохоос өмнө demo бараануудыг зориуд харуулахгүйгээр
            илүү clean, trustworthy байхаар үлдээлээ.
          </p>
        </div>
      </section>
    </main>
  );
}
