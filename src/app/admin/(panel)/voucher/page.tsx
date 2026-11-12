import { desc } from "drizzle-orm";
import { VoucherPanel } from "@/components/admin/voucher-panel";
import { getDb } from "@/db/client";
import { vouchers } from "@/db/schema";

export default async function VoucherPage() {
  const rows = await getDb().select().from(vouchers).orderBy(desc(vouchers.createdAt));
  return (
    <div>
      <h1 className="font-serif text-4xl">Voucher</h1>
      <VoucherPanel
        vouchers={rows.map((row) => ({
          id: row.id,
          code: row.code,
          type: row.type,
          value: row.value,
          minSpend: row.minSpend,
          usedCount: row.usedCount,
          isActive: row.isActive,
          firstOrderOnly: row.firstOrderOnly,
        }))}
      />
    </div>
  );
}
