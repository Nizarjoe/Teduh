import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    materialType: text("material_type").notNull(),
    materialNote: text("material_note").notNull(),
    waterproofNote: text("waterproof_note").notNull(),
    careNote: text("care_note").notNull(),
    sizeChart: text("size_chart").notNull(),
    weightGrams: integer("weight_grams").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("products_category_idx").on(table.categoryId),
    index("products_active_idx").on(table.isActive),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [index("images_product_idx").on(table.productId, table.sortOrder)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    sku: text("sku").notNull().unique(),
    size: text("size").notNull(),
    color: text("color").notNull(),
    colorHex: text("color_hex").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    stock: integer("stock").notNull(),
    weightGrams: integer("weight_grams").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("variants_product_idx").on(table.productId),
    check("variants_price_check", sql`${table.price} > 0 and ${table.stock} >= 0`),
  ],
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const vouchers = pgTable("vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),
  value: integer("value").notNull(),
  minSpend: integer("min_spend").notNull().default(0),
  maxDiscount: integer("max_discount"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  firstOrderOnly: boolean("first_order_only").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    status: text("status").notNull().default("pending_payment"),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    addressLine: text("address_line").notNull(),
    provinceName: text("province_name").notNull(),
    cityName: text("city_name").notNull(),
    districtName: text("district_name").notNull(),
    postalCode: text("postal_code").notNull(),
    notes: text("notes"),
    internalNote: text("internal_note"),
    courierCode: text("courier_code").notNull(),
    courierName: text("courier_name").notNull(),
    serviceCode: text("service_code").notNull(),
    serviceName: text("service_name").notNull(),
    shippingCost: integer("shipping_cost").notNull(),
    shippingEtd: text("shipping_etd").notNull(),
    shippingSource: text("shipping_source").notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull(),
    total: integer("total").notNull(),
    voucherId: uuid("voucher_id").references(() => vouchers.id),
    voucherCode: text("voucher_code"),
    snapToken: text("snap_token"),
    payToken: text("pay_token"),
    paymentType: text("payment_type"),
    midtransTransactionId: text("midtrans_transaction_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    resi: text("resi"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    reservationExpiresAt: timestamp("reservation_expires_at", { withTimezone: true }).notNull(),
    needsAttention: boolean("needs_attention").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_phone_idx").on(table.phone),
    index("orders_status_idx").on(table.status),
    index("orders_created_idx").on(table.createdAt),
    index("orders_paid_idx").on(table.paidAt),
    check(
      "orders_status_check",
      sql`${table.status} in ('pending_payment','paid','processing','shipped','delivered','cancelled','expired','refunded')`,
    ),
  ],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  productName: text("product_name").notNull(),
  sku: text("sku").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  qty: integer("qty").notNull(),
  unitPrice: integer("unit_price").notNull(),
  weightGrams: integer("weight_grams").notNull(),
});

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    qty: integer("qty").notNull(),
    status: text("status").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reservations_order_idx").on(table.orderId),
    index("reservations_active_idx").on(table.variantId).where(sql`${table.status} = 'active'`),
    check("reservations_status_check", sql`${table.status} in ('active','committed','released')`),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    city: text("city"),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    photos: jsonb("photos").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    status: text("status").notNull().default("pending"),
    seedKey: text("seed_key").unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reviews_product_idx").on(table.productId, table.status),
    check("reviews_rating_check", sql`${table.rating} between 1 and 5`),
    check("reviews_status_check", sql`${table.status} in ('pending','approved','rejected')`),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    dedupeKey: text("dedupe_key").notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("webhook_dedupe_idx").on(table.provider, table.dedupeKey)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  voucher: one(vouchers, { fields: [orders.voucherId], references: [vouchers.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
