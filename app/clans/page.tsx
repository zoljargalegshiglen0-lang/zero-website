import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

export default function ClansPage() {
  const features = [
    { title: "Clan registry", text: "Team tag, roster, recruitment status, clan page холбоход бэлэн layout." },
    { title: "Season support", text: "Clan wars, placement, seasonal standings хэсгүүдийг дараа нь live data-р дүүргэнэ." },
    { title: "Clean fallback", text: "Хуурамч clan ranking list-ийг default-д гаргахгүй." },
  ];

  return (
    <main className="page-wrap">
      <PageHeading icon="clan" eyebrow="TEAM SYSTEM" title="CLANS" description="Clan directory and roster system-д зориулсан clean placeholder-free page" />

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Clan hub</span>
            <h2>Roster system pending live data</h2>
          </div>
          <Link href="/membership">Membership</Link>
        </div>

        <div className="mono-card-grid three">
          {features.map((item) => (
            <article key={item.title} className="mono-info-card">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mono-empty-panel large">
          <i><Icon name="clan" size={28} /></i>
          <strong>No fake clans shown</strong>
          <p>
            Clan creation / roster data source одоогоор холбогдоогүй байна.
            Холбогдсоны дараа clan browser, clan detail, member list, invite flow энд шууд ажиллана.
          </p>
          <div className="mono-inline-links">
            <Link className="page-button" href="/servers">Open servers</Link>
            <Link className="ghost-button" href="/admin">Open admin</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
