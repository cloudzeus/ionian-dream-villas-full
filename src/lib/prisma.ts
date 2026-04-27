import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

// Cache the singleton on globalThis in ALL environments — prevents new PrismaClient
// instances per request in production, which exhausts the connection pool.
globalForPrisma.prisma = prisma
