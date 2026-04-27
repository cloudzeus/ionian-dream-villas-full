import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: locationId } = await params
  try {
    const count = await prisma.locationFact.count({ where: { locationId } })
    const fact = await prisma.locationFact.create({
      data: { locationId, sortOrder: count },
      include: { translations: true },
    })
    return NextResponse.json(fact)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
