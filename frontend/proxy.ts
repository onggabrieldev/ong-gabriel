import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminAccess, sessionCookieName } from "@/lib/admin/session";
import { adminDestination, adminLoginPath } from "@/lib/admin/types";

function isLoginPath(pathname: string): boolean {
  return pathname === adminLoginPath || pathname.startsWith(`${adminLoginPath}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionId = request.cookies.get(sessionCookieName)?.value;

  if (isLoginPath(pathname)) {
    // A signed-in editor has nothing to do on the login page.
    if (sessionId && (await getAdminAccess(sessionId)) === "editor") {
      const destination = adminDestination(request.nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // Fail closed: if the API cannot confirm the session, send the visitor to
  // the login page instead of rendering the panel.
  if ((await getAdminAccess(sessionId)) === "editor") {
    return NextResponse.next();
  }

  const login = request.nextUrl.clone();
  login.pathname = adminLoginPath;
  login.search = "";
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
