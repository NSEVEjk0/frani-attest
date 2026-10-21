import { NextRequest, NextResponse } from "next/server";
import { ensureTables, addAttestation, listAttestations, findAttestationBySignature } from "@/lib/turso";

export async function GET(req: NextRequest) {
  const subject = req.nextUrl.searchParams.get("subject") ?? undefined;
  const issuer = req.nextUrl.searchParams.get("issuer") ?? undefined;
  const sig = req.nextUrl.searchParams.get("signature") ?? undefined;
  try {
    await ensureTables();
    if (sig) {
      const found = await findAttestationBySignature(sig);
      return NextResponse.json({ attestation: found });
    }
    const attestations = await listAttestations({ subject, issuer });
    return NextResponse.json({ attestations });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load attestations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: {
    issuer?: string;
    subject?: string;
    claim?: string;
    rating?: number;
    note?: string;
    signature?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.issuer || !body.subject || !body.claim || !body.signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }
  try {
    await ensureTables();
    const id = `att_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
    await addAttestation({
      id,
      issuer: body.issuer,
      subject: body.subject,
      claim: body.claim,
      rating,
      note: body.note ?? "",
      signature: body.signature,
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not add attestation" },
      { status: 400 }
    );
  }
}
