/**
 * Frani Attest — attestation store.
 *
 * Testnet-preview mode: attestations live in a local store, shaped like the
 * signed-message model of the Unicity SDK (issuer, subject, claim, signature).
 * A real integration signs each attestation with the issuer's wallet key and
 * publishes it over the network; the UI reads the same shape.
 */

export interface Attestation {
  id: string;
  issuer: string; // nametag or address
  subject: string; // nametag or address
  claim: string; // e.g. "paid on time", "delivered as described"
  rating: 1 | 2 | 3 | 4 | 5;
  note: string;
  at: string;
  signature: string; // hex, demo
}

export interface Profile {
  nametag: string;
  address: string;
  joined: string;
  attestations: Attestation[];
}

const PROFILES_KEY = "frani-attest:profiles";
const WALLET_KEY = "frani-attest:wallet";

export interface Wallet {
  address: string;
  nametag: string;
  connectedAt: string;
}

export function connectWallet(): Wallet {
  try {
    const raw = window.localStorage.getItem(WALLET_KEY);
    if (raw) return JSON.parse(raw) as Wallet;
  } catch {
    /* fall through */
  }
  const wallet: Wallet = {
    address: `0x${Array.from({ length: 40 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("")}`,
    nametag: `guest_${Math.floor(Math.random() * 900 + 100)}`,
    connectedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  } catch {
    /* storage unavailable */
  }
  return wallet;
}

export function currentWallet(): Wallet | null {
  try {
    const raw = window.localStorage.getItem(WALLET_KEY);
    return raw ? (JSON.parse(raw) as Wallet) : null;
  } catch {
    return null;
  }
}

export function disconnectWallet() {
  try {
    window.localStorage.removeItem(WALLET_KEY);
  } catch {
    /* ignore */
  }
}

const SEED: Profile[] = [
  {
    nametag: "alice",
    address: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
    joined: "2026-08-14T09:00:00Z",
    attestations: [
      {
        id: "a1",
        issuer: "bob",
        subject: "alice",
        claim: "paid on time",
        rating: 5,
        note: "Settled a 200 UCT invoice within the hour.",
        at: "2026-09-02T12:10:00Z",
        signature: "0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80",
      },
      {
        id: "a2",
        issuer: "carol",
        subject: "alice",
        claim: "delivered as described",
        rating: 5,
        note: "Freelance design work landed exactly to spec.",
        at: "2026-09-18T15:40:00Z",
        signature: "0x2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091",
      },
      {
        id: "a3",
        issuer: "dave",
        subject: "alice",
        claim: "good communication",
        rating: 4,
        note: "Clear updates throughout the engagement.",
        at: "2026-10-01T10:05:00Z",
        signature: "0x3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2",
      },
    ],
  },
  {
    nametag: "bob",
    address: "0x8e6f566310a69226d5dfcb7b8c2659029395bdf",
    joined: "2026-07-22T14:00:00Z",
    attestations: [
      {
        id: "a4",
        issuer: "alice",
        subject: "bob",
        claim: "paid on time",
        rating: 5,
        note: "Paid the split invoice immediately.",
        at: "2026-09-02T12:30:00Z",
        signature: "0x4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3",
      },
      {
        id: "a5",
        issuer: "erin",
        subject: "bob",
        claim: "honest negotiator",
        rating: 4,
        note: "Fair terms on a swap deal.",
        at: "2026-10-05T09:15:00Z",
        signature: "0x5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4",
      },
    ],
  },
  {
    nametag: "carol",
    address: "0x9f708671410b73327e5dfcb7b8c2659029395bdf",
    joined: "2026-08-30T08:30:00Z",
    attestations: [
      {
        id: "a6",
        issuer: "alice",
        subject: "carol",
        claim: "delivered as described",
        rating: 5,
        note: "Great work, would hire again.",
        at: "2026-09-18T16:00:00Z",
        signature: "0x6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5",
      },
    ],
  },
  {
    nametag: "dave",
    address: "0x0a817782521c84336f5dfcb7b8c2659029395bdf",
    joined: "2026-09-10T11:45:00Z",
    attestations: [
      {
        id: "a7",
        issuer: "alice",
        subject: "dave",
        claim: "good communication",
        rating: 4,
        note: "Responsive and clear.",
        at: "2026-10-01T10:10:00Z",
        signature: "0x7f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6",
      },
    ],
  },
];

function readProfiles(): Profile[] {
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw) as Profile[];
  } catch {
    /* fall through to seed */
  }
  return SEED.map((p) => ({ ...p, attestations: [...p.attestations] }));
}

function writeProfiles(profiles: Profile[]) {
  try {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    /* storage unavailable */
  }
}

export function searchProfiles(query: string): Profile[] {
  const q = query.trim().toLowerCase().replace(/^@/, "");
  if (!q) return [];
  return readProfiles().filter(
    (p) => p.nametag.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
  );
}

export function getProfile(nametag: string): Profile | null {
  const q = nametag.trim().toLowerCase().replace(/^@/, "");
  return readProfiles().find((p) => p.nametag.toLowerCase() === q) ?? null;
}

export function allProfiles(): Profile[] {
  return readProfiles();
}

/** Find an attestation by its signature (or by id). */
export function findBySignature(sig: string): (Attestation & { subject: string }) | null {
  const q = sig.trim().toLowerCase();
  if (!q) return null;
  for (const p of readProfiles()) {
    for (const a of p.attestations) {
      if (a.signature.toLowerCase() === q || a.id.toLowerCase() === q) {
        return { ...a, subject: p.nametag };
      }
    }
  }
  return null;
}

/** True if the string looks like a signed attestation (hex, 128 chars). */
export function looksLikeSignature(sig: string): boolean {
  return /^0x[0-9a-fA-F]{128}$/.test(sig.trim());
}

export function scoreFor(profile: Profile): { avg: number; count: number } {
  if (profile.attestations.length === 0) return { avg: 0, count: 0 };
  const sum = profile.attestations.reduce((acc, a) => acc + a.rating, 0);
  return { avg: sum / profile.attestations.length, count: profile.attestations.length };
}

/** Issue an attestation (demo: stored locally with a fake signature). */
export function issueAttestation(input: {
  issuer: string;
  subject: string;
  claim: string;
  rating: number;
  note: string;
}): Attestation {
  const profiles = readProfiles();
  const subject = profiles.find((p) => p.nametag.toLowerCase() === input.subject.toLowerCase());
  const attestation: Attestation = {
    id: `att_${Date.now().toString(36)}`,
    issuer: input.issuer,
    subject: subject ? subject.nametag : input.subject,
    claim: input.claim,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))) as 1 | 2 | 3 | 4 | 5,
    note: input.note,
    at: new Date().toISOString(),
    signature: `0x${Array.from({ length: 128 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("")}`,
  };
  if (subject) {
    subject.attestations.unshift(attestation);
    writeProfiles(profiles);
  }
  return attestation;
}
