"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", exact: true, icon: "▣" },
      { href: "/admin/villas", label: "Villas", icon: "⌂" },
      { href: "/admin/locations", label: "Locations", icon: "◎" },
      { href: "/admin/rates", label: "Rates", icon: "◈" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "✉" },
      { href: "/admin/media", label: "Media library", icon: "⊞" },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/settings", label: "Settings", icon: "⚙" },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 4 }}>
          <div style={{
            padding: "16px 20px 6px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#475569",
            fontFamily: "system-ui, sans-serif",
          }}>
            {group.label}
          </div>
          {group.items.map(({ href, label, exact, icon }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 20px",
                  margin: "1px 8px",
                  borderRadius: 6,
                  color: active ? "white" : "#94a3b8",
                  textDecoration: "none",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  background: active ? "#2563eb" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 14, opacity: active ? 1 : 0.7 }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
