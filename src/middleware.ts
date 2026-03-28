import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware runs on EVERY request before Next.js processes it.
 * We use it to add aggressive no-cache headers that force
 * Nginx/aaPanel proxy to never cache HTML responses.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent ALL caching of HTML pages by Nginx proxy
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Vary", "*");
  response.headers.set("X-App-Version", "5.0");

  return response;
}

// Apply to ALL page routes (not static assets)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
