export const voucherTypes = ["percent", "fixed", "shipping"] as const;
export type VoucherType = (typeof voucherTypes)[number];

export type VoucherRule = {
  code: string;
  type: VoucherType;
  value: number;
  minSpend: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  firstOrderOnly: boolean;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type DiscountResult = { ok: true; amount: number } | { ok: false; message: string };

export function evaluateVoucher(
  voucher: VoucherRule,
  ctx: { now: Date; subtotal: number; shipping: number | null; isFirstOrder: boolean },
): DiscountResult {
  if (!voucher.isActive) return { ok: false, message: "Voucher tidak aktif." };
  if (voucher.startsAt && voucher.startsAt.getTime() > ctx.now.getTime()) {
    return { ok: false, message: "Voucher belum berlaku." };
  }
  if (voucher.endsAt && voucher.endsAt.getTime() < ctx.now.getTime()) {
    return { ok: false, message: "Voucher sudah berakhir." };
  }
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    return { ok: false, message: "Voucher sudah habis." };
  }
  if (ctx.subtotal < voucher.minSpend) {
    return { ok: false, message: "Minimum belanja untuk voucher ini belum tercapai." };
  }
  if (voucher.firstOrderOnly && !ctx.isFirstOrder) {
    return { ok: false, message: "Voucher ini hanya untuk pesanan pertama." };
  }
  if (voucher.type === "shipping") {
    if (ctx.shipping == null) return { ok: false, message: "Pilih pengiriman dulu untuk voucher ongkir." };
    return { ok: true, amount: Math.min(voucher.value, ctx.shipping) };
  }
  if (voucher.type === "percent") {
    const raw = Math.floor((ctx.subtotal * voucher.value) / 100);
    const capped = voucher.maxDiscount == null ? raw : Math.min(raw, voucher.maxDiscount);
    return { ok: true, amount: Math.min(capped, ctx.subtotal) };
  }
  return { ok: true, amount: Math.min(voucher.value, ctx.subtotal) };
}
