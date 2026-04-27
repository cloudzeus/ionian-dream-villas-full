import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import LocationEditor from "@/components/admin/LocationEditor"

export default async function AdminLocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      translations: { orderBy: { locale: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      facts: {
        orderBy: { sortOrder: "asc" },
        include: { translations: { orderBy: { locale: "asc" } } },
      },
    },
  })

  if (!location) notFound()

  return <LocationEditor location={location as any} />
}
