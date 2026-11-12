import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, handle } from "@/lib/http";
import { processMidtransNotification } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "webhook", 60, 60_000);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("bad_json", "Payload tidak valid.", 400);
    }
    const result = await processMidtransNotification(body);
    return NextResponse.json({ ok: true, duplicate: result.duplicate });
  });
}
