import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(slides)
}

export async function POST(req: NextRequest) {
  const { imageUrl, captionEn, captionGr } = await req.json()
  const count = await prisma.heroSlide.count()
  const slide = await prisma.heroSlide.create({
    data: { imageUrl, captionEn: captionEn ?? "", captionGr: captionGr ?? "", sortOrder: count },
  })
  return NextResponse.json(slide)
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json()
  const slide = await prisma.heroSlide.update({ where: { id }, data })
  return NextResponse.json(slide)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.heroSlide.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
