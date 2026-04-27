import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH — body: { ids: string[] }
// Updates sortOrder for each location based on array position
export async function PATCH(req: NextRequest) {
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 })
  }
  try {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.location.update({ where: { id }, data: { sortOrder: index } })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
