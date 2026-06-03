import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ factId: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied

  const { factId } = await params
  const { locale, label, value } = await req.json()
  try {
    const ft = await prisma.locationFactTranslation.upsert({
      where: { factId_locale: { factId, locale: locale as any } },
      update: { label, value },
      create: { factId, locale: locale as any, label, value },
    })
    return NextResponse.json(ft)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ factId: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied

  const { factId } = await params
  try {
    await prisma.locationFact.delete({ where: { id: factId } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
