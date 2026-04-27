import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: locationId } = await params
  const { url, altEn, sortOrder, isCover } = await req.json()
  try {
    if (isCover) {
      await prisma.locationImage.updateMany({ where: { locationId }, data: { isCover: false } })
    }
    const img = await prisma.locationImage.create({ data: { locationId, url, altEn: altEn || "", sortOrder: sortOrder ?? 0, isCover: Boolean(isCover) } })
    return NextResponse.json(img)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
