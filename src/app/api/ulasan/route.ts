import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { products, reviews } from "@/db/schema";
import { assertCsrf } from "@/lib/csrf";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, handle } from "@/lib/http";
import { reviewSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "review", 3, 60 * 60_000);
    await assertCsrf(request);
    const body = reviewSchema.parse(await request.json());
    if (body.company) return NextResponse.json({ ok: true });
    const product = await getDb().select({ id: products.id }).from(products).where(eq(products.id, body.productId)).limit(1);
    if (!product[0]) throw new AppError("missing", "Produk tidak ditemukan.", 404);
    await getDb().insert(reviews).values({
      productId: body.productId,
      authorName: body.authorName,
      city: body.city?.trim() ? body.city.trim() : null,
      rating: body.rating,
      body: body.body,
      photos: [],
      status: "pending",
    });
    return NextResponse.json({ ok: true });
  });
}
