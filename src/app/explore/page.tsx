"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, FileSignature, Search, Star } from "lucide-react";
import { Header } from "@/components/header";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import {
  fetchProfiles,
  fetchAttestations,
  issueAttestation,
  scoreFor,
  signAttestationMessage,
  currentWallet,
  type Attestation,
  type Profile,
} from "@/lib/attest";

const CLAIMS = ["paid on time", "delivered as described", "good communication", "honest negotiator", "reliable"];

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      aria-label={`${rating} out of 5`}
      className={className ?? "inline-flex items-center gap-0.5 text-primary"}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < rating ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5 text-muted-foreground/30"}
        />
      ))}
    </span>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueClaim, setIssueClaim] = useState(CLAIMS[0]);
  const [issueRating, setIssueRating] = useState(5);
  const [issueNote, setIssueNote] = useState("");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profiles = await fetchProfiles();
        if (!cancelled) setProfiles(profiles);
      } catch {
        if (!cancelled) setProfiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, "");
    if (!q) return profiles;
    return profiles.filter(
      (p) => p.nametag.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    );
  }, [query, profiles]);

  async function openProfile(p: Profile) {
    setSelected({ ...p, attestations: p.attestations ?? [] });
    setIssueOpen(false);
    // Load the profile's attestations from the shared registry.
    try {
      const atts = await fetchAttestations({ subject: p.nametag });
      setSelected((prev) => (prev?.nametag === p.nametag ? { ...prev, attestations: atts } : prev));
    } catch {
      /* keep empty attestations */
    }
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const wallet = currentWallet();
    if (!wallet) {
      toast.error("Connect a wallet to issue attestations");
      return;
    }
    setIssuing(true);
    try {
      const signature = signAttestationMessage(wallet, {
        issuer: wallet.address,
        subject: selected.nametag,
        claim: issueClaim,
        rating: issueRating,
      });
      const att = await issueAttestation({
        issuer: wallet.address,
        subject: selected.nametag,
        claim: issueClaim,
        rating: issueRating,
        note: issueNote,
        signature,
      });
      // Refresh the selected profile's attestations from the registry.
      const all = await fetchProfiles();
      const updated = all.find((p) => p.nametag === att.subject);
      if (updated) {
        const atts = await fetchAttestations({ subject: updated.nametag });
        setSelected({ ...updated, attestations: atts });
        setProfiles(all);
      }
      setIssueOpen(false);
      setIssueNote("");
      toast.success("Attestation signed and recorded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not issue attestation");
    } finally {
      setIssuing(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-2">
          <BackButton label="Back to home" />
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Explore reputation</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Search a nametag or address to see its signed attestation history.
          </p>
        </div>

        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search @nametag or 0x address…"
            className="h-12 pl-10 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* Results list */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="mt-3 h-3 w-40" />
                </div>
              ))
            ) : results.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="No profiles match"
                body="Try another nametag or address."
              />
            ) : (
              results.map((p) => {
                const { avg, count } = scoreFor(p);
                return (
                  <button
                    key={p.nametag}
                    onClick={() => openProfile(p)}
                    className={
                      "w-full rounded-xl border bg-card p-5 text-left transition-all duration-200 " +
                      (selected?.nametag === p.nametag
                        ? "border-primary/50 ring-1 ring-primary/30"
                        : "hover:border-primary/30")
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-base font-semibold">@{p.nametag}</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {count} attestation{count === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2.5">
                      <Stars rating={Math.round(avg)} />
                      <span className="text-xs text-muted-foreground">
                        {avg > 0 ? avg.toFixed(1) + " / 5" : "no score yet"}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                      {p.address.slice(0, 10)}…{p.address.slice(-6)}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Profile detail */}
          <div>
            {selected ? (
              <div className="card-glow rounded-xl border bg-card p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-semibold">@{selected.nametag}</h2>
                      <Badge variant="success" className="gap-1">
                        <BadgeCheck className="h-3 w-3" /> verified
                      </Badge>
                    </div>
                    {(() => {
                      const { avg, count } = scoreFor(selected);
                      return (
                        <div className="mt-2 flex items-center gap-2.5">
                          <Stars rating={Math.round(avg)} />
                          <span className="text-sm text-muted-foreground">
                            {avg > 0 ? `${avg.toFixed(1)} / 5` : "no score yet"} · {count} attestation{count === 1 ? "" : "s"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setIssueOpen(true)}>
                    <FileSignature className="h-3.5 w-3.5" /> Issue attestation
                  </Button>
                </div>

                <p className="mt-4 font-mono text-xs text-muted-foreground break-all">{selected.address}</p>

                <Separator className="my-6" />

                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Attestation history
                </h3>

                {(selected.attestations ?? []).length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No attestations yet — be the first to vouch.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {(selected.attestations ?? []).map((a: Attestation) => (
                      <div key={a.id} className="rounded-lg border bg-background/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">@{a.issuer}</span>
                          <Stars rating={a.rating} />
                        </div>
                        <p className="mt-2 text-sm font-medium text-primary">{a.claim}</p>
                        {a.note ? (
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.note}</p>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(a.at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {a.signature.slice(0, 14)}…{a.signature.slice(-6)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<BadgeCheck className="h-8 w-8" />}
                title="Select a profile"
                body="Choose a nametag from the list to see its full attestation history."
              />
            )}
          </div>
        </div>
      </main>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue a signed attestation</DialogTitle>
            <DialogDescription>
              For @{selected?.nametag} — signed by your wallet.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claim">Claim</Label>
              <div className="flex flex-wrap gap-2">
                {CLAIMS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setIssueClaim(c)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                      (issueClaim === c
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30")
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setIssueRating(n)}
                    aria-label={`${n} stars`}
                    className="rounded-md p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={
                        n <= issueRating
                          ? "h-6 w-6 fill-primary text-primary"
                          : "h-6 w-6 text-muted-foreground/30"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="What happened?"
                rows={3}
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setIssueOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={issuing}>
                {issuing ? "Signing…" : "Sign & issue"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
