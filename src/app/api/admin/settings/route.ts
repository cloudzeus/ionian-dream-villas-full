import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const settings = await prisma.siteSetting.findMany()
  return NextResponse.json(Object.fromEntries(settings.map(s => [s.key, s.value])))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const results: Record<string, string> = {}
  for (const [key, value] of Object.entries(body)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as string },
      update: { value: value as string },
    })
    results[key] = value as string
  }
  return NextResponse.json(results)
}
