import { prisma } from "@/lib/prisma"
import RatesManager from "@/components/admin/RatesManager"
import RateTermsManager from "@/components/admin/RateTermsManager"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default async function AdminRatesPage() {
  const [villas, terms, fees] = await Promise.all([
    prisma.villa.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        translations: { where: { locale: "en" } },
        rates: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.rateTerm.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: true } }).catch(() => []),
    prisma.rateFee.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: true } }).catch(() => []),
  ])

  const villaData = villas.map(v => ({
    id: v.id,
    slug: v.slug,
    name: v.translations[0]?.name || v.slug,
    rates: v.rates,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Rates</h1>
        <p className="text-sm text-muted-foreground mt-1">Season pricing, booking terms and extra fees — all multilingual</p>
      </div>

      <Tabs defaultValue="season">
        <TabsList>
          <TabsTrigger value="season">Season Rates</TabsTrigger>
          <TabsTrigger value="terms">Terms &amp; Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="season" className="mt-6">
          <RatesManager villas={villaData} />
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          <RateTermsManager initialTerms={terms} initialFees={fees} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
