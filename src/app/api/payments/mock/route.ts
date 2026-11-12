import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import { assertCsrf } from "@/lib/csrf";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, handle } from "@/lib/http";
import { midtransSignature } from "@/lib/midtrans-sign";
import { isMockPayments, processMidtransNotification } from "@/lib/payments";
import { attachTrackingCookie } from "@/lib/tracking";
import { mockPaymentSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    if (!isMockPayments()) throw new AppError("not_found", "Tidak ditemukan.", 404);
    await enforceRateLimit(request, "mock-pay", 20, 10 * 60_000);
    await assertCsrf(request);
    const body = mockPaymentSchema.parse(await request.json());
    const rows = await getDb().select().from(orders).where(eq(orders.orderNumber, body.orderNumber)).limit(1);
    const order = rows[0];
    if (!order || order.payToken !== body.token) throw new AppError("not_found", "Tidak ditemukan.", 404);
    const gross = `${order.total}.00`;
    const statusCode = body.outcome === "success" ? "200" : "202";
    const transactionStatus = body.outcome === "success" ? "settlement" : "deny";
    const payload = {
      order_id: order.orderNumber,
      status_code: statusCode,
      gross_amount: gross,
      transaction_status: transactionStatus,
      transaction_id: `mock-${order.id}-${body.outcome}`,
      payment_type: "qris",
      signature_key: midtransSignature({
        orderId: order.orderNumber,
        statusCode,
        grossAmount: gross,
        serverKey: getEnv().MIDTRANS_SERVER_KEY,
      }),
    };
    await processMidtransNotification(payload);
    const response = NextResponse.json({ next: `/lacak/${order.orderNumber}` });
    attachTrackingCookie(response, request, order.orderNumber);
    return response;
  });
}
