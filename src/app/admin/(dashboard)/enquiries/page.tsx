import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } })

  const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "new") return "destructive"
    if (status === "replied") return "default"
    return "secondary"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Enquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">{enquiries.length} total</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {enquiries.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No enquiries yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Villa</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{e.name}</TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${e.email}`}
                        className="text-primary hover:underline text-sm"
                      >
                        {e.email}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{e.villa || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{e.arrival || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{e.guests ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {e.message ? e.message.slice(0, 60) + (e.message.length > 60 ? "…" : "") : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
