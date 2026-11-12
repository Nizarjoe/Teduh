import { randomBytes } from "node:crypto";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { getDb, type Db } from "@/db/client";
import { orders, productImages, productVariants, products, vouchers } from "@/db/schema";
import { resolveRegion } from "@/data/regions";
import { AppError } from "@/lib/errors";
import { lockVariants, releaseExpiredReservations, reserveLines } from "@/lib/inventory";
import { availableQty } from "@/lib/inventory";
import { logger, maskPhone } from "@/lib/logger";
import { normalizePhone } from "@/lib/phone";
import { makeOrderNumber } from "@/lib/order-number";
import {
  compensateFailedPayment,
  createSnapTransaction,
  isMockPayments,
  newPayToken,
  reservationMinutes,
  snapScriptUrl,
} from "@/lib/payments";
import { getEnv } from "@/lib/env";
import { getRates } from "@/lib/shipping";
import type { ShipRate } from "@/lib/shipping-quote";
import type { CheckoutResult } from "@/lib/storefront-types";
import { evaluateVoucher, type VoucherRule } from "@/lib/vouchers";
import type { QuoteItem, QuoteResponse } from "@/lib/storefront-types";
import type { CheckoutInput, QuoteInput } from "@/lib/validators";

export type { QuoteItem, QuoteResponse };

type LoadedLine = QuoteItem & { sku: string; productId: string };

function mergeQty(items: { variantId: string; qty: number }[]): Map<string, number> {
  const merged = new Map<string, number>();
  for (const item of items) merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.qty);
  for (const qty of merged.values()) {
    if (qty > 10) throw new AppError("qty", "Maksimal 10 buah per varian.", 400);
  }
  return merged;
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === "23505") return true;
  if ("cause" in error) return isUniqueViolation(error.cause);
  return false;
}

async function loadLines(db: Db, qtyByVariant: Map<string, number>): Promise<LoadedLine[]> {
  const ids = [...qtyByVariant.keys()];
  const rows = await db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      unitPrice: productVariants.price,
      weightGrams: productVariants.weightGrams,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      image: sql<string | null>`(
        select ${productImages.url} from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.sortOrder} asc
        limit 1
      )`,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(inArray(productVariants.id, ids), eq(productVariants.isActive, true), eq(products.isActive, true)));

  if (rows.length !== ids.length) {
    throw new AppError("stock", "Ada barang di keranjang yang sudah tidak dijual. Hapus, lalu pilih ulang.", 409);
  }

  const lines: LoadedLine[] = [];
  for (const row of rows) {
    const qty = qtyByVariant.get(row.variantId);
    if (!qty) continue;
    const available = await availableQty(db, row.variantId);
    lines.push({
      variantId: row.variantId,
      sku: row.sku,
      productId: row.productId,
      productName: row.productName,
      productSlug: row.productSlug,
      size: row.size,
      color: row.color,
      unitPrice: row.unitPrice,
      qty,
      lineTotal: row.unitPrice * qty,
      available,
      image: row.image,
      weightGrams: row.weightGrams,
    });
  }
  return lines;
}

function toRule(row: typeof vouchers.$inferSelect): VoucherRule {
  const type = row.type === "percent" || row.type === "fixed" || row.type === "shipping" ? row.type : "fixed";
  return {
    code: row.code,
    type,
    value: row.value,
    minSpend: row.minSpend,
    maxDiscount: row.maxDiscount,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
    firstOrderOnly: row.firstOrderOnly,
    isActive: row.isActive,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  };
}

async function isFirstOrder(db: Db, phone: string): Promise<boolean> {
  const prior = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.phone, phone), notInArray(orders.status, ["cancelled", "expired"])))
    .limit(1);
  return prior.length === 0;
}

