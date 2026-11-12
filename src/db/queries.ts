import { and, asc, desc, eq, gte, ilike, isNotNull, lte, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  categories,
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
  reviews,
} from "@/db/schema";
import { materialLabel, type MaterialType } from "@/data/materials";
import { availableQty } from "@/lib/inventory";
import { jakartaDayKey, lastJakartaDays } from "@/lib/dates";
import type { CatalogQuery } from "@/lib/catalog";
import { isOrderStatus, type OrderStatus } from "@/lib/order-status";

const PAGE_SIZE = 12;

const sizeRank = ["S", "M", "L", "XL", "XXL", "Regular", "Long", "4-6", "7-9", "10-12", "32-38", "39-44", "Standar"];

export type CatalogCard = {
  id: string;
  slug: string;
  name: string;
  materialType: string;
  materialLabel: string;
  isBestSeller: boolean;
  categoryName: string;
  categorySlug: string;
  minPrice: number;
  compareAt: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function listCatalog(query: CatalogQuery, pageSize = PAGE_SIZE): Promise<{
  items: CatalogCard[];
  total: number;
  pageSize: number;
}> {
  const db = getDb();
  const filters = [eq(products.isActive, true), eq(productVariants.isActive, true)];
  if (query.category) filters.push(eq(categories.slug, query.category));
  if (query.size) filters.push(eq(productVariants.size, query.size));
  if (query.color) filters.push(eq(productVariants.color, query.color));
  if (query.material) filters.push(eq(products.materialType, query.material));
  if (query.minPrice != null) filters.push(gte(productVariants.price, query.minPrice));
  if (query.maxPrice != null) filters.push(lte(productVariants.price, query.maxPrice));
  if (query.q) filters.push(ilike(products.name, `%${escapeLike(query.q)}%`));
  const where = and(...filters);

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      materialType: products.materialType,
      isBestSeller: products.isBestSeller,
      categoryName: categories.name,
      categorySlug: categories.slug,
      minPrice: sql<number>`min(${productVariants.price})::int`,
      compareAt: sql<number | null>`min(${productVariants.compareAtPrice})::int`,
      imageUrl: sql<string | null>`(
        select ${productImages.url} from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.sortOrder} asc
        limit 1
      )`,
      imageAlt: sql<string | null>`(
        select ${productImages.alt} from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.sortOrder} asc
        limit 1
      )`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .where(where)
    .groupBy(products.id, categories.id)
    .orderBy(
      ...(query.sort === "termurah"
        ? [asc(sql`min(${productVariants.price})`)]
        : query.sort === "termahal"
          ? [desc(sql`min(${productVariants.price})`)]
          : query.sort === "terlaris"
            ? [desc(products.isBestSeller), desc(products.createdAt)]
            : [desc(products.createdAt)]),
    );

  const total = rows.length;
  const start = (query.page - 1) * pageSize;
  const items = rows.slice(start, start + pageSize).map((row) => ({
    ...row,
    minPrice: Number(row.minPrice),
    compareAt: row.compareAt == null ? null : Number(row.compareAt),
    materialLabel: materialLabel[row.materialType as MaterialType] ?? row.materialType,
  }));
  return { items, total, pageSize };
}

export async function catalogFacets(): Promise<{
  categories: { slug: string; name: string }[];
  sizes: string[];
  colors: string[];
  materials: MaterialType[];
}> {
  const db = getDb();
  const categoryRows = await db.select({ slug: categories.slug, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder));
  const sizeRows = await db
    .selectDistinct({ size: productVariants.size })
    .from(productVariants)
    .where(eq(productVariants.isActive, true));
  const colorRows = await db
    .selectDistinct({ color: productVariants.color })
    .from(productVariants)
    .where(eq(productVariants.isActive, true));
  const materialRows = await db
    .selectDistinct({ materialType: products.materialType })
    .from(products)
    .where(eq(products.isActive, true));
  return {
    categories: categoryRows,
    sizes: sizeRows
      .map((row) => row.size)
      .sort((a, b) => sizeRank.indexOf(a) - sizeRank.indexOf(b) || a.localeCompare(b, "id")),
    colors: colorRows.map((row) => row.color).sort((a, b) => a.localeCompare(b, "id")),
    materials: materialRows.map((row) => row.materialType).filter((value): value is MaterialType => value in materialLabel),
  };
}

export async function getProductPage(slug: string) {
  const db = getDb();
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: {
      category: true,
      images: { orderBy: (image, { asc: ascImage }) => [ascImage(image.sortOrder)] },
      variants: { where: eq(productVariants.isActive, true) },
      reviews: {
        where: eq(reviews.status, "approved"),
        orderBy: (review, { desc: descReview }) => [descReview(review.createdAt)],
      },
    },
  });
  if (!product) return null;
  const variants = [];
  for (const variant of product.variants) {
    variants.push({ ...variant, available: await availableQty(db, variant.id) });
  }
  variants.sort((a, b) => sizeRank.indexOf(a.size) - sizeRank.indexOf(b.size) || a.color.localeCompare(b.color, "id"));
  const related = await listCatalog(
    { category: product.category.slug, sort: "terlaris", page: 1 },
    8,
  );
  return {
    product,
    variants,
    related: related.items.filter((item) => item.id !== product.id).slice(0, 4),
  };
}

