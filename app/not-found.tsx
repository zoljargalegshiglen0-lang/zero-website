import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <main className="page-wrap">
      <div className="mono-empty-panel large">
        <i><Icon name="search" size={28} /></i>
        <strong>Page not found</strong>
        <p>Тухайн page олдсонгүй. Navigation ашиглаад буцаад орно уу.</p>
        <div className="mono-inline-links">
          <Link className="page-button" href="/">Home</Link>
          <Link className="ghost-button" href="/servers">Servers</Link>
        </div>
      </div>
    </main>
  );
}
