"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  HomeIcon,
  HouseIcon,
  MapPinIcon,
  BarChartIcon,
  MailIcon,
  ImageIcon,
  SettingsIcon,
  UsersIcon,
  HelpCircleIcon,
  SearchIcon,
  PhoneIcon,
  ScrollTextIcon,
} from "lucide-react"

import { NavMain } from "@/components/admin/NavMain"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const NavUser = dynamic(
  () => import("@/components/admin/NavUser").then((m) => m.NavUser),
  { ssr: false, loading: () => <div className="h-12" /> }
)

const navItems = [
  { title: "Dashboard", url: "/admin", icon: HomeIcon },
  { title: "Villas", url: "/admin/villas", icon: HouseIcon },
  { title: "Locations", url: "/admin/locations", icon: MapPinIcon },
  { title: "Rates", url: "/admin/rates", icon: BarChartIcon },
  { title: "Enquiries", url: "/admin/enquiries", icon: MailIcon },
  { title: "Media", url: "/admin/media", icon: ImageIcon },
  { title: "SEO", url: "/admin/seo", icon: SearchIcon },
  { title: "Contact & Email", url: "/admin/contact-info", icon: PhoneIcon },
  { title: "Legal Pages", url: "/admin/legal", icon: ScrollTextIcon },
  { title: "Users", url: "/admin/users", icon: UsersIcon },
  { title: "Settings", url: "/admin/settings", icon: SettingsIcon },
]

const navSecondary = [
  { title: "Help", url: "#", icon: HelpCircleIcon },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string }
}) {
  const resolvedUser = user ?? { name: "Admin", email: "", avatar: "" }
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-2 h-auto">
              <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  ID
                </div>
                {state === "expanded" && (
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-sidebar-foreground">Ionian Dream</span>
                    <span className="text-[11px] text-sidebar-foreground/50">Admin Console</span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={resolvedUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
