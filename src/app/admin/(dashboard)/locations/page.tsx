import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LocationsTable from "@/components/admin/LocationsTable"

export default async function AdminLocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: "en" } },
      images: { where: { isCover: true }, take: 1 },
      _count: { select: { images: true, facts: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">Island guide — {locations.length} places</p>
        </div>
        <Button asChild>
          <Link href="/admin/locations/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Location
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <LocationsTable locations={locations} />
        </CardContent>
      </Card>
    </div>
  )
}
