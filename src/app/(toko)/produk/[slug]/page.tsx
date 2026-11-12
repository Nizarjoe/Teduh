import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { ReviewForm } from "@/components/review-form";
import { materialLabel, isMaterialType } from "@/data/materials";
import { isSizeChartKey, sizeCharts } from "@/data/size-charts";
import { getProductPage } from "@/db/queries";
import { formatDate } from "@/lib/dates";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductPage(slug);
  if (!data) return { title: "Produk tidak ditemukan" };
  const image = data.product.images[0];
  return {
    title: data.product.name,
    description: data.product.description.slice(0, 160),
    alternates: { canonical: `/produk/${data.product.slug}` },
    openGraph: {
      title: data.product.name,
      description: data.product.description.slice(0, 160),
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductPage(slug);
  if (!data) notFound();
  const { product, variants, related } = data;
  const chart = isSizeChartKey(product.sizeChart) ? sizeCharts[product.sizeChart] : null;
  const material = isMaterialType(product.materialType) ? materialLabel[product.materialType] : product.materialType;
  const prices = variants.map((variant) => variant.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const inStock = variants.some((variant) => variant.available > 0);
  const buyerReviews = product.reviews.filter((review) => !review.seedKey);
  const sampleReviewCount = product.reviews.length - buyerReviews.length;
  const ratingCount = buyerReviews.length;
  const ratingAvg = ratingCount ? buyerReviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => new URL(image.url, getEnv().APP_URL).toString()),
    brand: { "@type": "Brand", name: "Teduh" },
    sku: variants[0]?.sku,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: low,
      highPrice: high,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${getEnv().APP_URL}/produk/${product.slug}`,
    },
    ...(ratingAvg != null
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: ratingAvg.toFixed(1), reviewCount: ratingCount } }
      : {}),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Jejak" className="text-sm text-ink-soft">
        <Link href="/" className="hover:text-ink">Beranda</Link>
        <span> / </span>
        <Link href="/katalog" className="hover:text-ink">Katalog</Link>
        <span> / </span>
        <Link href={`/katalog?kategori=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
      </nav>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} />
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-rain">{product.category.name}</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-6">
            <PurchasePanel
              productName={product.name}
              productSlug={product.slug}
              image={product.images[0]?.url ?? ""}
              variants={variants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                colorHex: variant.colorHex,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice,
                available: variant.available,
                weightGrams: variant.weightGrams,
              }))}
            />
          </div>
        </div>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="font-serif text-2xl">Detail</h2>
          <div className="mt-4 space-y-4 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</div>
        </section>
        <section className="space-y-4 text-sm leading-relaxed">
          <p><span className="font-medium text-ink">Bahan. </span>{material}. {product.materialNote}</p>
          <p><span className="font-medium text-ink">Tahan air. </span>{product.waterproofNote}</p>
          <p><span className="font-medium text-ink">Perawatan. </span>{product.careNote}</p>
        </section>
      </div>
      {chart ? (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">{chart.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{chart.note}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {chart.columns.map((column) => <th key={column} className="py-2 font-medium">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-line">
                    {row.map((cell) => <td key={cell} className="py-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <section className="mt-14">
        <h2 className="font-serif text-2xl">Ulasan</h2>
        {ratingAvg != null ? <p className="mt-2 text-sm text-ink-soft">{ratingAvg.toFixed(1).replace(".", ",")} dari 5 · {ratingCount} ulasan pembeli</p> : null}
        {sampleReviewCount > 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Ada {sampleReviewCount} ulasan bertanda data contoh. Itu isi seed, bukan pembeli.</p>
        ) : null}
        <ul className="mt-6 space-y-6">
          {product.reviews.map((review) => (
            <li key={review.id} className="border-t border-line pt-4">
              <p className="text-sm text-ink-soft">
                {review.seedKey ? <span className="mr-2 bg-sand px-1.5 py-0.5 text-ink">Data contoh</span> : null}
                {review.rating}/5 · {review.authorName}{review.city ? `, ${review.city}` : ""} · {formatDate(review.createdAt)}
              </p>
              <p className="mt-2 leading-relaxed">{review.body}</p>
              {review.photos.length > 0 ? (
                <div className="mt-3 flex gap-2">
                  {review.photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={photo} src={photo} alt="Foto pembeli, masih gambar sementara" className="h-24 w-20 object-cover" />
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        <ReviewForm productId={product.id} />
      </section>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-serif text-2xl">Lainnya di {product.category.name.toLowerCase()}</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      ) : null}
    </article>
  );
}
