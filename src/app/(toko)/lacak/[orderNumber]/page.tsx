import type { Metadata } from "next";
import { OrderStatusView } from "@/components/order-status-view";
import { TrackForm } from "@/components/track-form";
import { getOrderByNumber } from "@/db/queries";
import { releaseExpiredReservations } from "@/lib/inventory";
import { trackingOrderFromCookie } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Status pesanan", robots: { index: false, follow: false } };

export default async function TrackResultPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  await releaseExpiredReservations();
  const allowed = await trackingOrderFromCookie();
  const order = allowed === orderNumber ? await getOrderByNumber(orderNumber) : null;
  if (!order) {
    return (
      <div>
        <h1 className="font-serif text-4xl">Masukkan WhatsApp</h1>
        <p className="mt-3 text-ink-soft">Untuk melihat pesanan ini, isi nomor yang dipakai saat memesan.</p>
        <TrackForm initialNumber={orderNumber} />
      </div>
    );
  }
  return <OrderStatusView order={order} />;
}
