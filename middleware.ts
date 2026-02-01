import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const AUTH_PATHS = ["/signin", "/signup", "/reset-password", "/two-step-verification"];
const PUBLIC_PATHS = [
  "/error-404",
  "/error-500",
  "/error-503",
  "/coming-soon",
  "/maintenance",
  "/success",
];
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    if (request.cookies.get(SESSION_COOKIE_NAME)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    const signInUrl = new URL("/signin", request.url);
    const nextPath = `${pathname}${request.nextUrl.search}`;
    signInUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
