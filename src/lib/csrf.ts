import { AppError } from "@/lib/errors";
import { safeEqual } from "@/lib/secret";

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    if (key !== name) continue;
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return null;
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) throw new AppError("csrf", "Permintaan ditolak.", 403);
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError("csrf", "Permintaan ditolak.", 403);
  }
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || request.headers.get("host") || new URL(request.url).host;
  if (originHost !== host) throw new AppError("csrf", "Permintaan ditolak.", 403);
}

export async function assertCsrf(request: Request): Promise<void> {
  assertSameOrigin(request);
  const cookie = readCookie(request, "teduh_csrf");
  let provided = request.headers.get("x-csrf-token");
  if (!provided) {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await request.clone().formData();
      const value = form.get("csrf");
      provided = typeof value === "string" ? value : null;
    }
  }
  if (!cookie || !provided || !safeEqual(cookie, provided)) {
    throw new AppError("csrf", "Permintaan ditolak. Muat ulang halaman.", 403);
  }
}
