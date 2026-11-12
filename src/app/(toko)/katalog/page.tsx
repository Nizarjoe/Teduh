import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { buttonSecondary } from "@/components/styles";
import { materialLabel } from "@/data/materials";
import { catalogFacets, listCatalog, PAGE_SIZE } from "@/db/queries";
import { catalogHref, parseCatalogQuery } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Katalog",
  description: "Setelan, ponco, jas hujan ojol, ukuran anak, cover sepatu, dan cover tas.",
  alternates: { canonical: "/katalog" },
};

const priceBands = [
  { label: "Di bawah Rp100rb", min: undefined, max: 99_999 },
  { label: "Rp100–150rb", min: 100_000, max: 150_000 },
  { label: "Rp150–200rb", min: 150_000, max: 200_000 },
  { label: "Di atas Rp200rb", min: 200_001, max: undefined },
];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCatalogQuery(await searchParams);
  const [result, facets] = await Promise.all([listCatalog(query), catalogFacets()]);
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const active = Boolean(query.category || query.size || query.color || query.material || query.q || query.minPrice != null || query.maxPrice != null);
  return (
    <div>
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-rain">Katalog</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Pilih jas hujannya.</h1>
        <p className="mt-4 text-ink-soft">Harga coret adalah pembanding yang kami catat, biasanya etalase marketplace.</p>
      </header>
      <form className="mt-6 flex gap-2" action="/katalog">
        <label className="sr-only" htmlFor="cari">Cari</label>
        <input id="cari" name="q" defaultValue={query.q ?? ""} placeholder="Cari setelan, ponco, ojol" className="w-full border border-line bg-surface px-3 py-3 text-base" />
        {query.category ? <input type="hidden" name="kategori" value={query.category} /> : null}
        <button className="border border-ink px-4 text-sm" type="submit">Cari</button>
      </form>
      <nav aria-label="Kategori" className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <Link href={catalogHref(query, { category: undefined })} className={`shrink-0 border px-3 py-2 text-sm ${query.category ? "border-line" : "border-ink bg-ink text-paper"}`}>Semua</Link>
        {facets.categories.map((category) => (
          <Link key={category.slug} href={catalogHref(query, { category: category.slug })} className={`shrink-0 border px-3 py-2 text-sm ${query.category === category.slug ? "border-ink bg-ink text-paper" : "border-line"}`}>
            {category.name}
          </Link>
        ))}
      </nav>
      <details className="mt-4 border border-line p-4">
        <summary className="cursor-pointer text-sm font-medium">Filter dan urutan</summary>
        <form className="mt-4 grid gap-4 md:grid-cols-4" action="/katalog">
          {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
          {query.category ? <input type="hidden" name="kategori" value={query.category} /> : null}
          <label className="text-sm">Ukuran
            <select name="ukuran" defaultValue={query.size ?? ""} className="mt-1 w-full border border-line bg-surface px-3 py-3">
              <option value="">Semua</option>
              {facets.sizes.map((size) => <option key={size}>{size}</option>)}
            </select>
          </label>
          <label className="text-sm">Warna
            <select name="warna" defaultValue={query.color ?? ""} className="mt-1 w-full border border-line bg-surface px-3 py-3">
              <option value="">Semua</option>
              {facets.colors.map((color) => <option key={color}>{color}</option>)}
            </select>
          </label>
          <label className="text-sm">Bahan
            <select name="bahan" defaultValue={query.material ?? ""} className="mt-1 w-full border border-line bg-surface px-3 py-3">
              <option value="">Semua</option>
              {facets.materials.map((material) => <option key={material} value={material}>{materialLabel[material]}</option>)}
            </select>
          </label>
          <label className="text-sm">Urutan
            <select name="urut" defaultValue={query.sort} className="mt-1 w-full border border-line bg-surface px-3 py-3">
              <option value="terbaru">Terbaru</option>
              <option value="terlaris">Paling dipesan</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
            </select>
          </label>
          <label className="text-sm">Harga minimum
            <input name="harga_min" inputMode="numeric" defaultValue={query.minPrice ?? ""} className="mt-1 w-full border border-line bg-surface px-3 py-3" />
          </label>
          <label className="text-sm">Harga maksimum
            <input name="harga_max" inputMode="numeric" defaultValue={query.maxPrice ?? ""} className="mt-1 w-full border border-line bg-surface px-3 py-3" />
          </label>
          <div className="flex items-end">
            <button className={buttonSecondary} type="submit">Terapkan</button>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {priceBands.map((band) => (
            <Link key={band.label} href={catalogHref(query, { minPrice: band.min, maxPrice: band.max })} className="border border-line px-3 py-2 text-sm">
              {band.label}
            </Link>
          ))}
        </div>
      </details>
      <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
        <p>{result.total} produk</p>
        {active ? <Link href="/katalog" className="underline underline-offset-4">Reset filter</Link> : null}
      </div>
      {result.items.length === 0 ? (
        <p className="mt-10">Tidak ada produk untuk filter ini.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {result.items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
      {pages > 1 ? (
        <nav aria-label="Halaman" className="mt-10 flex gap-3 text-sm">
          {query.page > 1 ? <Link href={catalogHref(query, { page: query.page - 1 })}>Sebelumnya</Link> : null}
          <span>Halaman {query.page} dari {pages}</span>
          {query.page < pages ? <Link href={catalogHref(query, { page: query.page + 1 })}>Berikutnya</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
