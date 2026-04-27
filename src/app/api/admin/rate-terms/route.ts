import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET — all terms with translations
export async function GET() {
  const terms = await prisma.rateTerm.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  })
  return NextResponse.json(terms)
}

// POST — create new term
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { label, body } = await req.json()
  const count = await prisma.rateTerm.count()

  const term = await prisma.rateTerm.create({
    data: {
      sortOrder: count,
      translations: {
        create: { locale: "en", label: label ?? "", body: body ?? "" },
      },
    },
    include: { translations: true },
  })
  return NextResponse.json(term)
}
