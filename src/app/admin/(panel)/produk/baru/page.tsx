import { asc } from "drizzle-orm";
import { ProductForm, type ProductDraft } from "@/components/admin/product-form";
import { getDb } from "@/db/client";
import { categories } from "@/db/schema";

export default async function NewProductPage() {
  const rows = await getDb().select().from(categories).orderBy(asc(categories.sortOrder));
  const first = rows[0];
  const initial: ProductDraft = {
    name: "",
    slug: "",
    categoryId: first?.id ?? "",
    description: "",
    materialType: "pvc",
    materialNote: "",
    waterproofNote: "",
    careNote: "",
    sizeChart: "dewasa",
    weightGrams: "400",
    isActive: true,
    isBestSeller: false,
    images: [],
    variants: [{ sku: "", size: "M", color: "Hitam", colorHex: "#1C1C1C", price: "", compareAtPrice: "", stock: "0", weightGrams: "400", isActive: true }],
  };
  return (
    <div>
      <h1 className="font-serif text-4xl">Produk baru</h1>
      <ProductForm initial={initial} categories={rows.map((row) => ({ id: row.id, name: row.name }))} />
    </div>
  );
}
