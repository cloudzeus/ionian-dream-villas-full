import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

// PATCH — upsert a translation for a specific locale
// Body: { locale: "en"|"el"|"de", label: string, body: string }
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { locale, label, body, sortOrder } = await req.json()

  // If updating sort order
  if (sortOrder !== undefined) {
    const term = await prisma.rateTerm.update({
      where: { id },
      data: { sortOrder },
      include: { translations: true },
    })
    return NextResponse.json(term)
  }

  // Upsert translation
  await prisma.rateTermTranslation.upsert({
    where: { termId_locale: { termId: id, locale } },
    create: { termId: id, locale, label: label ?? "", body: body ?? "" },
    update: { label: label ?? "", body: body ?? "" },
  })

  const term = await prisma.rateTerm.findUnique({
    where: { id },
    include: { translations: true },
  })
  return NextResponse.json(term)
}

// DELETE — remove term entirely
export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.rateTerm.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
