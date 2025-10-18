import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Edge不可

export async function GET() {
  try {
    const [row] = await prisma.$queryRaw<
      { now: Date; db: string; version: string; cockroach: boolean }[]
    >`select now() as now, current_database() as db, version() as version, version() like '%CockroachDB%' as cockroach`;
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "No data returned from database" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, ...row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
