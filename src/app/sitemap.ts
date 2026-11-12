import type { MetadataRoute } from "next";
import { listProductSlugs } from "@/db/queries";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getEnv().APP_URL.replace(/\/$/, "");
  const products = await listProductSlugs();
  const staticPaths = ["", "/katalog", "/panduan-ukuran", "/tentang", "/syarat-ketentuan", "/kebijakan-privasi", "/kebijakan-retur"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path || "/"}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 })),
    ...products.map((product) => ({ url: `${base}/produk/${product.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
