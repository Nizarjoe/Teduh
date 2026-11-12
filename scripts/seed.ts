import { config } from "dotenv";

config();

async function main(): Promise<void> {
const { and, eq, notInArray } = await import("drizzle-orm");
const { getDb } = await import("../src/db/client");
const schema = await import("../src/db/schema");
const { seedCategories, seedProducts, seedReviews, seedVouchers } = await import("../src/data/catalog-seed");
const { hashPassword } = await import("../src/lib/password");

const db = getDb();
const password = process.env.SEED_ADMIN_PASSWORD || "teduh-admin";
const email = (process.env.SEED_ADMIN_EMAIL || "admin@teduh.id").toLowerCase();

if (process.env.NODE_ENV === "production" && password === "teduh-admin") {
  throw new Error("Ganti SEED_ADMIN_PASSWORD sebelum seed di produksi.");
}

const passwordHash = await hashPassword(password);
const existingAdmin = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
const admin = existingAdmin[0];
const resetAdmin = process.env.NODE_ENV !== "production" || process.env.SEED_RESET_ADMIN === "true";
if (!admin) {
  await db.insert(schema.users).values({ email, name: "Admin Teduh", passwordHash, role: "admin" });
} else if (resetAdmin) {
  await db.update(schema.users).set({ passwordHash, name: "Admin Teduh" }).where(eq(schema.users.id, admin.id));
}

for (const category of seedCategories) {
  await db
    .insert(schema.categories)
    .values(category)
    .onConflictDoUpdate({
      target: schema.categories.slug,
      set: { name: category.name, description: category.description, sortOrder: category.sortOrder },
    });
}

const categoryRows = await db.select().from(schema.categories);
const categoryId = new Map(categoryRows.map((row) => [row.slug, row.id]));

for (const product of seedProducts) {
  const cat = categoryId.get(product.categorySlug);
  if (!cat) throw new Error(`Kategori ${product.categorySlug} tidak ada`);
  const saved = await db
    .insert(schema.products)
    .values({
      categoryId: cat,
      slug: product.slug,
      name: product.name,
      description: product.description,
      materialType: product.materialType,
      materialNote: product.materialNote,
      waterproofNote: product.waterproofNote,
      careNote: product.careNote,
      sizeChart: product.sizeChart,
      weightGrams: product.weightGrams,
      isActive: true,
      isBestSeller: product.isBestSeller,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.products.slug,
      set: {
        categoryId: cat,
        name: product.name,
        description: product.description,
        materialType: product.materialType,
        materialNote: product.materialNote,
        waterproofNote: product.waterproofNote,
        careNote: product.careNote,
        sizeChart: product.sizeChart,
        weightGrams: product.weightGrams,
        isActive: true,
        isBestSeller: product.isBestSeller,
        updatedAt: new Date(),
      },
    })
    .returning();
  const row = saved[0];
  if (!row) throw new Error(`Produk ${product.slug} gagal disimpan`);

  await db.delete(schema.productImages).where(eq(schema.productImages.productId, row.id));
  await db.insert(schema.productImages).values(
    product.images.map((image, index) => ({
      productId: row.id,
      url: `/products/${image.file}`,
      alt: image.alt,
      sortOrder: index,
    })),
  );

  const skus = product.variants.map((variant) => variant.sku);
  await db
    .update(schema.productVariants)
    .set({ isActive: false })
    .where(and(eq(schema.productVariants.productId, row.id), notInArray(schema.productVariants.sku, skus)));

  for (const variant of product.variants) {
    await db
      .insert(schema.productVariants)
      .values({
        productId: row.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stock: variant.stock,
        weightGrams: variant.weightGrams,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.productVariants.sku,
        set: {
          productId: row.id,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          stock: variant.stock,
          weightGrams: variant.weightGrams,
          isActive: true,
        },
      });
  }
}

for (const voucher of seedVouchers) {
  await db
    .insert(schema.vouchers)
    .values({ ...voucher, isActive: true })
    .onConflictDoUpdate({
      target: schema.vouchers.code,
      set: {
        type: voucher.type,
        value: voucher.value,
        minSpend: voucher.minSpend,
        maxDiscount: voucher.maxDiscount,
        usageLimit: voucher.usageLimit,
        firstOrderOnly: voucher.firstOrderOnly,
        isActive: true,
      },
    });
}

const productRows = await db.select().from(schema.products);
const productBySlug = new Map(productRows.map((row) => [row.slug, row]));
for (const review of seedReviews) {
  const product = productBySlug.get(review.productSlug);
  if (!product) continue;
  const image = product.slug ? `/products/${review.productSlug}-detail.svg` : null;
  const values = {
    productId: product.id,
    authorName: review.authorName,
    city: review.city,
    rating: review.rating,
    body: review.body,
    photos: review.photo && image ? [image] : [],
    status: "approved" as const,
    seedKey: review.seedKey,
    createdAt: new Date(Date.now() - review.daysAgo * 86_400_000),
  };
  await db.insert(schema.reviews).values(values).onConflictDoUpdate({
    target: schema.reviews.seedKey,
    set: {
      authorName: values.authorName,
      city: values.city,
      rating: values.rating,
      body: values.body,
      photos: values.photos,
      status: "approved",
    },
  });
}

const variantRows = await db.select().from(schema.productVariants);
const bySku = new Map(variantRows.map((row) => [row.sku, row]));
const deras = bySku.get("DERAS-L-PINUS");
const shift = bySku.get("SHIFT-L-KUNING");
const komuter = bySku.get("KOMUTER-M-HITAM");

const samples = [
  deras
    ? {
        orderNumber: "TDH261105DEM1",
        status: "shipped" as const,
        name: "Budi Santoso",
        phone: "628111222333",
        variant: deras,
        shipping: 11_000,
        resi: "CONTOHRESI001",
        courier: "JNE",
        service: "Reguler",
        daysAgo: 7,
        note: "Data contoh dari seed, bukan pesanan pembeli.",
      }
    : null,
  shift
    ? {
        orderNumber: "TDH261110DEM2",
        status: "processing" as const,
        name: "Maya Kusuma",
        phone: "628122223334",
        variant: shift,
        shipping: 12_000,
        resi: null,
        courier: "SiCepat",
        service: "Reguler",
        daysAgo: 2,
        note: "Data contoh dari seed, bukan pesanan pembeli.",
      }
    : null,
  komuter
    ? {
        orderNumber: "TDH261112DEM3",
        status: "paid" as const,
        name: "Andi Wijaya",
        phone: "628133334445",
        variant: komuter,
        shipping: 11_000,
        resi: null,
        courier: "J&T",
        service: "EZ",
        daysAgo: 0,
        note: "Data contoh dari seed, bukan pesanan pembeli.",
      }
    : null,
].filter((row) => row !== null);

for (const sample of samples) {
  const subtotal = sample.variant.price;
  const total = subtotal + sample.shipping;
  const createdAt = new Date(Date.now() - sample.daysAgo * 86_400_000);
  const paidAt = new Date(createdAt.getTime() + 15 * 60_000);
  const existing = await db.select().from(schema.orders).where(eq(schema.orders.orderNumber, sample.orderNumber)).limit(1);
  const current = existing[0];
  if (!current) {
    const inserted = await db
      .insert(schema.orders)
      .values({
        orderNumber: sample.orderNumber,
        status: sample.status,
        customerName: sample.name,
        phone: sample.phone,
        addressLine: "Jl. Contoh Dalam No. 12",
        provinceName: "DKI Jakarta",
        cityName: "Jakarta Selatan",
        districtName: "Cilandak",
        postalCode: "12430",
        internalNote: sample.note,
        courierCode: sample.courier.toLowerCase(),
        courierName: sample.courier,
        serviceCode: "REG",
        serviceName: sample.service,
        shippingCost: sample.shipping,
        shippingEtd: "1–2 hari",
        shippingSource: "perkiraan",
        subtotal,
        discount: 0,
        total,
        paymentType: "qris",
        paidAt,
        resi: sample.resi,
        shippedAt: sample.status === "shipped" ? paidAt : null,
        reservationExpiresAt: createdAt,
        createdAt,
        updatedAt: new Date(),
      })
      .returning();
    const order = inserted[0];
    if (!order) continue;
    const product = productRows.find((row) => row.id === sample.variant.productId);
    await db.insert(schema.orderItems).values({
      orderId: order.id,
      productId: sample.variant.productId,
      variantId: sample.variant.id,
      productName: product?.name ?? "Jas hujan",
      sku: sample.variant.sku,
      size: sample.variant.size,
      color: sample.variant.color,
      qty: 1,
      unitPrice: sample.variant.price,
      weightGrams: sample.variant.weightGrams,
    });
  } else if (sample.daysAgo === 0) {
    await db.update(schema.orders).set({ paidAt: new Date(), updatedAt: new Date() }).where(eq(schema.orders.id, current.id));
  }
}

console.log(`seed selesai. admin ${email}`);
}

void main();
