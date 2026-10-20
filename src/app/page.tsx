import Link from "next/link";
import { ArrowRight, BadgeCheck, FileSignature, Search, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttestMark } from "@/components/logo";

const FEATURES = [
  {
    icon: FileSignature,
    title: "Signed, not claimed",
    body: "Every attestation is a signed statement from a real wallet — verifiable, attributable, and tamper-evident.",
  },
  {
    icon: ShieldCheck,
    title: "A score you can read",
    body: "One glance tells you how many people vouch for a nametag and how strongly, with the full history behind it.",
  },
  {
    icon: Search,
    title: "Built for the Digital Republic",
    body: "Reputation for the intent market, the swap board, and every agent deal — the missing trust rail on Unicity.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <div className="animate-fade-up mb-8 flex items-center gap-3">
                  <span className="hairline w-10" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Unicity testnet2
                  </span>
                </div>
                <h1 className="animate-fade-up text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                  Who can you <span className="text-gradient">trust</span>
                  <br />
                  on Unicity?
                </h1>
                <p className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Frani Attest turns your on-network history into signed reputation —
                  so before you pay, you know who you&apos;re dealing with.
                </p>
                <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4">
                  <Button size="lg" asChild className="gap-2 rounded-full">
                    <Link href="/explore">
                      Explore reputation <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full">
                    <Link href="#how">How it works</Link>
                  </Button>
                </div>
              </div>

              {/* Right: trust panel */}
              <div className="relative hidden lg:block">
                <div className="absolute -right-6 -top-8">
                  <AttestMark size={110} />
                </div>
                <div className="card-glow ml-auto w-80 overflow-hidden rounded-xl border bg-card">
                  <div className="border-b border-border px-6 py-5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-semibold">@alice</span>
                      <Badge variant="success" className="gap-1">
                        <BadgeCheck className="h-3 w-3" /> verified
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-primary">
                      {"★★★★★".split("").map((s, i) => (
                        <span key={i} className="text-sm">{s}</span>
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">5.0 · 3 attestations</span>
                    </div>
                  </div>
                  <div className="space-y-3 px-6 py-5">
                    {[
                      ["@bob", "paid on time", "5"],
                      ["@carol", "delivered as described", "5"],
                      ["@dave", "good communication", "4"],
                    ].map(([who, claim, stars]) => (
                      <div key={who} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{who}</span>
                        <span className="text-muted-foreground">{claim}</span>
                        <span className="text-primary">{stars}★</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Strip ── */}
        <section className="border-y border-border/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
            {[
              ["4", "verified profiles"],
              ["7", "signed attestations"],
              ["100%", "wallet-signed"],
              ["0", "middlemen"],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-3xl font-semibold sm:text-4xl">{v}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-14 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Why Frani Attest
            </h2>
            <p className="text-muted-foreground lg:pb-2">
              Reputation you can verify, not just read.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-card p-8 transition-colors hover:bg-card/70">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="mb-14">
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">How it works</h2>
              <p className="mt-3 text-muted-foreground">
                Reputation is earned, one signed attestation at a time.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "01", title: "Deal", body: "Complete a trade, a job, or any exchange on Unicity." },
                { n: "02", title: "Attest", body: "Each side issues a signed attestation about the other." },
                { n: "03", title: "Verify", body: "Anyone can look up a nametag and read its history." },
                { n: "04", title: "Trust", body: "Reputation compounds — good actors stand out, bad ones can't hide." },
              ].map((s) => (
                <div key={s.n} className="bg-card p-8">
                  <span className="font-display text-2xl font-semibold text-primary">{s.n}</span>
                  <h3 className="mt-6 font-medium text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden border-t border-border/60">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[360px] w-[360px] rounded-full bg-primary/5 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-28 text-center sm:px-6">
            <AttestMark size={48} className="mx-auto mb-8 text-primary" />
            <h2 className="font-display mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Before you deal, check the record.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Look up any nametag on Unicity testnet2.
            </p>
            <Button size="lg" className="mt-10 gap-2 rounded-full" asChild>
              <Link href="/explore">
                Search reputation <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>Frani Attest · made by CRYPTFRANI on Unicity testnet2</p>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="transition-colors hover:text-foreground">Explore</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
