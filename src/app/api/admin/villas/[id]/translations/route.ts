import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { locale, ...data } = body

  const result = await prisma.villaTranslation.upsert({
    where: { villaId_locale: { villaId: id, locale } },
    update: data,
    create: { villaId: id, locale, ...data },
  })
  return NextResponse.json(result)
}
