import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const VALID_KEYS = ["terms", "privacy", "cookies"]
const VALID_LOCALES = ["en", "el", "de"]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pageKey = searchParams.get("pageKey")
  const locale = searchParams.get("locale")

  if (pageKey && locale) {
    const row = await prisma.legalPage.findUnique({
      where: { pageKey_locale: { pageKey, locale: locale as any } },
    })
    return NextResponse.json({ data: row })
  }

  // Return all
  const rows = await prisma.legalPage.findMany()
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { pageKey, locale, title, content } = body

  if (!VALID_KEYS.includes(pageKey) || !VALID_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid pageKey or locale" }, { status: 400 })
  }

  const row = await prisma.legalPage.upsert({
    where: { pageKey_locale: { pageKey, locale } },
    create: { pageKey, locale, title, content },
    update: { title, content },
  })
  return NextResponse.json({ data: row })
}
