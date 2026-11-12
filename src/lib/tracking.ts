import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { isSecureRequest } from "@/lib/http";
import { safeEqual } from "@/lib/secret";

const COOKIE = "teduh_track";

export function signTracking(orderNumber: string, expiresAtSec: number): string {
  const data = `${orderNumber}.${expiresAtSec}`;
  const sig = createHmac("sha256", getEnv().SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function readTrackingValue(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const orderNumber = parts[0];
  const exp = parts[1];
  const sig = parts[2];
  if (!orderNumber || !exp || !sig) return null;
  const expires = Number(exp);
  if (!Number.isFinite(expires) || expires * 1000 < Date.now()) return null;
  const expected = createHmac("sha256", getEnv().SESSION_SECRET).update(`${orderNumber}.${exp}`).digest("base64url");
  if (!safeEqual(expected, sig)) return null;
  return orderNumber;
}

export function attachTrackingCookie(response: NextResponse, request: Request, orderNumber: string): void {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  response.cookies.set(COOKIE, signTracking(orderNumber, exp), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function trackingOrderFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return readTrackingValue(jar.get(COOKIE)?.value);
}
