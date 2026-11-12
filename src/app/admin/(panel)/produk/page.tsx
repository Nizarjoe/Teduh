import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { buttonPrimary } from "@/components/styles";
import { getDb } from "@/db/client";
import { categories, productVariants, products } from "@/db/schema";
import { formatIDR } from "@/lib/money";

export default async function AdminProductsPage() {
  const rows = await getDb()
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      isActive: products.isActive,
      category: categories.name,
      price: productVariants.price,
      stock: productVariants.stock,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .orderBy(asc(products.name));

  const grouped = new Map<string, { id: string; name: string; slug: string; isActive: boolean; category: string; price: number | null; stock: number }>();
  for (const row of rows) {
    const current = grouped.get(row.id);
    if (!current) {
      grouped.set(row.id, { id: row.id, name: row.name, slug: row.slug, isActive: row.isActive, category: row.category, price: row.price, stock: row.stock ?? 0 });
    } else {
      current.stock += row.stock ?? 0;
      if (row.price != null && (current.price == null || row.price < current.price)) current.price = row.price;
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-4xl">Produk</h1>
        <Link href="/admin/produk/baru" className={buttonPrimary}>Produk baru</Link>
      </div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {[...grouped.values()].map((product) => (
          <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <Link href={`/admin/produk/${product.id}`} className="font-medium hover:text-rain">{product.name}</Link>
              <p className="text-ink-soft">{product.category} · {product.isActive ? "Tayang" : "Disembunyikan"} · stok {product.stock}</p>
            </div>
            <span className="tabular-nums">{product.price == null ? "—" : formatIDR(product.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
