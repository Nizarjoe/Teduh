import { describe, expect, it } from "vitest";
import { regions, resolveRegion } from "@/data/regions";

describe("wilayah", () => {
  it("memuat 38 provinsi dengan kode pos lima digit", () => {
    expect(regions).toHaveLength(38);
    const ids = new Set<string>();
    for (const province of regions) {
      expect(ids.has(province.id)).toBe(false);
      ids.add(province.id);
      expect(province.cities.length).toBeGreaterThan(0);
      for (const city of province.cities) {
        expect(city.districts.length).toBeGreaterThan(0);
        for (const district of city.districts) {
          expect(district.postalCode).toMatch(/^\d{5}$/);
          expect(ids.has(district.id)).toBe(false);
          ids.add(district.id);
        }
      }
    }
  });

  it("menemukan Cilandak", () => {
    const found = resolveRegion("jkt", "jaksel", "jaksel-cilandak");
    expect(found?.district.postalCode).toBe("12430");
    expect(found?.city.zone).toBe("jabodetabek");
  });
});
