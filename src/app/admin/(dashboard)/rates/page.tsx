import { prisma } from "@/lib/prisma"
import RatesManager from "@/components/admin/RatesManager"

export default async function AdminRatesPage() {
  const villas = await prisma.villa.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: "en" } },
      rates: { orderBy: { sortOrder: "asc" } },
    },
  })

  const data = villas.map(v => ({
    id: v.id,
    slug: v.slug,
    name: v.translations[0]?.name || v.slug,
    rates: v.rates,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Rates</h1>
        <p className="text-sm text-muted-foreground mt-1">Season pricing per villa — edit in the villa editor</p>
      </div>
      <RatesManager villas={data} />
    </div>
  )
}
