import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const amenity = await prisma.villaAmenity.create({
    data: {
      villaId: id,
      slug: body.slug,
      icon: body.icon || "",
      translations: {
        create: [
          { locale: "en", label: body.labelEn || body.slug },
          { locale: "el", label: body.labelEl || body.slug },
          { locale: "de", label: body.labelDe || body.slug },
        ],
      },
    },
    include: { translations: true },
  })
  return NextResponse.json(amenity)
}
