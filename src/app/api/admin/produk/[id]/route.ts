import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { handle } from "@/lib/http";
import { productInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(request, async () => {
    await assertCsrf(request);
    await requireAdmin();
    const { id } = await context.params;
    await saveProduct(productInputSchema.parse(await request.json()), id);
    return NextResponse.json({ id });
  });
}
