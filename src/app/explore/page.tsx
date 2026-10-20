"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import {
  allProfiles,
  getProfile,
  issueAttestation,
  scoreFor,
  type Attestation,
  type Profile,
} from "@/lib/attest";

const CLAIMS = ["paid on time", "delivered as described", "good communication", "honest negotiator", "reliable"];

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} style={{ color: "var(--primary)", letterSpacing: 2 }}>
      {"★".repeat(rating)}
      <span style={{ color: "var(--border)" }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(() => allProfiles());

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, "");
    if (!q) return profiles;
    return profiles.filter(
      (p) => p.nametag.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    );
  }, [query, profiles]);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueSubject, setIssueSubject] = useState("");
  const [issueClaim, setIssueClaim] = useState(CLAIMS[0]);
  const [issueRating, setIssueRating] = useState(5);
  const [issueNote, setIssueNote] = useState("");
  const [issueDone, setIssueDone] = useState(false);

  function openProfile(p: Profile) {
    setSelected(p);
    setIssueOpen(false);
    setIssueDone(false);
  }

  function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    const att = issueAttestation({
      issuer: "you",
      subject: issueSubject || selected?.nametag || "",
      claim: issueClaim,
      rating: issueRating,
      note: issueNote,
    });
    setProfiles(allProfiles());
    setIssueDone(true);
    // Show the freshly issued attestation.
    const updated = getProfile(att.subject);
    if (updated) setSelected(updated);
    setIssueSubject("");
    setIssueNote("");
  }

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px 96px" }}>
        {/* Search */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.6rem", margin: "0 0 16px" }}>Explore reputation</h1>
          <div style={{ position: "relative" }}>
            <input
              className="field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a nametag or address… e.g. @alice"
              aria-label="Search nametag or address"
              style={{ padding: "14px 18px", fontSize: "1rem" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
          {/* Results list */}
          <div>
            {results.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted-fg)" }}>
                No profiles match. Try another nametag.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {results.map((p) => {
                  const { avg, count } = scoreFor(p);
                  return (
                    <button
                      key={p.nametag}
                      onClick={() => openProfile(p)}
                      className="card"
                      style={{
                        padding: 18,
                        textAlign: "left",
                        cursor: "pointer",
                        width: "100%",
                        background: selected?.nametag === p.nametag ? "rgba(16,185,129,0.08)" : "var(--card)",
                        borderColor: selected?.nametag === p.nametag ? "var(--accent)" : "var(--border)",
                        fontFamily: "inherit",
                        color: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>@{p.nametag}</span>
                        <span className="chip">{count} attestation{count === 1 ? "" : "s"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Stars rating={Math.round(avg)} />
                        <span style={{ color: "var(--muted-fg)", fontSize: "0.9rem" }}>
                          {avg > 0 ? avg.toFixed(1) : "no score yet"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "0.72rem",
                          color: "var(--muted-fg)",
                          marginTop: 8,
                        }}
                      >
                        {p.address.slice(0, 10)}…{p.address.slice(-6)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile detail */}
          <div>
            {selected ? (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem" }}>@{selected.nametag}</h2>
                    {(() => {
                      const { avg, count } = scoreFor(selected);
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Stars rating={Math.round(avg)} />
                          <span style={{ color: "var(--muted-fg)", fontSize: "0.9rem" }}>
                            {avg > 0 ? `${avg.toFixed(1)} / 5` : "no score yet"} · {count} attestation{count === 1 ? "" : "s"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <span className="chip" style={{ color: "var(--pos)", borderColor: "rgba(52,211,153,0.4)" }}>
                    ✓ verified
                  </span>
                </div>

                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.78rem", color: "var(--muted-fg)", marginBottom: 20, overflowWrap: "anywhere" }}>
                  {selected.address}
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  <button className="btn btn-green btn-sm" onClick={() => { setIssueOpen((v) => !v); setIssueDone(false); }}>
                    {issueOpen ? "Cancel" : "+ Issue attestation"}
                  </button>
                </div>

                {issueOpen ? (
                  <form onSubmit={handleIssue} style={{ marginBottom: 24, padding: 16, border: "1px solid var(--border)", borderRadius: 14, background: "var(--muted)" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 12 }}>
                      Issue a signed attestation for @{selected.nametag}
                    </div>
                    <select className="field" value={issueClaim} onChange={(e) => setIssueClaim(e.target.value)} style={{ marginBottom: 10 }} aria-label="Claim">
                      {CLAIMS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: "0.9rem" }}>Rating:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setIssueRating(n)}
                          aria-label={`${n} stars`}
                          style={{
                            background: n <= issueRating ? "var(--primary)" : "transparent",
                            border: "1px solid var(--border)",
                            color: n <= issueRating ? "var(--on-primary)" : "var(--muted-fg)",
                            borderRadius: 8,
                            width: 34,
                            height: 34,
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="field"
                      value={issueNote}
                      onChange={(e) => setIssueNote(e.target.value)}
                      placeholder="Note (optional)"
                      rows={2}
                      style={{ marginBottom: 12 }}
                      aria-label="Note"
                    />
                    <button type="submit" className="btn btn-green btn-sm" style={{ width: "100%" }}>
                      Sign & issue
                    </button>
                    {issueDone ? (
                      <p style={{ color: "var(--pos)", fontSize: "0.85rem", margin: "10px 0 0", textAlign: "center" }}>
                        ✓ Attestation signed and recorded.
                      </p>
                    ) : null}
                  </form>
                ) : null}

                {/* Attestation history */}
                <div style={{ fontSize: "0.78rem", color: "var(--muted-fg)", marginBottom: 10 }}>
                  ATTESTATION HISTORY
                </div>
                {selected.attestations.length === 0 ? (
                  <p style={{ color: "var(--muted-fg)", fontSize: "0.9rem" }}>
                    No attestations yet — be the first to vouch.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {selected.attestations.map((a: Attestation) => (
                      <div key={a.id} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--muted)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>@{a.issuer}</span>
                          <Stars rating={a.rating} />
                        </div>
                        <div style={{ fontSize: "0.95rem", marginBottom: 4 }}>
                          <span className="green-grad" style={{ fontWeight: 700 }}>{a.claim}</span>
                        </div>
                        {a.note ? (
                          <div style={{ color: "var(--muted-fg)", fontSize: "0.88rem", marginBottom: 6 }}>{a.note}</div>
                        ) : null}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "0.74rem", color: "var(--muted-fg)" }}>
                            {new Date(a.at).toLocaleDateString()}
                          </span>
                          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.68rem", color: "var(--muted-fg)", overflowWrap: "anywhere" }}>
                            {a.signature.slice(0, 14)}…{a.signature.slice(-6)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted-fg)" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }} aria-hidden="true">◎</div>
                Select a profile to see its full attestation history.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
