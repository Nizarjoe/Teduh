import { z } from "zod";
import { logger } from "@/lib/logger";

const flag = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const optionalText = z
  .string()
  .optional()
  .transform((value) => value ?? "");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  DATABASE_SSL: flag,
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET minimal 32 karakter"),
  APP_URL: z.string().url("APP_URL harus URL absolut"),
  MIDTRANS_SERVER_KEY: z.string().min(1),
  MIDTRANS_CLIENT_KEY: z.string().min(1),
  MIDTRANS_IS_PRODUCTION: flag,
  MIDTRANS_ALLOW_MOCK: flag,
  BITESHIP_API_KEY: optionalText,
  BITESHIP_BASE_URL: z.string().url().default("https://api.biteship.com/v1"),
  ORIGIN_POSTAL_CODE: z.string().regex(/^\d{5}$/).default("12430"),
  REDIS_URL: optionalText,
  S3_ENDPOINT: optionalText,
  S3_REGION: z.string().min(1).default("auto"),
  S3_BUCKET: optionalText,
  S3_ACCESS_KEY_ID: optionalText,
  S3_SECRET_ACCESS_KEY: optionalText,
  S3_PUBLIC_URL: optionalText,
  CRON_SECRET: optionalText,
  MIGRATE_ON_BOOT: flag,
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

function assertSafe(env: Env): void {
  const local = /localhost|127\.0\.0\.1/.test(env.APP_URL);
  if (env.NODE_ENV === "production" && env.SESSION_SECRET.includes("ganti-dengan")) {
    throw new Error("SESSION_SECRET produksi masih memakai nilai contoh.");
  }
  if (env.MIDTRANS_IS_PRODUCTION && env.MIDTRANS_ALLOW_MOCK) {
    throw new Error("MIDTRANS_ALLOW_MOCK harus false saat MIDTRANS_IS_PRODUCTION=true.");
  }
  if (env.MIDTRANS_IS_PRODUCTION && env.MIDTRANS_SERVER_KEY.includes("placeholder")) {
    throw new Error("Kunci Midtrans produksi masih placeholder.");
  }
  if (env.NODE_ENV === "production" && env.MIDTRANS_ALLOW_MOCK && !local) {
    throw new Error("MIDTRANS_ALLOW_MOCK hanya boleh di localhost.");
  }
  if (!env.MIDTRANS_IS_PRODUCTION && env.MIDTRANS_SERVER_KEY.includes("placeholder") && !env.MIDTRANS_ALLOW_MOCK) {
    throw new Error("Isi kunci sandbox Midtrans, atau set MIDTRANS_ALLOW_MOCK=true untuk pengembangan.");
  }
  if (env.MIDTRANS_ALLOW_MOCK) {
    logger.warn("Pembayaran uji aktif. Jangan dipakai untuk uang sungguhan.");
  }
}

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Variabel lingkungan tidak valid. ${detail}`);
  }
  assertSafe(parsed.data);
  cached = parsed.data;
  return cached;
}

export function paymentDriver(env = getEnv()): "mock" | "sandbox" | "production" {
  if (env.MIDTRANS_IS_PRODUCTION) return "production";
  if (env.MIDTRANS_ALLOW_MOCK || env.MIDTRANS_SERVER_KEY.includes("placeholder")) return "mock";
  return "sandbox";
}
