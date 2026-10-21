import { NextRequest, NextResponse } from "next/server";
import { ensureTables, listProfiles, getProfile, upsertProfile } from "@/lib/turso";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase().replace(/^@/, "") ?? "";
  try {
    await ensureTables();
    if (q) {
      const all = await listProfiles();
      const matches = all.filter(
        (p) => p.nametag.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
      return NextResponse.json({ profiles: matches });
    }
    const profiles = await listProfiles();
    return NextResponse.json({ profiles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: { nametag?: string; address?: string; isAgent?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.nametag || !body.address) {
    return NextResponse.json({ error: "nametag and address are required" }, { status: 400 });
  }
  try {
    await ensureTables();
    await upsertProfile({
      nametag: body.nametag.trim().replace(/^@/, ""),
      address: body.address,
      isAgent: body.isAgent,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save profile" },
      { status: 400 }
    );
  }
}
