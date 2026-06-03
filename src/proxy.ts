import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

// Renamed from `middleware` to `proxy` per the Next.js 16 file-convention change.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/admin")) {
    // Auth.js v5 JWT cookie (v5 uses "authjs." prefix, https adds "__Secure-")
    const hasSession =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("__Secure-authjs.session-token")

    if (!hasSession && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    return NextResponse.next()
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)*",
  ],
}
