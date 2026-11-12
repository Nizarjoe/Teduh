import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function handle(request: Request, fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ZodError) {
      const fields: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = issue.path.length > 0 ? issue.path.join(".") : "form";
        if (!fields[key]) fields[key] = issue.message;
      }
      return NextResponse.json(
        { error: { code: "validation", message: "Periksa isian.", fields } },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message, fields: error.fields } },
        { status: error.status },
      );
    }
    logger.error("unhandled", {
      path: new URL(request.url).pathname,
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: { code: "internal", message: "Terjadi kendala. Coba lagi sebentar." } },
      { status: 500 },
    );
  }
}

export async function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const result = await rateLimit(`${bucket}:${clientIp(request)}`, limit, windowMs);
  if (!result.ok) {
    throw new AppError("rate", "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.", 429);
  }
}

export function isSecureRequest(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (proto) return proto === "https";
  return new URL(request.url).protocol === "https:";
}
