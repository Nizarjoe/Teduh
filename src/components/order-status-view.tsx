import { formatDateTime } from "@/lib/dates";
import { formatIDR } from "@/lib/money";
import { isOrderStatus, statusLabel, type OrderStatus } from "@/lib/order-status";

const flow: OrderStatus[] = ["pending_payment", "paid", "processing", "shipped", "delivered"];

function paymentLabel(value: string): string {
  const labels: Record<string, string> = {
    qris: "QRIS",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
    credit_card: "Kartu",
    bank_transfer: "Virtual account",
  };
  return labels[value] ?? value;
}

export function OrderStatusView({
  order,
}: {
  order: {
    orderNumber: string;
    status: string;
    customerName: string;
    total: number;
    shippingCost: number;
    discount: number;
    subtotal: number;
    courierName: string;
    serviceName: string;
    shippingEtd: string;
    resi: string | null;
    paymentType: string | null;
    createdAt: Date;
    addressLine: string;
    districtName: string;
    cityName: string;
    provinceName: string;
    items: { id: string; productName: string; size: string; color: string; qty: number; unitPrice: number }[];
  };
}) {
  const status = isOrderStatus(order.status) ? order.status : "pending_payment";
  const terminal = status === "cancelled" || status === "expired" || status === "refunded";
  const rank = flow.indexOf(status);
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ink-soft">Nomor pesanan</p>
      <h1 className="font-serif text-4xl" data-testid="nomor-pesanan">{order.orderNumber}</h1>
      <p className="mt-3 text-lg">{statusLabel[status]}</p>
      <p className="mt-1 text-sm text-ink-soft">{formatDateTime(order.createdAt)} WIB</p>
      {terminal ? null : (
        <ol className="mt-6 grid gap-2 text-sm md:grid-cols-5">
          {flow.map((step, index) => (
            <li key={step} className={index <= rank ? "text-ink" : "text-ink-soft"}>
              {statusLabel[step]}
            </li>
          ))}
        </ol>
      )}
      {order.resi ? (
        <p className="mt-6 text-sm">Nomor resi {order.courierName}: <span className="font-medium">{order.resi}</span>. Lacak di situs kurir.</p>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">{order.courierName} {order.serviceName} · {order.shippingEtd}</p>
      )}
      {order.paymentType ? <p className="mt-2 text-sm text-ink-soft">Pembayaran: {paymentLabel(order.paymentType)}</p> : null}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
            <span>{item.productName} · {item.size} · {item.color} · {item.qty}</span>
            <span className="tabular-nums">{formatIDR(item.unitPrice * item.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatIDR(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Diskon</dt><dd className="tabular-nums">{formatIDR(order.discount)}</dd></div>
        <div className="flex justify-between"><dt>Ongkir</dt><dd className="tabular-nums">{formatIDR(order.shippingCost)}</dd></div>
        <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular-nums">{formatIDR(order.total)}</dd></div>
      </dl>
      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        {order.customerName}<br />
        {order.addressLine}, {order.districtName}, {order.cityName}, {order.provinceName}
      </p>
    </div>
  );
}
