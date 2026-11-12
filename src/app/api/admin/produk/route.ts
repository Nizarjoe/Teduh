import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { handle } from "@/lib/http";
import { productInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await assertCsrf(request);
    await requireAdmin();
    const id = await saveProduct(productInputSchema.parse(await request.json()));
    return NextResponse.json({ id });
  });
}
