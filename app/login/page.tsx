import Link from "next/link";
import { Icon } from "@/components/icon";

export default function LoginPage() {
  return (
    <main className="page-wrap mono-login-page">
      <section className="mono-login-shell">
        <article className="mono-login-copy">
          <span>WINGS ACCOUNT</span>
          <h1>Sign in with Steam</h1>
          <p>
            Steam OpenID-ээр нэвтрээд profile, loadout save, staff verification зэрэг site-ийн холбоотой хэсгүүдийг ашиглана.
            Нууц үг WINGS дээр хадгалагдахгүй.
          </p>
          <div className="mono-card-grid three compact">
            <article className="mono-info-card"><strong>OpenID</strong><p>Direct Steam authentication</p></article>
            <article className="mono-info-card"><strong>Profile</strong><p>Avatar, SteamID64, account link</p></article>
            <article className="mono-info-card"><strong>Loadout</strong><p>Saved skinchanger selections</p></article>
          </div>
        </article>

        <article className="mono-login-card">
          <span>Secure gateway</span>
          <strong>Steam authentication</strong>
          <p>Continue хийснээр Steam рүү redirect хийгдэнэ.</p>
          <a className="page-button mono-wide-button" href="/api/auth/steam"><Icon name="steam" size={18} /> Continue with Steam</a>
          <Link className="ghost-button mono-wide-button" href="/skinchanger">Back to skinchanger</Link>
        </article>
      </section>
    </main>
  );
}
