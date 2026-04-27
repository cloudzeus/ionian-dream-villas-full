import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { sourceVillaId } = await req.json()
  if (!sourceVillaId) return NextResponse.json({ error: "sourceVillaId required" }, { status: 400 })

  const source = await prisma.seasonRate.findMany({
    where: { villaId: sourceVillaId },
    orderBy: { sortOrder: "asc" },
  })

  if (source.length === 0) {
    return NextResponse.json({ error: "Source villa has no rates to copy" }, { status: 400 })
  }

  const allVillas = await prisma.villa.findMany({ select: { id: true }, orderBy: { sortOrder: "asc" } })
  const targetIds = allVillas.map(v => v.id).filter(id => id !== sourceVillaId)

  await prisma.$transaction([
    prisma.seasonRate.deleteMany({ where: { villaId: { in: targetIds } } }),
    prisma.seasonRate.createMany({
      data: targetIds.flatMap(villaId =>
        source.map(r => ({
          villaId,
          season: r.season,
          weekly: r.weekly,
          nightly: r.nightly,
          sortOrder: r.sortOrder,
        }))
      ),
    }),
  ])

  return NextResponse.json({ ok: true, copied: source.length, toVillas: targetIds.length })
}
