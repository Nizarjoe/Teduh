import { NextResponse } from "next/server";
import { readLocalUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const file = await readLocalUpload(key);
  if (!file) return new NextResponse("Tidak ditemukan", { status: 404 });
  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "content-type": file.type,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
