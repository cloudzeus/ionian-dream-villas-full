import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/admin/AppSidebar"
import { SiteHeader } from "@/components/admin/SiteHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return (
    <div className="admin-root min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <AppSidebar
          user={{
            name: session.user?.name || "Admin",
            email: session.user?.email || "",
            avatar: (session.user as { image?: string })?.image || "",
          }}
        />
        <SidebarInset>
          <SiteHeader />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="top-right" />
    </div>
  )
}
