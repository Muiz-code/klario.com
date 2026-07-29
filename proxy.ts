import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import {
  capabilityForPath,
  apiCapabilityForPath,
  firstAllowedPath,
} from "@/lib/auth/capabilities";

// Admin UI is served at the obfuscated /marketing path (rewritten to /admin in
// next.config.ts). The login screen lives at the /marketing root and stays public.
const LOGIN_PATHS = new Set(["/marketing", "/marketing/"]);

const CHANGE_PASSWORD_PATH = "/marketing/change-password";
const DISABLED_PATH = "/marketing/disabled";

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const { res, isAdmin, memberFound, mustChangePassword, isSuperadmin, capabilities } =
    await updateSession(req);

  // Public login page: always allow (so admins can sign in).
  if (LOGIN_PATHS.has(pathname)) return res;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminUi = pathname.startsWith("/marketing");

  // Disabled member (row exists but not active): show a "disabled" screen and
  // block everything else — this takes effect immediately, even mid-session.
  if (memberFound && !isAdmin) {
    if (isAdminApi) return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    if (pathname !== DISABLED_PATH) {
      const url = req.nextUrl.clone();
      url.pathname = DISABLED_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return res;
  }

  if ((isAdminApi || isAdminUi) && !isAdmin) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/marketing";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Invited member who hasn't set their own password yet: force them onto the
  // change-password screen (UI only — the auth + complete-password API run free).
  if (isAdminUi && mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
    const url = req.nextUrl.clone();
    url.pathname = CHANGE_PASSWORD_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Capability gates (superadmins + env owners bypass — they have all caps).
  if (!isSuperadmin) {
    // UI: redirect to the first section the member CAN reach.
    if (isAdminUi && pathname !== CHANGE_PASSWORD_PATH) {
      const cap = capabilityForPath(pathname);
      if (cap && !capabilities.includes(cap)) {
        const url = req.nextUrl.clone();
        url.pathname = firstAllowedPath(capabilities);
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
    // API: 403 if the member lacks the route's capability. This locks down what
    // a role can DO to match what it can SEE.
    if (isAdminApi) {
      const cap = apiCapabilityForPath(pathname);
      if (cap && !capabilities.includes(cap)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/marketing/:path*", "/api/admin/:path*"],
};
