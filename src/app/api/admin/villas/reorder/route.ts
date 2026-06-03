import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

// PATCH — body: { ids: string[] }
// Updates sortOrder for each villa based on array position
export async function PATCH(req: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied

  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 })
  }
  try {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.villa.update({ where: { id }, data: { sortOrder: index } })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
