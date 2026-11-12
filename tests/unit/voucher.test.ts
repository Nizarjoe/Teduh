import { describe, expect, it } from "vitest";
import { evaluateVoucher, type VoucherRule } from "@/lib/vouchers";

const now = new Date("2026-11-12T03:00:00.000Z");

function rule(patch: Partial<VoucherRule> = {}): VoucherRule {
  return {
    code: "TEDUH10",
    type: "percent",
    value: 10,
    minSpend: 150_000,
    maxDiscount: 30_000,
    usageLimit: null,
    usedCount: 0,
    firstOrderOnly: false,
    isActive: true,
    startsAt: null,
    endsAt: null,
    ...patch,
  };
}

describe("evaluateVoucher", () => {
  it("membatasi diskon persen", () => {
    const result = evaluateVoucher(rule(), { now, subtotal: 400_000, shipping: 10_000, isFirstOrder: true });
    expect(result).toEqual({ ok: true, amount: 30_000 });
  });

  it("menolak minimum belanja", () => {
    const result = evaluateVoucher(rule(), { now, subtotal: 100_000, shipping: 10_000, isFirstOrder: true });
    expect(result.ok).toBe(false);
  });

  it("voucher ongkir tidak melebihi ongkir", () => {
    const result = evaluateVoucher(rule({ type: "shipping", value: 20_000, minSpend: 0 }), {
      now,
      subtotal: 50_000,
      shipping: 9_000,
      isFirstOrder: true,
    });
    expect(result).toEqual({ ok: true, amount: 9_000 });
  });

  it("menolak pesanan pertama yang sudah pernah pesan", () => {
    const result = evaluateVoucher(rule({ type: "fixed", value: 25_000, minSpend: 0, firstOrderOnly: true }), {
      now,
      subtotal: 200_000,
      shipping: 10_000,
      isFirstOrder: false,
    });
    expect(result.ok).toBe(false);
  });
});
