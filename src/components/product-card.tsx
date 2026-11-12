import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { Price } from "@/components/price";
import type { CatalogCard } from "@/db/queries";

export function ProductCard({ product }: { product: CatalogCard }) {
  return (
    <article>
      <Link href={`/produk/${product.slug}`} className="group block">
        <div className="aspect-[4/5] overflow-hidden bg-mist">
          {product.imageUrl ? (
            <ProductImage
              src={product.imageUrl}
              alt=""
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : null}
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink-soft">{product.categoryName}</p>
        <h3 className="mt-1 font-serif text-xl leading-tight text-ink group-hover:text-rain">{product.name}</h3>
        <div className="mt-2">
          <Price amount={product.minPrice} compare={product.compareAt} />
        </div>
      </Link>
    </article>
  );
}
