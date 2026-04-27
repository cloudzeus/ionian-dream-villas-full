import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; amenityId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { amenityId } = await params
  const body = await req.json()
  const { locale, label, ...amenityData } = body

  if (locale && label !== undefined) {
    await prisma.villaAmenityTranslation.upsert({
      where: { amenityId_locale: { amenityId, locale } },
      create: { amenityId, locale, label },
      update: { label },
    })
  }

  if (Object.keys(amenityData).length > 0) {
    await prisma.villaAmenity.update({ where: { id: amenityId }, data: amenityData })
  }

  const amenity = await prisma.villaAmenity.findUnique({
    where: { id: amenityId },
    include: { translations: true },
  })
  return NextResponse.json(amenity)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; amenityId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { amenityId } = await params
  await prisma.villaAmenity.delete({ where: { id: amenityId } })
  return NextResponse.json({ ok: true })
}
