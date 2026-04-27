import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id: locationId, locale } = await params
  const { name, nameLocal, kind, short, long } = await req.json()
  try {
    const tr = await prisma.locationTranslation.upsert({
      where: { locationId_locale: { locationId, locale: locale as any } },
      update: { name, nameLocal, kind, short, long },
      create: { locationId, locale: locale as any, name, nameLocal, kind, short, long },
    })
    return NextResponse.json(tr)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
