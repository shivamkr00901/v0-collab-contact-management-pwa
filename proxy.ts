import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/", "/auth/login", "/auth/signup"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Protected routes
  const protectedRoutes = ["/dashboard", "/groups", "/settings"]
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("auth")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/groups/:path*", "/settings/:path*"],
}
