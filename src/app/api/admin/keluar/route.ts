import { NextResponse } from "next/server";
import { logoutToken } from "@/lib/auth";
import { assertCsrf, readCookie } from "@/lib/csrf";
import { handle } from "@/lib/http";
import { sessionCookieName } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handle(request, async () => {
    await assertCsrf(request);
    await logoutToken(readCookie(request, sessionCookieName()));
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response, request);
    return response;
  });
}
