import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; imgId: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied

  const { id: locationId, imgId } = await params
  const { isCover, altEn, sortOrder } = await req.json()
  try {
    if (isCover) {
      await prisma.locationImage.updateMany({ where: { locationId }, data: { isCover: false } })
    }
    const img = await prisma.locationImage.update({
      where: { id: imgId },
      data: { ...(isCover !== undefined && { isCover }), ...(altEn !== undefined && { altEn }), ...(sortOrder !== undefined && { sortOrder }) },
    })
    return NextResponse.json(img)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ imgId: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied

  const { imgId } = await params
  try {
    await prisma.locationImage.delete({ where: { id: imgId } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
