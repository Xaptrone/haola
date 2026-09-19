import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { previewSurfacesEnabled } from "@/lib/preview";

function hasSession(request: NextRequest) {
  return [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.session-token.0",
    "__Secure-authjs.session-token.0",
  ].some((name) => request.cookies.get(name));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const preview =
    previewSurfacesEnabled() &&
    request.nextUrl.searchParams.get("preview") === "1";
  const guarded =
    pathname.startsWith("/work") || pathname.startsWith("/oversight");
  if (!guarded || preview || hasSession(request)) {
    return NextResponse.next();
  }
  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/work/:path*", "/oversight/:path*"],
};
