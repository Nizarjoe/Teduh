import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { releaseExpiredReservations } from "@/lib/inventory";
import { safeEqual } from "@/lib/secret";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getEnv().CRON_SECRET;
  if (!secret) return NextResponse.json({ error: { message: "Tidak ditemukan." } }, { status: 404 });
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !safeEqual(token, secret)) {
    return NextResponse.json({ error: { message: "Tidak diizinkan." } }, { status: 401 });
  }
  await releaseExpiredReservations();
  return NextResponse.json({ ok: true });
}
