import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import VillaEditor from "@/components/admin/VillaEditor"

export default async function AdminVillaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const villa = await prisma.villa.findUnique({
    where: { id },
    include: {
      translations: true,
      images: { orderBy: { sortOrder: "asc" } },
      rooms: {
        orderBy: { sortOrder: "asc" },
        include: { translations: true, beds: true },
      },
      amenities: { include: { translations: true } },
      facilities: { include: { translations: true } },
      rates: { orderBy: { sortOrder: "asc" } },
    },
  })
  if (!villa) notFound()
  return <VillaEditor villa={villa} />
}
