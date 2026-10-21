import { createClient } from "@libsql/client";

/**
 * Turso client for the shared attestation registry (server-side only).
 *
 * Profiles and attestations live in a shared edge SQLite database so every
 * visitor sees the same registry, regardless of browser or wallet.
 */

function client() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) {
    throw new Error("Turso is not configured (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN)");
  }
  return createClient({ url, authToken: token });
}

export async function ensureTables() {
  const db = client();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS attest_profiles (
      nametag TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      joined TEXT NOT NULL,
      is_agent INTEGER NOT NULL DEFAULT 0
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS attest_attestations (
      id TEXT PRIMARY KEY,
      issuer TEXT NOT NULL,
      subject TEXT NOT NULL,
      claim TEXT NOT NULL,
      rating INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      at TEXT NOT NULL,
      signature TEXT NOT NULL
    )
  `);
  await db.close();
}

export interface ProfileRow {
  nametag: string;
  address: string;
  joined: string;
  isAgent: boolean;
}

export interface AttestationRow {
  id: string;
  issuer: string;
  subject: string;
  claim: string;
  rating: number;
  note: string;
  at: string;
  signature: string;
}

function rowToProfile(r: Record<string, unknown>): ProfileRow {
  return {
    nametag: String(r.nametag),
    address: String(r.address),
    joined: String(r.joined),
    isAgent: Number(r.is_agent) === 1,
  };
}

function rowToAttestation(r: Record<string, unknown>): AttestationRow {
  return {
    id: String(r.id),
    issuer: String(r.issuer),
    subject: String(r.subject),
    claim: String(r.claim),
    rating: Number(r.rating),
    note: String(r.note ?? ""),
    at: String(r.at),
    signature: String(r.signature),
  };
}

export async function upsertProfile(p: { nametag: string; address: string; isAgent?: boolean }) {
  const db = client();
  await db.execute({
    sql: `INSERT INTO attest_profiles (nametag, address, joined, is_agent)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(nametag) DO UPDATE SET address = excluded.address, is_agent = excluded.is_agent`,
    args: [p.nametag, p.address, new Date().toISOString(), p.isAgent ? 1 : 0],
  });
  await db.close();
}

export async function listProfiles(): Promise<ProfileRow[]> {
  const db = client();
  const res = await db.execute("SELECT * FROM attest_profiles ORDER BY nametag");
  await db.close();
  return res.rows.map((r) => rowToProfile(r as unknown as Record<string, unknown>));
}

export async function getProfile(nametag: string): Promise<ProfileRow | null> {
  const db = client();
  const res = await db.execute({
    sql: "SELECT * FROM attest_profiles WHERE nametag = ?",
    args: [nametag],
  });
  await db.close();
  const row = res.rows[0] as unknown as Record<string, unknown> | undefined;
  return row ? rowToProfile(row) : null;
}

export async function addAttestation(a: {
  id: string;
  issuer: string;
  subject: string;
  claim: string;
  rating: number;
  note: string;
  signature: string;
}) {
  const db = client();
  await db.execute({
    sql: `INSERT INTO attest_attestations (id, issuer, subject, claim, rating, note, at, signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [a.id, a.issuer, a.subject, a.claim, a.rating, a.note, new Date().toISOString(), a.signature],
  });
  await db.close();
}

export async function listAttestations(params?: { subject?: string; issuer?: string }): Promise<AttestationRow[]> {
  const db = client();
  let sql = "SELECT * FROM attest_attestations WHERE 1=1";
  const args: (string | number | bigint | null | Uint8Array)[] = [];
  if (params?.subject) {
    sql += " AND subject = ?";
    args.push(params.subject);
  }
  if (params?.issuer) {
    sql += " AND issuer = ?";
    args.push(params.issuer);
  }
  sql += " ORDER BY at DESC";
  const res = await db.execute({ sql, args });
  await db.close();
  return res.rows.map((r) => rowToAttestation(r as unknown as Record<string, unknown>));
}

export async function findAttestationBySignature(sig: string): Promise<AttestationRow | null> {
  const db = client();
  const res = await db.execute({
    sql: "SELECT * FROM attest_attestations WHERE signature = ? OR id = ?",
    args: [sig, sig],
  });
  await db.close();
  const row = res.rows[0] as unknown as Record<string, unknown> | undefined;
  return row ? rowToAttestation(row) : null;
}
