import { and, eq, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { getDb } from "@/db/client";
import { inventoryReservations, orders, vouchers } from "@/db/schema";
import { AppError } from "@/lib/errors";

export async function availableQty(db: Db, variantId: string): Promise<number> {
  const result = await db.execute(sql`
    select greatest(v.stock - coalesce((
      select sum(r.qty)::int
      from inventory_reservations r
      where r.variant_id = v.id
        and r.status = 'active'
        and r.expires_at > now()
    ), 0), 0)::int as available
    from product_variants v
    where v.id = ${variantId}
  `);
  const row = result.rows[0] as { available: number } | undefined;
  return row ? Number(row.available) : 0;
}

export async function releaseExpiredReservations(db: Db = getDb()): Promise<void> {
  await db.execute(sql`
    with expired as (
      update orders
      set status = 'expired', updated_at = now()
      where status = 'pending_payment'
        and reservation_expires_at < now()
      returning id, voucher_id
    ),
    released as (
      update inventory_reservations r
      set status = 'released'
      from expired e
      where r.order_id = e.id
        and r.status = 'active'
    )
    update vouchers v
    set used_count = greatest(v.used_count - 1, 0)
    from expired e
    where v.id = e.voucher_id
  `);
}

export async function lockVariants(tx: Db, ids: string[]): Promise<void> {
  const sorted = [...new Set(ids)].sort();
  for (const id of sorted) {
    await tx.execute(sql`select id from product_variants where id = ${id} for update`);
  }
}

export async function reserveLines(
  tx: Db,
  orderId: string,
  lines: { variantId: string; qty: number; label: string }[],
  expiresAt: Date,
): Promise<void> {
  const sorted = [...lines].sort((a, b) => a.variantId.localeCompare(b.variantId));
  for (const line of sorted) {
    const locked = await tx.execute(sql`
      select id from product_variants where id = ${line.variantId} for update
    `);
    if (locked.rows.length === 0) {
      throw new AppError("stock", "Ada barang yang sudah tidak dijual.", 409);
    }
    const available = await availableQty(tx, line.variantId);
    if (available < line.qty) {
      throw new AppError("stock", `Stok ${line.label} tinggal ${available}.`, 409);
    }
  }
  if (sorted.length === 0) return;
  await tx.insert(inventoryReservations).values(
    sorted.map((line) => ({
      orderId,
      variantId: line.variantId,
      qty: line.qty,
      status: "active" as const,
      expiresAt,
    })),
  );
}

export async function releaseOrderStock(tx: Db, orderId: string, voucherId: string | null): Promise<void> {
  await tx
    .update(inventoryReservations)
    .set({ status: "released" })
    .where(and(eq(inventoryReservations.orderId, orderId), eq(inventoryReservations.status, "active")));
  if (voucherId) {
    await tx
      .update(vouchers)
      .set({ usedCount: sql`greatest(${vouchers.usedCount} - 1, 0)` })
      .where(eq(vouchers.id, voucherId));
  }
  await tx.update(orders).set({ updatedAt: new Date() }).where(eq(orders.id, orderId));
}
