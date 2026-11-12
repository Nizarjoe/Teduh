import { NextResponse } from "next/server";
import { z } from "zod";
import { setVoucherActive } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { handle } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(request, async () => {
    await assertCsrf(request);
    await requireAdmin();
    const { id } = await context.params;
    const body = z.object({ isActive: z.boolean() }).parse(await request.json());
    await setVoucherActive(id, body.isActive);
    return NextResponse.json({ ok: true });
  });
}
