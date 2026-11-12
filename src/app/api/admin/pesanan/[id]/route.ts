import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { handle } from "@/lib/http";
import { orderUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(request, async () => {
    await assertCsrf(request);
    await requireAdmin();
    const { id } = await context.params;
    const body = orderUpdateSchema.parse(await request.json());
    await updateOrderStatus(id, body.status, body.resi ?? "");
    return NextResponse.json({ ok: true });
  });
}
