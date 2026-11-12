import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MockPay } from "@/components/mock-pay";
import { getOrderByNumber } from "@/db/queries";
import { isMockPayments } from "@/lib/payments";
import { formatIDR } from "@/lib/money";
import { statusLabel, isOrderStatus } from "@/lib/order-status";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pembayaran uji", robots: { index: false, follow: false } };

export default async function MockPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  if (!isMockPayments()) notFound();
  const { orderNumber } = await params;
  const { token } = await searchParams;
  const order = await getOrderByNumber(orderNumber);
  if (!order || !token || order.payToken !== token) notFound();
  const status = isOrderStatus(order.status) ? statusLabel[order.status] : order.status;
  return (
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.16em] text-rain">Mode uji</p>
      <h1 className="mt-3 font-serif text-4xl">Tidak ada dana yang ditarik.</h1>
      <p className="mt-4 text-ink-soft">
        Ini pembayaran tiruan untuk sandbox lokal. Status pesanan tetap hanya berubah lewat notifikasi yang tanda tangannya diperiksa.
      </p>
      <p className="mt-6 text-sm text-ink-soft">Nomor pesanan</p>
      <p className="font-medium" data-testid="nomor-pesanan">{order.orderNumber}</p>
      <p className="mt-4 text-sm text-ink-soft">Total</p>
      <p className="tabular-nums">{formatIDR(order.total)}</p>
      <p className="mt-4 text-sm">Status sekarang: {status}</p>
      {order.status === "pending_payment" ? <MockPay orderNumber={order.orderNumber} token={token} /> : (
        <Link className="mt-6 inline-block underline underline-offset-4" href={`/lacak/${order.orderNumber}`}>Lihat pesanan</Link>
      )}
    </div>
  );
}
