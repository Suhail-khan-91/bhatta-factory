import { NextResponse } from "next/server";

// Protected paths and their sub-routes
const PROTECTED_PATHS = [
  "/analytics",
  "/sales",
  "/payroll",
  "/master-entry",
  "/calculator",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the current path starts with any protected path
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected) {
    const session = request.cookies.get("batta_session");

    if (!session || session.value !== "authenticated") {
      // Redirect to home if no valid session cookie
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all paths except static files and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
