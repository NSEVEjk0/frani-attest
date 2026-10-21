"use client";

/**
 * Frani Attest — shared registry + real wallet.
 *
 * Profiles and attestations live in the shared Turso registry (server-side).
 * Identity comes from a real Unicity wallet (local mnemonic derivation).
 * Attestations are signed with the issuer's wallet key.
 */

import {
  connectUnicityWallet,
  disconnectUnicityWallet,
  generateFreshMnemonic,
  getPrivateKey,
  isValidMnemonic,
  loadUnicityWallet,
  readStoredMnemonic,
  signWithWallet,
  type UnicityWallet,
} from "@/lib/unicity-wallet";

export interface Attestation {
  id: string;
  issuer: string;
  subject: string;
  claim: string;
  rating: 1 | 2 | 3 | 4 | 5;
  note: string;
  at: string;
  signature: string;
}

export interface Profile {
  nametag: string;
  address: string;
  joined: string;
  isAgent: boolean;
  attestations: Attestation[];
}

export interface Wallet {
  address: string;
  nametag: string;
  connectedAt: string;
  kind: "unicity" | "guest";
  /** Present only when this wallet was just created (show once). */
  generatedMnemonic?: string;
}

const WALLET_KEY = "frani-attest:wallet";

/* ------------------------------ wallet ------------------------------ */

function toSessionWallet(u: UnicityWallet): Wallet {
  return {
    address: u.address,
    nametag: u.nametag,
    connectedAt: new Date().toISOString(),
    kind: "unicity",
  };
}

export function connectWallet(input?: { mnemonic?: string }): Wallet {
  const u = connectUnicityWallet(input);
  const session = toSessionWallet(u);
  if (u.generatedMnemonic) {
    (session as Wallet & { generatedMnemonic?: string }).generatedMnemonic = u.generatedMnemonic;
  }
  try {
    window.localStorage.setItem(WALLET_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  return session;
}

export function currentWallet(): Wallet | null {
  try {
    const raw = window.localStorage.getItem(WALLET_KEY);
    return raw ? (JSON.parse(raw) as Wallet) : null;
  } catch {
    return null;
  }
}

export function restoreWallet(): Wallet | null {
  const u = loadUnicityWallet();
  if (!u) return null;
  const session = toSessionWallet(u);
  try {
    window.localStorage.setItem(WALLET_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  return session;
}

export function disconnectWallet() {
  try {
    window.localStorage.removeItem(WALLET_KEY);
  } catch {
    /* ignore */
  }
  disconnectUnicityWallet();
}

/** Copy the wallet's private key (for real Unicity wallets). */
export function copyPrivateKey(): string {
  return getPrivateKey();
}

/** Sign a canonical attestation message with the wallet key. */
export function signAttestationMessage(wallet: Wallet, payload: {
  issuer: string;
  subject: string;
  claim: string;
  rating: number;
}): string {
  const mnemonic = readStoredMnemonic();
  if (!mnemonic) throw new Error("Wallet key unavailable");
  const message = `attest:${payload.issuer}:${payload.subject}:${payload.claim}:${payload.rating}`;
  return signWithWallet(mnemonic, message);
}

/* ------------------------------ registry (shared) ------------------------------ */

export async function fetchProfiles(q?: string): Promise<Profile[]> {
  const url = q ? `/api/profiles?q=${encodeURIComponent(q)}` : "/api/profiles";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not load profiles");
  }
  const { profiles } = await res.json();
  return profiles as Profile[];
}

export async function fetchAttestations(params?: { subject?: string; issuer?: string }): Promise<Attestation[]> {
  const q = new URLSearchParams();
  if (params?.subject) q.set("subject", params.subject);
  if (params?.issuer) q.set("issuer", params.issuer);
  const res = await fetch(`/api/attestations?${q.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not load attestations");
  }
  const { attestations } = await res.json();
  return attestations as Attestation[];
}

export async function verifySignature(sig: string): Promise<Attestation | null> {
  const res = await fetch(`/api/attestations?signature=${encodeURIComponent(sig)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.attestation ?? null;
}

export async function registerProfile(p: { nametag: string; address: string; isAgent?: boolean }) {
  const res = await fetch("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not register profile");
  }
}

export async function issueAttestation(input: {
  issuer: string;
  subject: string;
  claim: string;
  rating: number;
  note: string;
  signature: string;
}): Promise<Attestation> {
  const res = await fetch("/api/attestations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Could not issue attestation");
  }
  const data = await res.json();
  return {
    id: data.id,
    issuer: input.issuer,
    subject: input.subject,
    claim: input.claim,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))) as 1 | 2 | 3 | 4 | 5,
    note: input.note,
    at: new Date().toISOString(),
    signature: input.signature,
  };
}

export function scoreFor(profile: Profile): { avg: number; count: number } {
  if (!profile.attestations || profile.attestations.length === 0) return { avg: 0, count: 0 };
  const sum = profile.attestations.reduce((acc, a) => acc + a.rating, 0);
  return { avg: sum / profile.attestations.length, count: profile.attestations.length };
}

export function looksLikeSignature(sig: string): boolean {
  return /^0x[0-9a-fA-F]{130}$/.test(sig.trim()) || /^att_/.test(sig.trim());
}

export { generateFreshMnemonic, isValidMnemonic };