export async function homeData() {
  const db = getDb();
  const categoryRows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const withImages = [];
  for (const category of categoryRows) {
    const image = await db
      .select({ url: productImages.url, alt: productImages.alt })
      .from(productImages)
      .innerJoin(products, eq(products.id, productImages.productId))
      .where(and(eq(products.categoryId, category.id), eq(products.isActive, true)))
      .orderBy(desc(products.isBestSeller), asc(productImages.sortOrder))
      .limit(1);
    withImages.push({ ...category, image: image[0] ?? null });
  }
  const best = await listCatalog({ sort: "terlaris", page: 1 }, 4);
  const stats = await db
    .select({
      count: sql<number>`count(*)::int`,
      average: sql<number | null>`round(avg(${reviews.rating})::numeric, 1)`,
      sampleCount: sql<number>`count(*) filter (where ${reviews.seedKey} is not null)::int`,
    })
    .from(reviews)
    .where(eq(reviews.status, "approved"));
  const quotes = await db
    .select({
      id: reviews.id,
      authorName: reviews.authorName,
      city: reviews.city,
      rating: reviews.rating,
      body: reviews.body,
      productName: products.name,
      sample: sql<boolean>`${reviews.seedKey} is not null`,
    })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(2);
  const stat = stats[0];
  return {
    categories: withImages,
    best: best.items.slice(0, 4),
    reviewCount: Number(stat?.count ?? 0),
    reviewAverage: stat?.average == null ? null : Number(stat.average),
    sampleReviewCount: Number(stat?.sampleCount ?? 0),
    quotes,
  };
}

export async function listProductSlugs(): Promise<{ slug: string }[]> {
  return getDb().select({ slug: products.slug }).from(products).where(eq(products.isActive, true));
}

export async function getOrderByNumber(orderNumber: string) {
  const db = getDb();
  const row = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: { items: true },
  });
  return row ?? null;
}

export async function adminSummary() {
  const db = getDb();
  const days = lastJakartaDays(7);
  const sales = await db.execute(sql`
    select to_char((paid_at at time zone 'Asia/Jakarta')::date, 'YYYY-MM-DD') as day,
           coalesce(sum(total), 0)::int as total,
           count(*)::int as orders
    from orders
    where paid_at is not null
      and status in ('paid', 'processing', 'shipped', 'delivered')
      and (paid_at at time zone 'Asia/Jakarta')::date >= (now() at time zone 'Asia/Jakarta')::date - 6
    group by 1
  `);
  const byDay = new Map<string, { total: number; orders: number }>();
  for (const row of sales.rows as { day: string; total: number; orders: number }[]) {
    byDay.set(row.day, { total: Number(row.total), orders: Number(row.orders) });
  }
  const series = days.map((day) => ({
    day,
    label: day.slice(8),
    total: byDay.get(day)?.total ?? 0,
    orders: byDay.get(day)?.orders ?? 0,
  }));
  const counts = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);
  const lowStock = await db
    .select({
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      stock: productVariants.stock,
      productName: products.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(eq(productVariants.isActive, true), eq(products.isActive, true), lte(productVariants.stock, 5)))
    .orderBy(asc(productVariants.stock))
    .limit(8);
  const todayKey = jakartaDayKey(new Date());
  const today = series.find((item) => item.day === todayKey);
  const pendingReviews = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(eq(reviews.status, "pending"));
  const sampleReviews = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(isNotNull(reviews.seedKey));
  return {
    series,
    max: Math.max(1, ...series.map((item) => item.total)),
    todayTotal: today?.total ?? 0,
    todayOrders: today?.orders ?? 0,
    statusCounts: counts.flatMap((row) => (isOrderStatus(row.status) ? [{ status: row.status as OrderStatus, count: Number(row.count) }] : [])),
    lowStock,
    pendingReviews: Number(pendingReviews[0]?.count ?? 0),
    sampleReviews: Number(sampleReviews[0]?.count ?? 0),
  };
}

export async function adminOrders(status?: string) {
  const db = getDb();
  const where = status && isOrderStatus(status) ? eq(orders.status, status) : undefined;
  return db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(100);
}

export async function adminOrder(id: string) {
  const rows = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export { PAGE_SIZE };
