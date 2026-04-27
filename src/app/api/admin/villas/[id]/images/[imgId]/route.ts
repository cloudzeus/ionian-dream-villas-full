import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imgId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id, imgId } = await params
  const body = await req.json()
  if (body.isCover) {
    await prisma.villaImage.updateMany({ where: { villaId: id }, data: { isCover: false } })
  }
  const image = await prisma.villaImage.update({ where: { id: imgId }, data: body })
  return NextResponse.json(image)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imgId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { imgId } = await params
  await prisma.villaImage.delete({ where: { id: imgId } })
  return NextResponse.json({ ok: true })
}
