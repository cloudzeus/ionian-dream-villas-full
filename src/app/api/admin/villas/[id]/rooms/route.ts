import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const count = await prisma.villaRoom.count({ where: { villaId: id } })
  const room = await prisma.villaRoom.create({
    data: { villaId: id, sortOrder: count },
    include: { translations: true, beds: true },
  })
  return NextResponse.json(room)
}
