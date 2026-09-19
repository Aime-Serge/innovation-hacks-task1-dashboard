import { NextRequest, NextResponse } from "next/server";

// Redirect away from these if a mock session already exists — no
// reason to show a login/register form to someone already "signed in".
const AUTH_ENTRY_PATHS = ["/login", "/register"];
// Never require a session, and never redirect away regardless of one.
const ALWAYS_PUBLIC_PATHS = ["/forgot-password", "/reset-password"];

// This is a frontend-only demo — mock_session is a plain, unsigned
// cookie set by lib/mock-auth.ts, not a real credential. This check is
// a presence check only, purely to avoid flashing a protected page
// before the client-side redirect in auth-context.tsx would otherwise
// kick in; it carries no actual authorization guarantee.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthEntry = AUTH_ENTRY_PATHS.includes(pathname);
  const isAlwaysPublic = ALWAYS_PUBLIC_PATHS.includes(pathname);
  const hasSession = request.cookies.has("mock_session");

  if (!isAuthEntry && !isAlwaysPublic && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthEntry && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // robots.txt must stay public so crawlers get the file, not the login page.
  matcher: ["/((?!_next|favicon.ico|robots.txt).*)"],
};
