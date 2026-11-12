import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { adminOrders } from "@/db/queries";
import { formatDateTime } from "@/lib/dates";
import { formatIDR } from "@/lib/money";
import { orderStatuses, statusLabel } from "@/lib/order-status";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const rows = await adminOrders(status);
  return (
    <div>
      <h1 className="font-serif text-4xl">Pesanan</h1>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/pesanan" className={`border px-3 py-1 ${status ? "border-line" : "border-ink"}`}>Semua</Link>
        {orderStatuses.map((item) => (
          <Link key={item} href={`/admin/pesanan?status=${item}`} className={`border px-3 py-1 ${status === item ? "border-ink" : "border-line"}`}>
            {statusLabel[item]}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? <p className="mt-8 text-sm text-ink-soft">Belum ada pesanan pada filter ini.</p> : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {rows.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/pesanan/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="mt-1 block text-ink-soft">{order.customerName} · {formatDateTime(order.createdAt)}</span>
                </span>
                <StatusBadge status={order.status} />
                <span className="tabular-nums">{formatIDR(order.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
