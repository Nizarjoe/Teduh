import { describe, expect, it } from "vitest";
import { quoteLocal } from "@/lib/shipping-quote";

describe("quoteLocal", () => {
  it("ongkir ke timur lebih mahal daripada Jabodetabek", () => {
    const near = quoteLocal({ zone: "jabodetabek", weightGrams: 500 });
    const far = quoteLocal({ zone: "timur", weightGrams: 500 });
    const cheapest = (rows: { cost: number }[]) => Math.min(...rows.map((row) => row.cost));
    expect(cheapest(near)).toBeLessThan(cheapest(far));
    expect(near.some((row) => row.serviceCode === "YES")).toBe(true);
    expect(far.some((row) => row.serviceCode === "YES")).toBe(false);
  });
});
