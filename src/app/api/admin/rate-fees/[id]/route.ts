import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { locale, label, note, amount, unit, mandatory, sortOrder } = await req.json()

  // Numeric/enum fields update
  if (amount !== undefined || unit !== undefined || mandatory !== undefined || sortOrder !== undefined) {
    const data: any = {}
    if (amount !== undefined) data.amount = Number(amount)
    if (unit !== undefined) data.unit = unit
    if (mandatory !== undefined) data.mandatory = mandatory
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    await prisma.rateFee.update({ where: { id }, data })
  }

  // Translation upsert
  if (locale) {
    await prisma.rateFeeTranslation.upsert({
      where: { feeId_locale: { feeId: id, locale } },
      create: { feeId: id, locale, label: label ?? "", note: note ?? "" },
      update: { label: label ?? "", note: note ?? "" },
    })
  }

  const fee = await prisma.rateFee.findUnique({
    where: { id },
    include: { translations: true },
  })
  return NextResponse.json(fee)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.rateFee.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
