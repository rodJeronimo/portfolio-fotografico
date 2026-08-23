import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((request) => {
  const isLoggedIn = !!request.auth;
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (isLoggedIn || isLoginPage) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.nextUrl.origin);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/admin/:path*"],
};
