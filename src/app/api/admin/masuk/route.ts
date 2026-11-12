import { NextResponse } from "next/server";
import { loginAdmin, safeNext } from "@/lib/auth";
import { assertCsrf } from "@/lib/csrf";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, handle } from "@/lib/http";
import { setSessionCookie } from "@/lib/session-cookie";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await enforceRateLimit(request, "login", 5, 15 * 60_000);
    await assertCsrf(request);
    const body = loginSchema.parse(await request.json());
    const token = await loginAdmin(body.email, body.password);
    if (!token) throw new AppError("auth", "Email atau kata sandi salah.", 401);
    const response = NextResponse.json({ ok: true, next: safeNext(body.next) });
    setSessionCookie(response, request, token);
    return response;
  });
}
