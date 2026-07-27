import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Admin UI is served at the obfuscated /marketing path (rewritten to /admin in
// next.config.ts). The login screen lives at the /marketing root and stays public.
const LOGIN_PATHS = new Set(["/marketing", "/marketing/"]);

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const { res, isAdmin } = await updateSession(req);

  // Public login page: always allow (so admins can sign in).
  if (LOGIN_PATHS.has(pathname)) return res;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminUi = pathname.startsWith("/marketing");

  if ((isAdminApi || isAdminUi) && !isAdmin) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/marketing";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/marketing/:path*", "/api/admin/:path*"],
};
