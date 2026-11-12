import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import { assertCsrf } from "@/lib/csrf";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, handle } from "@/lib/http";
import { normalizePhone } from "@/lib/phone";
import { attachTrackingCookie } from "@/lib/tracking";
import { trackSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "track", 20, 10 * 60_000);
    await assertCsrf(request);
    const body = trackSchema.parse(await request.json());
    const phone = normalizePhone(body.phone);
    const rows = await getDb()
      .select({ orderNumber: orders.orderNumber, phone: orders.phone })
      .from(orders)
      .where(eq(orders.orderNumber, body.orderNumber.toUpperCase()))
      .limit(1);
    const order = rows[0];
    if (!order || !phone || order.phone !== phone) {
      throw new AppError("missing", "Pesanan tidak ditemukan.", 404);
    }
    const response = NextResponse.json({ next: `/lacak/${order.orderNumber}` });
    attachTrackingCookie(response, request, order.orderNumber);
    return response;
  });
}
