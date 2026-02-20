import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // --- LOGGING START ---
  const path = request.nextUrl.pathname;

  // נסנן רעש של קבצים סטטיים כדי לא להציף את הלוג
  if (!path.includes("_next") && !path.includes("favicon")) {
    console.log(`[Middleware] Processing: ${path}`);
    const cookiesList = request.cookies.getAll().map((c) => c.name).join(", ");
    console.log(`[Middleware] Cookies present: ${cookiesList || "NONE"}`);
  }
  // --- LOGGING END ---

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images etc - svg, png, jpg...)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
