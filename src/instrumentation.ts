/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * We use it to pre-warm the Prisma connection pool so the first user request
 * doesn't have to wait for the initial TCP handshake to the remote MySQL host.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("./lib/prisma")
    try {
      await prisma.$connect()
      console.log("[prisma] connection pool warmed up")
    } catch (err) {
      console.error("[prisma] warm-up failed:", err)
      // Don't throw — the server should still start even if DB is temporarily unreachable
    }
  }
}
