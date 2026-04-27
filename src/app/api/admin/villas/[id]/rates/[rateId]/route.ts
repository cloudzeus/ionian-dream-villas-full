import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; rateId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { rateId } = await params
  const body = await req.json()
  const rate = await prisma.seasonRate.update({ where: { id: rateId }, data: body })
  return NextResponse.json(rate)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; rateId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { rateId } = await params
  await prisma.seasonRate.delete({ where: { id: rateId } })
  return NextResponse.json({ ok: true })
}
