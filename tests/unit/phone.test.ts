import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/phone";

describe("normalizePhone", () => {
  it("menerima 08, 62, dan +62", () => {
    expect(normalizePhone("0812-0000-1111")).toBe("6281200001111");
    expect(normalizePhone("+62 812 0000 1111")).toBe("6281200001111");
    expect(normalizePhone("6281200001111")).toBe("6281200001111");
  });

  it("menolak nomor yang terlalu pendek", () => {
    expect(normalizePhone("0812")).toBeNull();
    expect(normalizePhone("abc")).toBeNull();
  });
});
