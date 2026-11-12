import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orderItems, orders, productImages, productVariants, products, reviews, vouchers } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { releaseOrderStock } from "@/lib/inventory";
import { isOrderStatus, type OrderStatus } from "@/lib/order-status";
import type { ProductInput } from "@/lib/validators";

const nextStatus: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ["cancelled"],
  paid: ["processing", "refunded"],
  processing: ["shipped", "refunded"],
  shipped: ["delivered"],
};

export async function saveProduct(input: ProductInput, id?: string): Promise<string> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const slugOwner = await tx.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
    if (slugOwner[0] && slugOwner[0].id !== id) throw new AppError("slug", "Slug sudah dipakai.", 409);

    const values = {
      categoryId: input.categoryId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      materialType: input.materialType,
      materialNote: input.materialNote,
      waterproofNote: input.waterproofNote,
      careNote: input.careNote,
      sizeChart: input.sizeChart,
      weightGrams: input.weightGrams,
      isActive: input.isActive,
      isBestSeller: input.isBestSeller,
      updatedAt: new Date(),
    };
    let productId = id;
    if (productId) {
      const existing = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
      if (!existing[0]) throw new AppError("missing", "Produk tidak ditemukan.", 404);
      await tx.update(products).set(values).where(eq(products.id, productId));
    } else {
      const inserted = await tx.insert(products).values(values).returning({ id: products.id });
      productId = inserted[0]?.id;
    }
    if (!productId) throw new AppError("internal", "Produk gagal disimpan.", 500);

    await tx.delete(productImages).where(eq(productImages.productId, productId));
    await tx.insert(productImages).values(
      input.images.map((image, index) => ({
        productId,
        url: image.url,
        alt: image.alt,
        sortOrder: index,
      })),
    );

    const kept = new Set<string>();
    for (const variant of input.variants) {
      if (variant.id) {
        const owned = await tx
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(and(eq(productVariants.id, variant.id), eq(productVariants.productId, productId)))
          .limit(1);
        if (!owned[0]) throw new AppError("variant", "Varian tidak termasuk produk ini.", 400);
        await tx
          .update(productVariants)
          .set({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice ?? null,
            stock: variant.stock,
            weightGrams: variant.weightGrams,
            isActive: variant.isActive,
          })
          .where(eq(productVariants.id, variant.id));
        kept.add(variant.id);
      } else {
        const inserted = await tx
          .insert(productVariants)
          .values({
            productId,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice ?? null,
            stock: variant.stock,
            weightGrams: variant.weightGrams,
            isActive: variant.isActive,
          })
          .returning({ id: productVariants.id });
        const created = inserted[0];
        if (created) kept.add(created.id);
      }
    }
    const current = await tx.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, productId));
    for (const row of current) {
      if (!kept.has(row.id)) {
        await tx.update(productVariants).set({ isActive: false }).where(eq(productVariants.id, row.id));
      }
    }
    return productId;
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus, resi: string): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    const rows = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    const order = rows[0];
    if (!order || !isOrderStatus(order.status)) throw new AppError("missing", "Pesanan tidak ditemukan.", 404);
    if (status === "paid") throw new AppError("status", "Status lunas hanya berubah lewat Midtrans.", 400);
    const allowed = nextStatus[order.status] ?? [];
    if (!allowed.includes(status)) throw new AppError("status", "Perpindahan status itu tidak diizinkan.", 400);
    if (status === "shipped" && resi.trim().length < 5) {
      throw new AppError("resi", "Isi nomor resi.", 400, { resi: "Isi nomor resi." });
    }
    if (status === "cancelled" && order.status === "pending_payment") {
      await releaseOrderStock(tx, order.id, order.voucherId);
    }
    await tx
      .update(orders)
      .set({
        status,
        resi: status === "shipped" ? resi.trim().toUpperCase() : order.resi,
        shippedAt: status === "shipped" ? new Date() : order.shippedAt,
        needsAttention: status === "refunded" ? true : order.needsAttention,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
  });
}

export async function moderateReview(id: string, status: "pending" | "approved" | "rejected"): Promise<void> {
  const updated = await getDb().update(reviews).set({ status }).where(eq(reviews.id, id)).returning({ id: reviews.id });
  if (!updated[0]) throw new AppError("missing", "Ulasan tidak ditemukan.", 404);
}

export async function createVoucher(input: {
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  firstOrderOnly: boolean;
  isActive: boolean;
}): Promise<void> {
  try {
    await getDb().insert(vouchers).values({
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      minSpend: input.minSpend,
      maxDiscount: input.maxDiscount ?? null,
      usageLimit: input.usageLimit ?? null,
      firstOrderOnly: input.firstOrderOnly,
      isActive: input.isActive,
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new AppError("voucher", "Kode sudah ada.", 409);
    }
    throw error;
  }
}

export async function setVoucherActive(id: string, isActive: boolean): Promise<void> {
  const updated = await getDb().update(vouchers).set({ isActive }).where(eq(vouchers.id, id)).returning({ id: vouchers.id });
  if (!updated[0]) throw new AppError("missing", "Voucher tidak ditemukan.", 404);
}

export async function productForEdit(id: string) {
  const db = getDb();
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: (image, { asc }) => [asc(image.sortOrder)] },
      variants: true,
    },
  });
  return product ?? null;
}

export async function skuTaken(sku: string, variantId?: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(variantId ? and(eq(productVariants.sku, sku), ne(productVariants.id, variantId)) : eq(productVariants.sku, sku))
    .limit(1);
  return Boolean(rows[0]);
}

export async function countOrderItems(orderId: string): Promise<number> {
  const rows = await getDb().select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.orderId, orderId));
  return rows.length;
}
