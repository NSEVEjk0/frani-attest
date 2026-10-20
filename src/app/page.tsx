import Link from "next/link";
import { Header } from "@/components/Header";

const FEATURES = [
  {
    title: "Signed, not claimed",
    body: "Every attestation is a signed statement from a real wallet — verifiable, attributable, and tamper-evident.",
  },
  {
    title: "A score you can read",
    body: "One glance tells you how many people vouch for a nametag and how strongly, with the full history behind it.",
  },
  {
    title: "Built for the Digital Republic",
    body: "Reputation for the intent market, the swap board, and every agent deal — the missing trust rail on Unicity.",
  },
];

const STEPS = [
  { n: "01", title: "Deal", body: "Complete a trade, a job, or any exchange on Unicity." },
  { n: "02", title: "Attest", body: "Each side issues a signed attestation about the other." },
  { n: "03", title: "Verify", body: "Anyone can look up a nametag and read its history." },
  { n: "04", title: "Trust", body: "Reputation compounds — good actors stand out, bad ones can't hide." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "96px 24px 72px", textAlign: "center" }}>
          <span className="chip" style={{ marginBottom: 24 }}>
            <span aria-hidden="true" style={{ color: "var(--accent)" }}>✓</span>
            Unicity testnet2
          </span>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.12, margin: "0 0 20px" }}>
            Who can you <span className="green-grad">trust</span> on Unicity?
          </h1>
          <p
            style={{
              maxWidth: 640,
              margin: "0 auto 36px",
              color: "var(--muted-fg)",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            }}
          >
            Frani Attest turns your on-network history into signed reputation —
            so before you pay, you know who you&apos;re dealing with.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/explore" className="btn btn-green btn-lg">
              Explore reputation
            </Link>
            <Link href="#how" className="btn btn-ghost btn-lg">
              How it works
            </Link>
          </div>
        </section>

        {/* Proof strip */}
        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(39, 47, 66, 0.35)" }}>
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
              padding: "28px 24px",
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            {[
              ["4", "verified profiles"],
              ["7", "signed attestations"],
              ["100%", "wallet-signed"],
              ["0", "middlemen"],
            ].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 700 }} className="green-grad">
                  {v}
                </div>
                <div style={{ color: "var(--muted-fg)", fontSize: "0.85rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 24px" }}>
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 32px" }}>Why Frani Attest</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: 26 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    marginBottom: 14,
                    color: "var(--accent)",
                  }}
                  aria-hidden="true"
                >
                  ✓
                </div>
                <h3 style={{ fontSize: "1.05rem", margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ margin: 0, color: "var(--muted-fg)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 96px" }}>
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 8px" }}>How it works</h2>
          <p style={{ color: "var(--muted-fg)", margin: "0 0 36px" }}>
            Reputation is earned, one signed attestation at a time.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {STEPS.map((s) => (
              <div key={s.n} className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700, marginBottom: 12 }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: "1rem", margin: "0 0 6px" }}>{s.title}</h3>
                <p style={{ margin: 0, color: "var(--muted-fg)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: "1px solid var(--border)", background: "rgba(16, 185, 129, 0.05)" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.6rem", margin: "0 0 12px" }}>
              Before you deal, check the record.
            </h2>
            <p style={{ color: "var(--muted-fg)", margin: "0 0 28px" }}>
              Look up any nametag on Unicity testnet2.
            </p>
            <Link href="/explore" className="btn btn-green btn-lg">
              Search reputation
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--muted-fg)", fontSize: "0.85rem" }}>
          Frani Attest · made by CRYPTFRANI on Unicity testnet2
        </p>
      </footer>
    </>
  );
}
