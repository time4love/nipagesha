import { type NextRequest } from "next/server";

// Admin protection is done only in src/app/admin/layout.tsx via requireAdmin() (server).
// We do NOT protect /admin in middleware: Edge runtime can fail to read the full session
// from cookies (getUser() returns null even for logged-in admins), causing false redirect to login.
export async function middleware(_request: NextRequest) {
  return (await import("next/server")).NextResponse.next();
}

export const config = {
  matcher: [],
};
