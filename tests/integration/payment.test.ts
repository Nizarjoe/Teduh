import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import {
  categories,
  inventoryReservations,
  orderItems,
  orders,
  productVariants,
  products,
  webhookEvents,
} from "@/db/schema";
import { getEnv } from "@/lib/env";
import { midtransSignature } from "@/lib/midtrans-sign";
import { processMidtransNotification } from "@/lib/payments";

const db = getDb();
const sku = `UJI-${Date.now()}`;
let variantId = "";
let orderId = "";
let categoryId = "";
let productId = "";

describe("notifikasi pembayaran", () => {
  afterAll(async () => {
    if (orderId) {
      await db.delete(webhookEvents).where(eq(webhookEvents.orderId, orderId));
      await db.delete(orders).where(eq(orders.id, orderId));
    }
    if (variantId) await db.delete(productVariants).where(eq(productVariants.id, variantId));
    if (productId) await db.delete(products).where(eq(products.id, productId));
    if (categoryId) await db.delete(categories).where(eq(categories.id, categoryId));
  });

  it("menolak tanda tangan palsu dan menerima pelunasan sekali", async () => {
    const category = await db.insert(categories).values({ slug: sku.toLowerCase(), name: "Uji", description: "Uji", sortOrder: 99 }).returning();
    categoryId = category[0]?.id ?? "";
    const product = await db
      .insert(products)
      .values({
        categoryId,
        slug: sku.toLowerCase(),
        name: "Uji",
        description: "Produk uji pembayaran yang tidak ditampilkan.",
        materialType: "pvc",
        materialNote: "uji bahan catatan",
        waterproofNote: "uji tahan air catatan",
        careNote: "uji perawatan catatan",
        sizeChart: "dewasa",
        weightGrams: 400,
        isActive: false,
      })
      .returning();
    productId = product[0]?.id ?? "";
    const variant = await db
      .insert(productVariants)
      .values({
        productId,
        sku,
        size: "L",
        color: "Hitam",
        colorHex: "#111111",
        price: 100_000,
        stock: 2,
        weightGrams: 400,
      })
      .returning();
    variantId = variant[0]?.id ?? "";
    const order = await db
      .insert(orders)
      .values({
        orderNumber: sku,
        status: "pending_payment",
        customerName: "Penguji",
        phone: "628120009999",
        addressLine: "Jl. Uji Coba No. 1",
        provinceName: "DKI Jakarta",
        cityName: "Jakarta Selatan",
        districtName: "Cilandak",
        postalCode: "12430",
        courierCode: "jne",
        courierName: "JNE",
        serviceCode: "REG",
        serviceName: "Reguler",
        shippingCost: 0,
        shippingEtd: "1 hari",
        shippingSource: "perkiraan",
        subtotal: 100_000,
        discount: 0,
        total: 100_000,
        reservationExpiresAt: new Date(Date.now() + 60_000),
      })
      .returning();
    orderId = order[0]?.id ?? "";
    await db.insert(orderItems).values({
      orderId,
      productId,
      variantId,
      productName: "Uji",
      sku,
      size: "L",
      color: "Hitam",
      qty: 2,
      unitPrice: 50_000,
      weightGrams: 400,
    });
    await db.insert(inventoryReservations).values({
      orderId,
      variantId,
      qty: 2,
      status: "active",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const gross = "100000.00";
    await expect(
      processMidtransNotification({
        order_id: sku,
        status_code: "200",
        gross_amount: gross,
        signature_key: "salah",
        transaction_status: "settlement",
        transaction_id: "tx-salah",
      }),
    ).rejects.toMatchObject({ status: 401 });

    const signature = midtransSignature({
      orderId: sku,
      statusCode: "200",
      grossAmount: gross,
      serverKey: getEnv().MIDTRANS_SERVER_KEY,
    });
    const body = {
      order_id: sku,
      status_code: "200",
      gross_amount: gross,
      signature_key: signature,
      transaction_status: "settlement",
      transaction_id: "tx-uji",
      payment_type: "qris",
    };
    await processMidtransNotification(body);
    await processMidtransNotification(body);

    const updated = await db.select().from(orders).where(eq(orders.id, orderId));
    const stock = await db.select().from(productVariants).where(eq(productVariants.id, variantId));
    expect(updated[0]?.status).toBe("paid");
    expect(stock[0]?.stock).toBe(0);
  });
});
