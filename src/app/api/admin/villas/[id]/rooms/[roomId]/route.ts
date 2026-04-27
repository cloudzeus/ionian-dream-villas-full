import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { roomId } = await params
  const body = await req.json()
  const { locale, name, note, beds, ...roomData } = body

  if (locale && (name !== undefined || note !== undefined)) {
    await prisma.villaRoomTranslation.upsert({
      where: { roomId_locale: { roomId, locale } },
      create: { roomId, locale, name: name ?? "", note: note ?? "" },
      update: { name: name ?? "", note: note ?? "" },
    })
  }

  if (beds !== undefined) {
    await prisma.bedType.deleteMany({ where: { roomId } })
    if (beds.length > 0) {
      await prisma.bedType.createMany({ data: beds.map((b: any) => ({ roomId, type: b.type, quantity: b.quantity })) })
    }
  }

  if (Object.keys(roomData).length > 0) {
    await prisma.villaRoom.update({ where: { id: roomId }, data: roomData })
  }

  const room = await prisma.villaRoom.findUnique({
    where: { id: roomId },
    include: { translations: true, beds: true },
  })
  return NextResponse.json(room)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { roomId } = await params
  await prisma.villaRoom.delete({ where: { id: roomId } })
  return NextResponse.json({ ok: true })
}
