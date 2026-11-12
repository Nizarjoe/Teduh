import type { NextResponse } from "next/server";
import { sessionCookieName, sessionMaxAge } from "@/lib/auth";
import { isSecureRequest } from "@/lib/http";

export function setSessionCookie(response: NextResponse, request: Request, token: string): void {
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: sessionMaxAge(),
  });
}

export function clearSessionCookie(response: NextResponse, request: Request): void {
  response.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
}
