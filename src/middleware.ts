import { NextResponse, type NextRequest } from "next/server";

function token(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function middleware(request: NextRequest) {
  const existing = request.cookies.get("teduh_csrf")?.value;
  const csrf = existing ?? token();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-csrf-seed", csrf);
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/masuk") {
    if (!request.cookies.get("teduh_session")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/masuk";
      url.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(url);
      if (!existing) {
        redirect.cookies.set("teduh_csrf", csrf, {
          httpOnly: false,
          sameSite: "lax",
          secure: request.nextUrl.protocol === "https:",
          path: "/",
          maxAge: 60 * 60 * 24 * 14,
        });
      }
      return redirect;
    }
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!existing) {
    response.cookies.set("teduh_csrf", csrf, {
      httpOnly: false,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
