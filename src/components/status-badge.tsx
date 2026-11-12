import { isOrderStatus, statusLabel } from "@/lib/order-status";

export function StatusBadge({ status }: { status: string }) {
  const label = isOrderStatus(status) ? statusLabel[status] : status;
  const tone =
    status === "paid" || status === "delivered"
      ? "bg-mist text-rain"
      : status === "pending_payment"
        ? "bg-sand text-ink"
        : status === "cancelled" || status === "expired" || status === "refunded"
          ? "bg-line text-ink"
          : "bg-surface text-ink";
  return <span className={`inline-block px-2 py-1 text-xs ${tone}`}>{label}</span>;
}
