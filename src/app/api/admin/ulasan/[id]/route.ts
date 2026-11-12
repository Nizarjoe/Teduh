import { NextResponse } from "next/server";
import { moderateReview } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { handle } from "@/lib/http";
import { reviewModerationSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(request, async () => {
    await assertCsrf(request);
    await requireAdmin();
    const { id } = await context.params;
    const body = reviewModerationSchema.parse(await request.json());
    await moderateReview(id, body.status);
    return NextResponse.json({ ok: true });
  });
}
