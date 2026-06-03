import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import EnquiriesTable from "@/components/admin/EnquiriesTable"

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } })

  const rows = enquiries.map(e => ({
    id: e.id,
    kind: e.kind,
    name: e.name,
    email: e.email,
    villa: e.villa,
    arrival: e.arrival,
    nights: e.nights,
    guests: e.guests,
    message: e.message,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Enquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">{rows.length} total</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <EnquiriesTable enquiries={rows} />
        </CardContent>
      </Card>
    </div>
  )
}
