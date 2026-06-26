import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Route protection:
//   - All app routes under the (app) group + /onboarding require login.
//   - /admin/* additionally requires role === 'admin'.
//   - Bartender-only sub-routes require mode === 'bartender'.
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    if (pathname.startsWith("/bar/bartender") && token?.mode !== "bartender") {
      return NextResponse.redirect(new URL("/bar", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/calendar/:path*",
    "/bar/:path*",
    "/profile/:path*",
    "/onboarding",
    "/admin/:path*",
  ],
};
