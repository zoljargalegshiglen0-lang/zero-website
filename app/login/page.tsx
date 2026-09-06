import Link from "next/link";

export default function LoginPage() {
  return <main className="cosmic-login-page">
    <div className="cosmic-login-nebula cosmic-login-nebula-a" />
    <div className="cosmic-login-nebula cosmic-login-nebula-b" />
    <div className="cosmic-login-stars" />
    <div className="cosmic-login-planet"><i /><b /></div>
    <div className="cosmic-login-orbit orbit-one" />
    <div className="cosmic-login-orbit orbit-two" />

    <section className="cosmic-login-shell">
      <div className="cosmic-login-brand">
        <span className="cosmic-login-mark">Ø</span>
        <div><strong>WINGS</strong><small>COMMUNITY IDENTITY</small></div>
      </div>

      <div className="cosmic-login-copy">
        <span className="cosmic-login-kicker"><i /> SECURE STEAM OPENID</span>
        <h1>ENTER THE<br/><em>WINGS ARENA</em></h1>
        <p>Steam account-аараа нэвтэрч WINGS profile-оо үүсгэнэ. SteamID64 баталгаажиж, public profile мэдээлэл боломжтой үед нэр болон avatar автоматаар холбогдоно.</p>
        <div className="cosmic-login-features"><span><i /> VERIFIED STEAM ID</span><span><i /> LOADOUT PROFILE</span><span><i /> STAFF IDENTITY</span></div>
      </div>

      <div className="cosmic-login-action-card">
        <div className="cosmic-login-card-head"><span>ACCOUNT GATEWAY</span><b>01</b></div>
        <div className="cosmic-steam-orb"><span>STEAM</span><i /></div>
        <h2>Sign in with Steam</h2>
        <p>Нууц үг WINGS дээр хадгалагдахгүй. Authentication нь Steam OpenID-р хийгдэнэ.</p>
        <a className="cosmic-steam-button" href="/api/auth/steam"><span className="cosmic-steam-icon">S</span><strong>CONTINUE WITH STEAM</strong><b>↗</b></a>
        <div className="cosmic-login-security"><i /> STEAM OPENID · SECURE REDIRECT</div>
        <Link className="cosmic-login-back" href="/skinchanger">← BACK TO LOADOUT</Link>
      </div>
    </section>

    <footer className="cosmic-login-footer"><span>WINGS NETWORK · ULAANBAATAR</span><i /><span>IDENTITY NODE ONLINE</span></footer>
  </main>;
}
