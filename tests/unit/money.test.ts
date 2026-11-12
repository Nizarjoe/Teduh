import { describe, expect, it } from "vitest";
import { formatIDR } from "@/lib/money";

describe("formatIDR", () => {
  it("menulis rupiah tanpa desimal", () => {
    expect(formatIDR(189000)).toBe("Rp 189.000");
  });
});
