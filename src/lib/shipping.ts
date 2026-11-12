import { z } from "zod";
import { cachedJson } from "@/lib/cache";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { quoteLocal, type ShipRate, type Zone } from "@/lib/shipping-quote";

export type RateQuote = { source: "biteship" | "perkiraan"; rates: ShipRate[] };

const biteshipSchema = z.object({
  pricing: z
    .array(
      z.object({
        courier_code: z.string(),
        courier_name: z.string(),
        courier_service_code: z.string(),
        courier_service_name: z.string(),
        price: z.number(),
        duration: z.string().optional(),
      }),
    )
    .optional(),
});

async function fetchBiteship(input: {
  destinationPostal: string;
  weightGrams: number;
  value: number;
}): Promise<ShipRate[]> {
  const env = getEnv();
  const response = await fetch(`${env.BITESHIP_BASE_URL}/rates/couriers`, {
    method: "POST",
    headers: {
      authorization: env.BITESHIP_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      origin_postal_code: env.ORIGIN_POSTAL_CODE,
      destination_postal_code: input.destinationPostal,
      couriers: "jne,sicepat,jnt,anteraja",
      items: [
        {
          name: "Jas hujan Teduh",
          description: "Pesanan Teduh",
          value: Math.max(input.value, 1000),
          weight: Math.max(input.weightGrams, 100),
          quantity: 1,
        },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    logger.warn("biteship gagal", { status: response.status });
    throw new AppError("shipping", "Tarif kurir sedang tidak bisa diambil. Coba lagi.", 502);
  }
  const parsed = biteshipSchema.safeParse(await response.json());
  const pricing = parsed.success ? parsed.data.pricing ?? [] : [];
  if (pricing.length === 0) {
    throw new AppError("shipping", "Tidak ada layanan kurir untuk kecamatan ini.", 400);
  }
  return pricing
    .filter((row) => row.price > 0)
    .map((row) => ({
      courierCode: row.courier_code,
      courierName: row.courier_name,
      serviceCode: row.courier_service_code,
      serviceName: row.courier_service_name,
      cost: row.price,
      etd: row.duration ? `${row.duration} hari` : "menyusul",
    }))
    .sort((a, b) => a.cost - b.cost);
}

export async function getRates(input: {
  destinationPostal: string;
  zone: Zone;
  weightGrams: number;
  value: number;
}): Promise<RateQuote> {
  const key = `rates:${input.destinationPostal}:${input.weightGrams}:${input.value}:${getEnv().BITESHIP_API_KEY ? "live" : "local"}`;
  return cachedJson(key, 10 * 60 * 1000, async () => {
    if (!getEnv().BITESHIP_API_KEY) {
      return { source: "perkiraan" as const, rates: quoteLocal({ zone: input.zone, weightGrams: input.weightGrams }) };
    }
    const rates = await fetchBiteship(input);
    return { source: "biteship" as const, rates };
  });
}
