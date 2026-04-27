import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/seo?pageKey=home&locale=en
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const pageKey = searchParams.get("pageKey")
  const locale = searchParams.get("locale")

  if (!pageKey || !locale) {
    return NextResponse.json({ error: "pageKey and locale required" }, { status: 400 })
  }

  const row = await prisma.pageSeo.findUnique({
    where: { pageKey_locale: { pageKey, locale: locale as any } },
  })

  return NextResponse.json(row ?? null)
}

// POST /api/admin/seo — upsert one record
export async function POST(req: Request) {
  const body = await req.json()
  const { pageKey, locale, title, description, ogTitle, ogDescription, keywords } = body

  if (!pageKey || !locale || !title || !description) {
    return NextResponse.json({ error: "pageKey, locale, title, description required" }, { status: 400 })
  }

  const row = await prisma.pageSeo.upsert({
    where: { pageKey_locale: { pageKey, locale: locale as any } },
    create: { pageKey, locale: locale as any, title, description, ogTitle, ogDescription, keywords },
    update: { title, description, ogTitle, ogDescription, keywords },
  })

  return NextResponse.json(row)
}
