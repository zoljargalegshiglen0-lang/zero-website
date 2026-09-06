import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

export default function LeaderboardPage() {
  const blocks = [
    { title: "No fake ladder", text: "Хуурамч player rank list-г default-аар нуусан." },
    { title: "Ready for real stats", text: "Plugin эсвэл bridge-ээс ELO / wins / K-D өгөгдөл ороход энэ page автоматаар бодит board болж өргөтгөнө." },
    { title: "Production direction", text: "Empty state нь шууд ойлгомжтой, fake top-10 харуулахгүй." },
  ];

  return (
    <main className="page-wrap">
      <PageHeading icon="trophy" eyebrow="COMPETITIVE LADDER" title="LEADERBOARD" description="Real ranking feed холбогдохоор ашиглах ready layout" />

      <section className="mono-section-block">
        <div className="mono-section-head">
          <div>
            <span>Ranking status</span>
            <h2>Awaiting live competitive data</h2>
          </div>
          <Link href="/admin">Admin</Link>
        </div>

        <div className="mono-card-grid three">
          {blocks.map((item) => (
            <article key={item.title} className="mono-info-card">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mono-empty-panel large">
          <i><Icon name="trophy" size={28} /></i>
          <strong>Live leaderboard data not connected</strong>
          <p>
            Match result / rating data source холбоогүй байгаа тул энд fake leaderboard үзүүлэхгүй.
            Integration хийсний дараа player table, filters, rank progression, season ladder-ийг бодитоор ажиллуулахад бэлэн.
          </p>
          <div className="mono-inline-links">
            <Link className="page-button" href="/profile">Open profile</Link>
            <Link className="ghost-button" href="/skinchanger">Open skinchanger</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
