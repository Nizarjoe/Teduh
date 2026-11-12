import { NextResponse } from "next/server";
import { createVoucher } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { handle } from "@/lib/http";
import { voucherInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await assertCsrf(request);
    await requireAdmin();
    await createVoucher(voucherInputSchema.parse(await request.json()));
    return NextResponse.json({ ok: true });
  });
}
