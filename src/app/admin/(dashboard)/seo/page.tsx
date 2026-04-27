import { prisma } from "@/lib/prisma"
import SeoManager from "@/components/admin/SeoManager"

const LOCALES = ["en", "el", "de"] as const
type Locale = typeof LOCALES[number]

export default async function AdminSeoPage() {
  // Build the full page list dynamically
  const [villas, locations] = await Promise.all([
    prisma.villa.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, translations: { where: { locale: "en" }, select: { name: true } } },
    }),
    prisma.location.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, translations: { where: { locale: "en" }, select: { name: true } } },
    }),
  ])

  const pages = [
    { pageKey: "home", label: "Homepage", group: "main" },
    { pageKey: "villas", label: "Villas overview", group: "main" },
    { pageKey: "lefkada", label: "Lefkada island guide", group: "main" },
    { pageKey: "rates", label: "Rates & pricing", group: "main" },
    { pageKey: "contact", label: "Contact", group: "main" },
    ...villas.map(v => ({
      pageKey: `villa:${v.slug}`,
      label: v.translations[0]?.name || v.slug,
      group: "villas",
    })),
    ...locations.map(l => ({
      pageKey: `location:${l.slug}`,
      label: l.translations[0]?.name || l.slug,
      group: "locations",
    })),
  ]

  // Fetch all existing SEO records for these pages
  const allPageKeys = pages.map(p => p.pageKey)
  const existingRows = await prisma.pageSeo.findMany({
    where: { pageKey: { in: allPageKeys } },
  })

  type SeoRecord = { title: string; description: string; ogTitle: string; ogDescription: string; keywords: string }

  const initialRecords: Record<string, Record<Locale, SeoRecord | null>> = {}
  for (const p of pages) {
    initialRecords[p.pageKey] = { en: null, el: null, de: null }
    for (const row of existingRows.filter(r => r.pageKey === p.pageKey)) {
      const l = row.locale as Locale
      if (LOCALES.includes(l)) {
        initialRecords[p.pageKey][l] = {
          title: row.title,
          description: row.description,
          ogTitle: row.ogTitle ?? "",
          ogDescription: row.ogDescription ?? "",
          keywords: row.keywords ?? "",
        }
      }
    }
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>SEO Manager</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Manage meta titles, descriptions, and Open Graph data for every page. Use ✦ AI Generate to auto-fill fields with DeepSeek.
        </p>
      </div>

      <SeoManager pages={pages} initialRecords={initialRecords} />
    </div>
  )
}
