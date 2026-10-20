"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { allProfiles, type Attestation } from "@/lib/attest";

/** Recent attestations across all profiles, newest first. */
export function RecentAttestations() {
  const [items, setItems] = useState<Array<Attestation & { subject: string }>>([]);

  useEffect(() => {
    const all: Array<Attestation & { subject: string }> = [];
    for (const p of allProfiles()) {
      for (const a of p.attestations) {
        all.push({ ...a, subject: p.nametag });
      }
    }
    all.sort((a, b) => (a.at < b.at ? 1 : -1));
    setItems(all.slice(0, 5));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Recent attestations
            </h2>
            <p className="mt-3 text-muted-foreground">
              The latest signed vouches on the network.
            </p>
          </div>
          <Link
            href="/explore"
            className="hidden items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground sm:inline-flex"
          >
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="doc-card divide-y divide-border">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">@{a.issuer}</span>
                  <span className="text-muted-foreground"> attested </span>
                  <span className="font-medium text-primary">{a.claim}</span>
                  <span className="text-muted-foreground"> for </span>
                  <span className="font-semibold">@{a.subject}</span>
                </p>
                {a.note ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.note}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm text-primary">{"★".repeat(a.rating)}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
