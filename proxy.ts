import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Admin UI is served at the obfuscated /p@ss1 path (rewritten to /admin in
// next.config.ts). The login screen lives at the /p@ss1 root and stays public.
const LOGIN_PATHS = new Set(["/p@ss1", "/p@ss1/"]);

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const { res, isAdmin } = await updateSession(req);

  // Public login page: always allow (so admins can sign in).
  if (LOGIN_PATHS.has(pathname)) return res;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminUi = pathname.startsWith("/p@ss1");

  if ((isAdminApi || isAdminUi) && !isAdmin) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/p@ss1";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/p@ss1/:path*", "/api/admin/:path*"],
};
