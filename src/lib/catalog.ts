import { z } from "zod";
import { materialTypes, type MaterialType } from "@/data/materials";

export const catalogSorts = ["terbaru", "termurah", "termahal", "terlaris"] as const;
export type CatalogSort = (typeof catalogSorts)[number];

export type CatalogQuery = {
  category?: string;
  size?: string;
  color?: string;
  material?: MaterialType;
  minPrice?: number;
  maxPrice?: number;
  sort: CatalogSort;
  q?: string;
  page: number;
};

function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

const looseText = z.string().trim().min(1).max(80).optional().catch(undefined);
const looseMoney = z.coerce.number().int().min(0).max(20_000_000).optional().catch(undefined);

export function parseCatalogQuery(raw: Record<string, string | string[] | undefined>): CatalogQuery {
  const materialRaw = one(raw.bahan);
  const material = materialRaw && (materialTypes as readonly string[]).includes(materialRaw)
    ? (materialRaw as MaterialType)
    : undefined;
  const sortRaw = one(raw.urut);
  const sort = sortRaw && (catalogSorts as readonly string[]).includes(sortRaw) ? (sortRaw as CatalogSort) : "terbaru";
  const pageRaw = Number(one(raw.halaman) ?? "1");
  return {
    category: looseText.parse(one(raw.kategori)),
    size: looseText.parse(one(raw.ukuran)),
    color: looseText.parse(one(raw.warna)),
    material,
    minPrice: looseMoney.parse(one(raw.harga_min)),
    maxPrice: looseMoney.parse(one(raw.harga_max)),
    sort,
    q: looseText.parse(one(raw.q)),
    page: Number.isFinite(pageRaw) ? Math.min(Math.max(1, Math.floor(pageRaw)), 500) : 1,
  };
}

export function catalogHref(current: CatalogQuery, patch: Partial<CatalogQuery> & { page?: number }): string {
  const next: CatalogQuery = { ...current, ...patch };
  if (patch.page == null && (patch.category !== undefined || patch.size !== undefined || patch.color !== undefined || patch.material !== undefined || patch.q !== undefined || patch.minPrice !== undefined || patch.maxPrice !== undefined || patch.sort !== undefined)) {
    next.page = 1;
  }
  const params = new URLSearchParams();
  if (next.category) params.set("kategori", next.category);
  if (next.size) params.set("ukuran", next.size);
  if (next.color) params.set("warna", next.color);
  if (next.material) params.set("bahan", next.material);
  if (next.minPrice != null) params.set("harga_min", String(next.minPrice));
  if (next.maxPrice != null) params.set("harga_max", String(next.maxPrice));
  if (next.sort !== "terbaru") params.set("urut", next.sort);
  if (next.q) params.set("q", next.q);
  if (next.page > 1) params.set("halaman", String(next.page));
  const query = params.toString();
  return query ? `/katalog?${query}` : "/katalog";
}
