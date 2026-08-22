import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO(M1): validar sessão Auth.js v5 + allowlist ADMIN_EMAILS.
// Ver docs/architecture/auth-strategy.md.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
