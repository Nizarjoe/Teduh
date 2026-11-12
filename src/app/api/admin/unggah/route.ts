import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, handle } from "@/lib/http";
import { saveImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "upload", 20, 10 * 60_000);
    await assertCsrf(request);
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("upload", "Pilih berkas gambar.", 400);
    const url = await saveImage(Buffer.from(await file.arrayBuffer()), "produk");
    return NextResponse.json({ url });
  });
}
