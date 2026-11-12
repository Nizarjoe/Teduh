export const orderStatuses = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "expired",
  "refunded",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  paid: "Lunas",
  processing: "Sedang disiapkan",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  refunded: "Dana dikembalikan",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (orderStatuses as readonly string[]).includes(value);
}
