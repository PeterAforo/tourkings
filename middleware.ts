import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

const protectedPaths = ["/dashboard", "/admin"];
const authPaths = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  if (isAuthPage && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Invalid token, let them access auth pages
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
