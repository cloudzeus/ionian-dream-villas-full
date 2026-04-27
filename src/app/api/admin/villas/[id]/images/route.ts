import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const count = await prisma.villaImage.count({ where: { villaId: id } })
  const image = await prisma.villaImage.create({
    data: { villaId: id, url: body.url, altEn: body.altEn || "", isCover: body.isCover || count === 0, sortOrder: count },
  })
  return NextResponse.json(image)
}
