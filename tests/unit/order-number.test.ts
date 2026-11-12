import { describe, expect, it } from "vitest";
import { makeOrderNumber } from "@/lib/order-number";

describe("makeOrderNumber", () => {
  it("memakai tanggal Jakarta", () => {
    const value = makeOrderNumber(new Date("2026-11-12T02:30:00.000Z"));
    expect(value).toMatch(/^TDH261112[A-Z2-9]{5}$/);
  });
});
