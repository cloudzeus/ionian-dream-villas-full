import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const fees = await prisma.rateFee.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  })
  return NextResponse.json(fees)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { label, note, amount, unit, mandatory } = await req.json()
  const count = await prisma.rateFee.count()

  const fee = await prisma.rateFee.create({
    data: {
      amount: amount ?? 0,
      unit: unit ?? "per_stay",
      mandatory: mandatory ?? true,
      sortOrder: count,
      translations: {
        create: { locale: "en", label: label ?? "", note: note ?? "" },
      },
    },
    include: { translations: true },
  })
  return NextResponse.json(fee)
}
