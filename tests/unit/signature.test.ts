import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildChargeItems, chargeTotal } from "@/lib/midtrans-charge";
import { midtransSignature } from "@/lib/midtrans-sign";
import { safeEqual } from "@/lib/secret";

describe("midtrans", () => {
  it("tanda tangan mengikuti urutan Midtrans", () => {
    const expected = createHash("sha512").update("TDH1" + "200" + "150000.00" + "server").digest("hex");
    expect(
      midtransSignature({ orderId: "TDH1", statusCode: "200", grossAmount: "150000.00", serverKey: "server" }),
    ).toBe(expected);
  });

  it("perbandingan aman menolak panjang berbeda", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("abc", "abc")).toBe(true);
  });

  it("rincian tagihan seimbang", () => {
    const items = buildChargeItems({
      lines: [{ sku: "DERAS-L-HITAM", name: "Setelan Deras L/Hitam", price: 189_000, qty: 1 }],
      shippingCost: 11_000,
      shippingName: "Ongkir JNE",
      discount: 25_000,
    });
    expect(chargeTotal(items)).toBe(175_000);
  });
});
