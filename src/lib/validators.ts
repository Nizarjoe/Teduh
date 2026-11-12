import { z } from "zod";
import { materialTypes } from "@/data/materials";
import { sizeChartKeys } from "@/data/size-charts";
import { orderStatuses } from "@/lib/order-status";
import { voucherTypes } from "@/lib/vouchers";

const cartItem = z.object({
  variantId: z.string().uuid("Varian tidak valid."),
  qty: z.number().int().min(1, "Jumlah minimal 1.").max(10, "Maksimal 10 per varian."),
});

export const quoteSchema = z.object({
  items: z.array(cartItem).min(1, "Keranjang kosong.").max(20),
  provinceId: z.string().trim().max(40).optional().or(z.literal("")),
  cityId: z.string().trim().max(60).optional().or(z.literal("")),
  districtId: z.string().trim().max(80).optional().or(z.literal("")),
  courierCode: z.string().trim().max(40).optional().or(z.literal("")),
  serviceCode: z.string().trim().max(40).optional().or(z.literal("")),
  voucherCode: z.string().trim().max(40).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const checkoutSchema = quoteSchema.extend({
  name: z.string().trim().min(2, "Nama terlalu pendek.").max(80, "Nama terlalu panjang."),
  phone: z.string().trim().min(8, "Nomor WhatsApp tidak valid.").max(20),
  email: z.union([z.string().trim().email("Email tidak valid."), z.literal("")]).optional(),
  provinceId: z.string().trim().min(1, "Pilih provinsi."),
  cityId: z.string().trim().min(1, "Pilih kota atau kabupaten."),
  districtId: z.string().trim().min(1, "Pilih kecamatan."),
  addressLine: z.string().trim().min(10, "Alamat kurang lengkap.").max(200),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  courierCode: z.string().trim().min(2, "Pilih kurir."),
  serviceCode: z.string().trim().min(2, "Pilih layanan kurir."),
  expectedTotal: z.number().int().nonnegative(),
});

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  authorName: z.string().trim().min(2, "Nama terlalu pendek.").max(60),
  city: z.string().trim().max(40).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(20, "Ulasan terlalu pendek.").max(800),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const trackSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(6)
    .max(40)
    .regex(/^[A-Z0-9-]+$/i, "Nomor pesanan tidak valid."),
  phone: z.string().trim().min(8).max(20),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid.").max(120),
  password: z.string().min(8, "Kata sandi terlalu pendek.").max(200),
  next: z.string().max(200).optional(),
});

const imageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine((value) => value.startsWith("/") || value.startsWith("https://"), "URL gambar tidak valid."),
  alt: z.string().trim().min(1).max(200),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9-]+$/, "SKU memakai huruf besar, angka, dan strip."),
  size: z.string().trim().min(1).max(20),
  color: z.string().trim().min(1).max(40),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna hex tidak valid."),
  price: z.coerce.number().int().positive().max(10_000_000),
  compareAtPrice: z.union([z.coerce.number().int().positive().max(10_000_000), z.null()]).optional(),
  stock: z.coerce.number().int().min(0).max(100_000),
  weightGrams: z.coerce.number().int().min(50).max(10_000),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug huruf kecil dan strip."),
    categoryId: z.string().uuid(),
    description: z.string().trim().min(20).max(4000),
    materialType: z.enum(materialTypes),
    materialNote: z.string().trim().min(5).max(500),
    waterproofNote: z.string().trim().min(5).max(500),
    careNote: z.string().trim().min(5).max(500),
    sizeChart: z.enum(sizeChartKeys),
    weightGrams: z.coerce.number().int().min(50).max(10_000),
    isActive: z.boolean(),
    isBestSeller: z.boolean(),
    images: z.array(imageSchema).min(1, "Minimal satu gambar.").max(8),
    variants: z.array(variantSchema).min(1).max(80),
  })
  .superRefine((value, ctx) => {
    const skus = new Set<string>();
    value.variants.forEach((variant, index) => {
      if (skus.has(variant.sku)) {
        ctx.addIssue({ code: "custom", message: "SKU dobel.", path: ["variants", index, "sku"] });
      }
      skus.add(variant.sku);
      if (variant.compareAtPrice != null && variant.compareAtPrice <= variant.price) {
        ctx.addIssue({
          code: "custom",
          message: "Harga pembanding harus lebih tinggi dari harga jual.",
          path: ["variants", index, "compareAtPrice"],
        });
      }
    });
  });

export const orderUpdateSchema = z.object({
  status: z.enum(orderStatuses),
  resi: z.string().trim().max(40).optional().or(z.literal("")),
});

export const voucherInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[A-Za-z0-9-]+$/, "Kode hanya huruf, angka, dan strip."),
  type: z.enum(voucherTypes),
  value: z.coerce.number().int().positive().max(1_000_000),
  minSpend: z.coerce.number().int().min(0).max(10_000_000).default(0),
  maxDiscount: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  usageLimit: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  firstOrderOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const reviewModerationSchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
});

export const mockPaymentSchema = z.object({
  orderNumber: z.string().trim().min(6).max(40),
  token: z.string().trim().min(10).max(80),
  outcome: z.enum(["success", "failure"]),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
