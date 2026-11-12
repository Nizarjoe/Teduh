import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderEditor } from "@/components/admin/order-editor";
import { StatusBadge } from "@/components/status-badge";
import { adminOrder } from "@/db/queries";
import { formatDateTime } from "@/lib/dates";
import { formatIDR } from "@/lib/money";
import { formatPhoneDisplay } from "@/lib/phone";
import { isOrderStatus } from "@/lib/order-status";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await adminOrder(id);
  if (!data) notFound();
  const { order, items } = data;
  const status = isOrderStatus(order.status) ? order.status : "pending_payment";
  return (
    <div className="max-w-3xl">
      <Link href="/admin/pesanan" className="text-sm underline underline-offset-4">Semua pesanan</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-ink-soft">{formatDateTime(order.createdAt)}</p>
      {order.needsAttention ? <p className="mt-4 border border-clay px-3 py-2 text-sm">Perlu dicek. Stok atau pembayaran tidak berjalan mulus.</p> : null}
      {order.internalNote ? <p className="mt-4 bg-sand px-3 py-2 text-sm">{order.internalNote}</p> : null}
      <section className="mt-6 text-sm leading-relaxed">
        <p className="font-medium">{order.customerName}</p>
        <p>{formatPhoneDisplay(order.phone)}</p>
        <p>{order.addressLine}, {order.districtName}, {order.cityName}, {order.provinceName} {order.postalCode}</p>
        {order.notes ? <p className="mt-2 text-ink-soft">Catatan: {order.notes}</p> : null}
      </section>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-3">
            <span>{item.productName} · {item.size} · {item.color} · {item.qty}</span>
            <span className="tabular-nums">{formatIDR(item.unitPrice * item.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">Ongkir {order.courierName} {order.serviceName}: {formatIDR(order.shippingCost)} · Total {formatIDR(order.total)}</p>
      {order.paymentType ? <p className="mt-1 text-sm text-ink-soft">Pembayaran {order.paymentType}</p> : null}
      {order.resi ? <p className="mt-1 text-sm">Resi {order.resi}</p> : null}
      <OrderEditor id={order.id} status={status} resi={order.resi ?? ""} />
    </div>
  );
}
