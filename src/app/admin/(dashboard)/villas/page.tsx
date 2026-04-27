import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import VillasTable from "@/components/admin/VillasTable"

export default async function AdminVillasPage() {
  const villas = await prisma.villa.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: "en" } },
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { rooms: true, amenities: true, images: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Villas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {villas.length} villa{villas.length !== 1 ? "s" : ""} configured
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <VillasTable villas={villas} />
        </CardContent>
      </Card>
    </div>
  )
}
