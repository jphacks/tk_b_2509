import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Edge不可

export async function GET() {
  try {
    const [row] = await prisma.$queryRaw<
      { now: Date; db: string; version: string; cockroach: boolean }[]
    >`select now() as now, current_database() as db, version() as version, version() like '%CockroachDB%' as cockroach`;
    return NextResponse.json({ ok: true, ...row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}