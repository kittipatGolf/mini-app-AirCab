import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./src/lib/mock-auth";

function toLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isLoginPath = pathname.startsWith("/login");
  const isRegisterPath = pathname.startsWith("/register");
  const isAdminPath = pathname.startsWith("/admin");
  const isUserProfilePath = pathname.startsWith("/profile");

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/booking", request.url));
  }

  if (isLoginPath || isRegisterPath) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (role === "user") {
      return NextResponse.redirect(new URL("/booking", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminPath && role !== "admin") {
    return toLogin(request);
  }

  if (isUserProfilePath && role !== "user") {
    return toLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