async function findVoucher(db: Db, code: string) {
  const rows = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.code, code.trim().toUpperCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function quoteCart(input: QuoteInput): Promise<QuoteResponse> {
  const db = getDb();
  await releaseExpiredReservations(db);
  const lines = await loadLines(db, mergeQty(input.items));
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const weightGrams = lines.reduce((sum, line) => sum + line.weightGrams * line.qty, 0);

  let rates: ShipRate[] | null = null;
  let shippingSource: QuoteResponse["shippingSource"] = null;
  let shippingCost: number | null = null;
  const region =
    input.provinceId && input.cityId && input.districtId
      ? resolveRegion(input.provinceId, input.cityId, input.districtId)
      : null;
  if (input.provinceId && input.cityId && input.districtId) {
    if (!region) throw new AppError("address", "Alamat tidak dikenali.", 400);
    const quoted = await getRates({
      destinationPostal: region.district.postalCode,
      zone: region.city.zone,
      weightGrams,
      value: subtotal,
    });
    rates = quoted.rates;
    shippingSource = quoted.source;
    if (input.courierCode && input.serviceCode) {
      const chosen = rates.find(
        (rate) => rate.courierCode === input.courierCode && rate.serviceCode === input.serviceCode,
      );
      if (!chosen) throw new AppError("shipping", "Layanan kurir itu tidak tersedia untuk alamat ini.", 400);
      shippingCost = chosen.cost;
    }
  }

  let discount = 0;
  let voucher: QuoteResponse["voucher"] = null;
  if (input.voucherCode && input.voucherCode.trim()) {
    const row = await findVoucher(db, input.voucherCode);
    if (!row) voucher = { ok: false, message: "Kode voucher tidak ditemukan." };
    else {
      const phone = input.phone ? normalizePhone(input.phone) : null;
      const first = row.firstOrderOnly ? (phone ? await isFirstOrder(db, phone) : false) : true;
      if (row.firstOrderOnly && !phone) {
        voucher = { ok: false, message: "Isi nomor WhatsApp dulu untuk voucher pesanan pertama." };
      } else {
        const result = evaluateVoucher(toRule(row), {
          now: new Date(),
          subtotal,
          shipping: shippingCost,
          isFirstOrder: first,
        });
        if (result.ok) {
          discount = result.amount;
          voucher = { ok: true, code: row.code };
        } else voucher = { ok: false, message: result.message };
      }
    }
  }

  const total = shippingCost == null ? null : subtotal - discount + shippingCost;
  return {
    items: lines.map((line) => ({
      variantId: line.variantId,
      productName: line.productName,
      productSlug: line.productSlug,
      size: line.size,
      color: line.color,
      unitPrice: line.unitPrice,
      qty: line.qty,
      lineTotal: line.lineTotal,
      available: line.available,
      image: line.image,
      weightGrams: line.weightGrams,
    })),
    subtotal,
    weightGrams,
    rates,
    shippingSource,
    shippingCost,
    discount,
    voucher,
    total,
  };
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new AppError("phone", "Nomor WhatsApp tidak valid.", 400, { phone: "Nomor WhatsApp tidak valid." });
  const region = resolveRegion(input.provinceId, input.cityId, input.districtId);
  if (!region) throw new AppError("address", "Alamat tidak dikenali.", 400);

  const db = getDb();
  await releaseExpiredReservations(db);
  const preview = await loadLines(db, mergeQty(input.items));
  const weightGrams = preview.reduce((sum, line) => sum + line.weightGrams * line.qty, 0);
  const subtotalPreview = preview.reduce((sum, line) => sum + line.lineTotal, 0);
  const quoted = await getRates({
    destinationPostal: region.district.postalCode,
    zone: region.city.zone,
    weightGrams,
    value: subtotalPreview,
  });
  const chosen = quoted.rates.find(
    (rate) => rate.courierCode === input.courierCode && rate.serviceCode === input.serviceCode,
  );
  if (!chosen) throw new AppError("shipping", "Layanan kurir itu tidak tersedia untuk alamat ini.", 400);

  const created = await db.transaction(async (tx) => {
    await releaseExpiredReservations(tx);
    await lockVariants(tx, [...mergeQty(input.items).keys()]);
    const lines = await loadLines(tx, mergeQty(input.items));
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    let discount = 0;
    let voucherId: string | null = null;
    let voucherCode: string | null = null;
    if (input.voucherCode && input.voucherCode.trim()) {
      const locked = await tx
        .select()
        .from(vouchers)
        .where(eq(vouchers.code, input.voucherCode.trim().toUpperCase()))
        .for("update");
      const voucher = locked[0];
      if (!voucher) throw new AppError("voucher", "Kode voucher tidak ditemukan.", 400);
      const first = voucher.firstOrderOnly ? await isFirstOrder(tx, phone) : true;
      const decision = evaluateVoucher(toRule(voucher), {
        now: new Date(),
        subtotal,
        shipping: chosen.cost,
        isFirstOrder: first,
      });
      if (!decision.ok) throw new AppError("voucher", decision.message, 400);
      discount = decision.amount;
      voucherId = voucher.id;
      voucherCode = voucher.code;
      await tx
        .update(vouchers)
        .set({ usedCount: sql`${vouchers.usedCount} + 1` })
        .where(eq(vouchers.id, voucher.id));
    }
    const total = subtotal - discount + chosen.cost;
    if (total !== input.expectedTotal) {
      throw new AppError("total", "Harga atau ongkir berubah. Periksa ringkasan lagi.", 409);
    }
    const expiresAt = new Date(Date.now() + reservationMinutes() * 60_000);
    const payToken = newPayToken();
    let order: typeof orders.$inferSelect | undefined;
    try {
      const inserted = await tx
        .insert(orders)
        .values({
          orderNumber: makeOrderNumber(),
          status: "pending_payment",
          customerName: input.name.trim(),
          phone,
          email: input.email ? input.email : null,
          addressLine: input.addressLine.trim(),
          provinceName: region.province.name,
          cityName: region.city.name,
          districtName: region.district.name,
          postalCode: region.district.postalCode,
          notes: input.notes?.trim() ? input.notes.trim() : null,
          courierCode: chosen.courierCode,
          courierName: chosen.courierName,
          serviceCode: chosen.serviceCode,
          serviceName: chosen.serviceName,
          shippingCost: chosen.cost,
          shippingEtd: chosen.etd,
          shippingSource: quoted.source,
          subtotal,
          discount,
          total,
          voucherId,
          voucherCode,
          payToken,
          reservationExpiresAt: expiresAt,
        })
        .returning();
      order = inserted[0];
    } catch (error) {
      if (isUniqueViolation(error)) throw new AppError("conflict", "Coba buat pesanan sekali lagi.", 409);
      throw error;
    }
    if (!order) throw new AppError("internal", "Pesanan gagal dibuat.", 500);
    const { orderItems } = await import("@/db/schema");
    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: order.id,
        productId: line.productId,
        variantId: line.variantId,
        productName: line.productName,
        sku: line.sku,
        size: line.size,
        color: line.color,
        qty: line.qty,
        unitPrice: line.unitPrice,
        weightGrams: line.weightGrams,
      })),
    );
    await reserveLines(
      tx,
      order.id,
      lines.map((line) => ({
        variantId: line.variantId,
        qty: line.qty,
        label: `${line.productName} ${line.size} ${line.color}`,
      })),
      expiresAt,
    );
    return { order, lines };
  });

  logger.info("pesanan dibuat", { order: created.order.orderNumber, phone: maskPhone(phone) });

  if (isMockPayments()) {
    return {
      orderNumber: created.order.orderNumber,
      mode: "mock",
      payToken: created.order.payToken,
      snapToken: null,
      snapScriptUrl: null,
      clientKey: null,
    };
  }

  try {
    const snap = await createSnapTransaction({
      orderNumber: created.order.orderNumber,
      total: created.order.total,
      name: created.order.customerName,
      phone: created.order.phone,
      email: created.order.email,
      shippingCost: created.order.shippingCost,
      shippingName: `Ongkir ${created.order.courierName}`,
      discount: created.order.discount,
      lines: created.lines.map((line) => ({
        sku: line.sku,
        name: `${line.productName} ${line.size}/${line.color}`,
        price: line.unitPrice,
        qty: line.qty,
      })),
    });
    await db.update(orders).set({ snapToken: snap.token, updatedAt: new Date() }).where(eq(orders.id, created.order.id));
    return {
      orderNumber: created.order.orderNumber,
      mode: "snap",
      payToken: null,
      snapToken: snap.token,
      snapScriptUrl: snapScriptUrl(),
      clientKey: getEnv().MIDTRANS_CLIENT_KEY,
    };
  } catch (error) {
    await compensateFailedPayment(created.order.id);
    throw error;
  }
}

export function randomId(): string {
  return randomBytes(8).toString("hex");
}
