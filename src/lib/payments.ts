import { randomBytes } from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db/client";
import { getDb } from "@/db/client";
import {
  inventoryReservations,
  orderItems,
  orders,
  productVariants,
  webhookEvents,
} from "@/db/schema";
import { getEnv, paymentDriver } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { releaseOrderStock } from "@/lib/inventory";
import { logger } from "@/lib/logger";
import { buildChargeItems, chargeTotal, type ChargeLine } from "@/lib/midtrans-charge";
import { midtransSignature } from "@/lib/midtrans-sign";
import { safeEqual } from "@/lib/secret";

const RESERVATION_MINUTES = 30;

export function reservationMinutes(): number {
  return RESERVATION_MINUTES;
}

export function newPayToken(): string {
  return randomBytes(18).toString("base64url");
}

const notificationSchema = z.object({
  order_id: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.union([z.string(), z.number()]).transform(String),
  signature_key: z.string().min(1),
  transaction_status: z.string().min(1),
  transaction_id: z.string().optional(),
  payment_type: z.string().optional(),
  fraud_status: z.string().optional(),
});

type Notification = z.infer<typeof notificationSchema>;

function outcomeOf(status: string, fraud?: string): "paid" | "pending" | "cancel" | "expire" | "refund" | "ignore" {
  if (status === "settlement") return "paid";
  if (status === "capture") {
    if (fraud === "challenge") return "pending";
    if (fraud === "deny") return "cancel";
    return "paid";
  }
  if (status === "pending") return "pending";
  if (status === "expire") return "expire";
  if (status === "deny" || status === "cancel" || status === "failure") return "cancel";
  if (status === "refund" || status === "partial_refund") return "refund";
  return "ignore";
}

export async function createSnapTransaction(input: {
  orderNumber: string;
  total: number;
  name: string;
  phone: string;
  email: string | null;
  lines: ChargeLine[];
  shippingCost: number;
  shippingName: string;
  discount: number;
}): Promise<{ token: string; redirectUrl: string }> {
  const env = getEnv();
  const items = buildChargeItems({
    lines: input.lines,
    shippingCost: input.shippingCost,
    shippingName: input.shippingName,
    discount: input.discount,
  });
  if (chargeTotal(items) !== input.total) {
    throw new AppError("payment", "Rincian pembayaran tidak seimbang.", 500);
  }
  const base = env.MIDTRANS_IS_PRODUCTION ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  const response = await fetch(`${base}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString("base64")}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: { order_id: input.orderNumber, gross_amount: input.total },
      item_details: items,
      customer_details: {
        first_name: input.name.slice(0, 50),
        phone: input.phone,
        email: input.email ?? undefined,
      },
      enabled_payments: [
        "qris",
        "gopay",
        "shopeepay",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "other_va",
        "credit_card",
      ],
      expiry: { unit: "minutes", duration: RESERVATION_MINUTES },
      callbacks: { finish: `${env.APP_URL}/lacak/${input.orderNumber}` },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    logger.error("midtrans snap gagal", { status: response.status });
    throw new AppError("payment", "Pembayaran belum bisa dibuat. Coba lagi.", 502);
  }
  const json = (await response.json()) as { token?: string; redirect_url?: string };
  if (!json.token || !json.redirect_url) {
    throw new AppError("payment", "Jawaban Midtrans tidak lengkap.", 502);
  }
  return { token: json.token, redirectUrl: json.redirect_url };
}

export function snapScriptUrl(): string {
  return getEnv().MIDTRANS_IS_PRODUCTION
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

async function commitStock(tx: Db, orderId: string): Promise<boolean> {
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  let needsAttention = false;
  for (const item of items) {
    if (!item.variantId) {
      needsAttention = true;
      continue;
    }
    const updated = await tx
      .update(productVariants)
      .set({ stock: sql`${productVariants.stock} - ${item.qty}` })
      .where(and(eq(productVariants.id, item.variantId), gte(productVariants.stock, item.qty)))
      .returning({ id: productVariants.id });
    if (updated.length === 0) needsAttention = true;
  }
  await tx
    .update(inventoryReservations)
    .set({ status: "committed" })
    .where(and(eq(inventoryReservations.orderId, orderId), eq(inventoryReservations.status, "active")));
  return needsAttention;
}

export async function processMidtransNotification(raw: unknown): Promise<{ duplicate: boolean }> {
  const body = notificationSchema.parse(raw);
  const expected = midtransSignature({
    orderId: body.order_id,
    statusCode: body.status_code,
    grossAmount: body.gross_amount,
    serverKey: getEnv().MIDTRANS_SERVER_KEY,
  });
  if (!safeEqual(expected, body.signature_key)) {
    throw new AppError("signature", "Tanda tangan tidak valid.", 401);
  }
  return applyNotification(body);
}

async function applyNotification(body: Notification): Promise<{ duplicate: boolean }> {
  const amount = Number(body.gross_amount);
  return getDb().transaction(async (tx) => {
    const locked = await tx.select().from(orders).where(eq(orders.orderNumber, body.order_id)).for("update");
    const order = locked[0];
    if (!order) throw new AppError("missing", "Pesanan tidak ditemukan.", 404);
    if (!Number.isFinite(amount) || Math.round(amount) !== order.total) {
      logger.error("nominal midtrans tidak cocok", { order: order.orderNumber });
      throw new AppError("amount", "Nominal tidak sesuai pesanan.", 400);
    }
    const dedupeKey = `${body.order_id}:${body.transaction_id ?? "none"}:${body.transaction_status}:${body.gross_amount}`;
    const inserted = await tx
      .insert(webhookEvents)
      .values({ provider: "midtrans", dedupeKey, orderId: order.id })
      .onConflictDoNothing()
      .returning({ id: webhookEvents.id });
    if (inserted.length === 0) return { duplicate: true };

    const outcome = outcomeOf(body.transaction_status, body.fraud_status);
    const patch: Partial<typeof orders.$inferInsert> = {
      paymentType: body.payment_type ?? order.paymentType,
      midtransTransactionId: body.transaction_id ?? order.midtransTransactionId,
      updatedAt: new Date(),
    };

    if (outcome === "paid" && ["pending_payment", "expired", "cancelled"].includes(order.status)) {
      const stockIssue = await commitStock(tx, order.id);
      patch.status = "paid";
      patch.paidAt = new Date();
      patch.needsAttention = stockIssue || order.status !== "pending_payment";
    } else if ((outcome === "cancel" || outcome === "expire") && order.status === "pending_payment") {
      patch.status = outcome === "expire" ? "expired" : "cancelled";
      await releaseOrderStock(tx, order.id, order.voucherId);
    } else if (outcome === "refund" && ["paid", "processing", "shipped"].includes(order.status)) {
      patch.status = "refunded";
      patch.needsAttention = true;
    }

    await tx.update(orders).set(patch).where(eq(orders.id, order.id));
    logger.info("notifikasi midtrans", { order: order.orderNumber, status: patch.status ?? order.status });
    return { duplicate: false };
  });
}

export async function compensateFailedPayment(orderId: string): Promise<void> {
  await getDb().transaction(async (tx) => {
    const locked = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    const order = locked[0];
    if (!order || order.status !== "pending_payment") return;
    await tx
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date(), internalNote: "Snap gagal dibuat." })
      .where(eq(orders.id, order.id));
    await releaseOrderStock(tx, order.id, order.voucherId);
  });
}

export function isMockPayments(): boolean {
  return paymentDriver() === "mock";
}
