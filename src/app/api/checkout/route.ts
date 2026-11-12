import { NextResponse } from "next/server";
import { placeOrder } from "@/lib/checkout";
import { assertCsrf } from "@/lib/csrf";
import { enforceRateLimit, handle } from "@/lib/http";
import { attachTrackingCookie } from "@/lib/tracking";
import { checkoutSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "checkout", 8, 10 * 60_000);
    await assertCsrf(request);
    const result = await placeOrder(checkoutSchema.parse(await request.json()));
    const response = NextResponse.json(result);
    attachTrackingCookie(response, request, result.orderNumber);
    return response;
  });
}
