import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <main className="page-wrap wings-not-found">
      <section>
        <span>WINGS NETWORK / 404</span>
        <h1>PAGE NOT FOUND</h1>
        <p>Энэ route байхгүй эсвэл шилжсэн байна. Homepage эсвэл server browser руу буцна уу.</p>
        <div>
          <Link href="/">HOME <Icon name="arrow" size={14} /></Link>
          <Link href="/servers">SERVERS</Link>
        </div>
      </section>
    </main>
  );
}
