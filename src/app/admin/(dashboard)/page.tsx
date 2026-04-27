import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { HouseIcon, MailIcon, ImageIcon, MapPinIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const [villaCount, enquiryCount, newEnquiries, locationCount, mediaCount] = await Promise.all([
    prisma.villa.count(),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.location.count({ where: { published: true } }),
    prisma.mediaItem.count(),
  ])

  const recentEnquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const stats = [
    { label: "Villas", value: villaCount, href: "/admin/villas", icon: HouseIcon, color: "text-primary" },
    { label: "New Enquiries", value: newEnquiries, href: "/admin/enquiries", icon: MailIcon, color: newEnquiries > 0 ? "text-destructive" : "text-green-600" },
    { label: "All Enquiries", value: enquiryCount, href: "/admin/enquiries", icon: MailIcon, color: "text-muted-foreground" },
    { label: "Locations", value: locationCount, href: "/admin/locations", icon: MapPinIcon, color: "text-primary" },
    { label: "Media Files", value: mediaCount, href: "/admin/media", icon: ImageIcon, color: "text-muted-foreground" },
  ]

  const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "new") return "destructive"
    if (status === "replied") return "default"
    return "secondary"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ionian Dream Villas — Content Management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, href, icon: Icon, color }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent className="pb-4 px-4">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent enquiries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Enquiries</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/enquiries">View all →</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentEnquiries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No enquiries yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Villa</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnquiries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-muted-foreground">{e.email}</TableCell>
                    <TableCell className="text-muted-foreground">{e.villa || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{e.arrival || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {e.createdAt.toLocaleDateString()}
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
