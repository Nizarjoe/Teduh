import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { ProductForm, type ProductDraft } from "@/components/admin/product-form";
import { productForEdit } from "@/lib/admin";
import { getDb } from "@/db/client";
import { categories } from "@/db/schema";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categoryRows] = await Promise.all([
    productForEdit(id),
    getDb().select().from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  if (!product) notFound();
  const initial: ProductDraft = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    description: product.description,
    materialType: product.materialType,
    materialNote: product.materialNote,
    waterproofNote: product.waterproofNote,
    careNote: product.careNote,
    sizeChart: product.sizeChart,
    weightGrams: String(product.weightGrams),
    isActive: product.isActive,
    isBestSeller: product.isBestSeller,
    images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      price: String(variant.price),
      compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : "",
      stock: String(variant.stock),
      weightGrams: String(variant.weightGrams),
      isActive: variant.isActive,
    })),
  };
  return (
    <div>
      <h1 className="font-serif text-4xl">{product.name}</h1>
      <ProductForm initial={initial} categories={categoryRows.map((row) => ({ id: row.id, name: row.name }))} />
    </div>
  );
}
