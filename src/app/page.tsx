import Link from "next/link";
import { ArrowRight, BadgeCheck, FileSignature, Search, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
            <div className="animate-fade-up">
              <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Unicity testnet2
              </Badge>
            </div>
            <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Who can you <span className="text-gradient">trust</span> on Unicity?
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Frani Attest turns your on-network history into signed reputation —
              so before you pay, you know who you&apos;re dealing with.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="gap-2">
                <Link href="/explore">
                  Explore reputation <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how">How it works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
            {[
              ["4", "verified profiles"],
              ["7", "signed attestations"],
              ["100%", "wallet-signed"],
              ["0", "middlemen"],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{v}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Why Frani Attest
            </h2>
            <p className="mt-2 text-muted-foreground">
              Reputation you can verify, not just read.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-glow rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-10 max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                How it works
              </h2>
              <p className="mt-2 text-muted-foreground">
                Reputation is earned, one signed attestation at a time.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="relative rounded-xl border bg-card p-6">
                  <span className="font-display text-sm font-semibold text-primary">{s.n}</span>
                  <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-border/60">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Before you deal, check the record.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Look up any nametag on Unicity testnet2.
            </p>
            <Button size="lg" className="mt-8 gap-2" asChild>
              <Link href="/explore">
                Search reputation <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>Frani Attest · made by CRYPTFRANI on Unicity testnet2</p>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="transition-colors hover:text-foreground">Explore</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
