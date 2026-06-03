import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import UsersManager from "@/components/admin/UsersManager"

export default async function UsersPage() {
  const session = await auth()
  const current = session?.user as { id?: string; role?: string } | undefined
  const isAdmin = current?.role === "ADMIN"

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } })
  const rows = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} system user{rows.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isAdmin ? (
        <div className="space-y-4">
          <UsersManager users={rows} currentUserId={current?.id ?? ""} />
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Only administrators can manage users.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
