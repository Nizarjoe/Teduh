import { NextResponse } from "next/server";
import { quoteCart } from "@/lib/checkout";
import { assertCsrf } from "@/lib/csrf";
import { enforceRateLimit, handle } from "@/lib/http";
import { quoteSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "quote", 40, 10 * 60_000);
    await assertCsrf(request);
    const quote = await quoteCart(quoteSchema.parse(await request.json()));
    return NextResponse.json(quote);
  });
}
