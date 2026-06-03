import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied

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
