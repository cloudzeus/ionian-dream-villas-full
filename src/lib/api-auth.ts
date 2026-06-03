import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Guard for /api/admin/* route handlers.
 *
 * The proxy (src/proxy.ts) only protects /admin *pages* — API routes under
 * /api/admin are NOT covered by it, so every admin route must authenticate
 * itself. Call this at the top of each handler:
 *
 *   const denied = await requireAuth()
 *   if (denied) return denied
 *
 * Returns a 401 NextResponse when there is no valid session, otherwise null.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return null
}

/** Like requireAuth, but also requires the ADMIN role. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return null
}
