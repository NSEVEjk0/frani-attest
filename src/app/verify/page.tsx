"use client";

import { useState } from "react";
import { BadgeCheck, FileQuestion, Search, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { findBySignature, looksLikeSignature, type Attestation } from "@/lib/attest";

interface Result {
  found: boolean;
  att?: Attestation & { subject: string };
  reason?: string;
}

export default function VerifyPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [checked, setChecked] = useState(false);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) {
      setResult({ found: false, reason: "Enter a signature or attestation id." });
      setChecked(true);
      return;
    }
    if (!looksLikeSignature(q) && !q.startsWith("att_")) {
      setResult({
        found: false,
        reason: "That doesn't look like a signed attestation. Paste the full 0x… signature or an attestation id.",
      });
      setChecked(true);
      return;
    }
    const att = findBySignature(q);
    if (att) {
      setResult({ found: true, att });
    } else {
      setResult({
        found: false,
        reason: "No matching attestation found in the registry. It may have been issued elsewhere.",
      });
    }
    setChecked(true);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-2">
          <BackButton label="Back to home" />
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Verify an attestation</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Paste a signed attestation to confirm it exists in the registry.
          </p>
        </div>

        <form onSubmit={handleVerify} className="doc-card p-6 sm:p-8">
          <Label htmlFor="sig" className="mb-2 block">Signature or attestation id</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="sig"
              placeholder="0x… (128 hex chars) or att_…"
              value={input}
              onChange={(e) => { setInput(e.target.value); setChecked(false); }}
              className="font-mono text-xs sm:flex-1"
            />
            <Button type="submit" className="gap-2 sm:shrink-0">
              <Search className="h-4 w-4" /> Verify
            </Button>
          </div>
        </form>

        {checked ? (
          <div className="mt-6 animate-fade-in">
            {result?.found && result.att ? (
              <div className="doc-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BadgeCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold">Verified</h2>
                    <p className="text-sm text-muted-foreground">
                      This attestation is authentic and on record.
                    </p>
                  </div>
                  <Badge variant="success" className="ml-auto">✓ valid</Badge>
                </div>
                <Separator className="my-5" />
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Issuer</dt>
                    <dd className="mt-0.5 font-medium">@{result.att.issuer}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Subject</dt>
                    <dd className="mt-0.5 font-medium">@{result.att.subject}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Claim</dt>
                    <dd className="mt-0.5 font-medium text-primary">{result.att.claim}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rating</dt>
                    <dd className="mt-0.5 text-primary">{"★".repeat(result.att.rating)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Note</dt>
                    <dd className="mt-0.5 text-muted-foreground">{result.att.note || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Signature</dt>
                    <dd className="mt-0.5 font-mono text-[11px] break-all text-muted-foreground">
                      {result.att.signature}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="doc-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                    <FileQuestion className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold">Not found</h2>
                    <p className="text-sm text-muted-foreground">{result?.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-8 flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Attestations are signed statements from real wallets. Verification checks the
            registry record — in the full implementation, each signature is cryptographically
            checked against the issuer&apos;s public key.
          </p>
        </div>
      </main>
    </>
  );
}
