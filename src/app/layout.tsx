import type { Metadata, Viewport } from "next"
import { getLocale } from "next-intl/server"
import {
  Cormorant_Garamond,
  GFS_Didot,
  Inter,
  JetBrains_Mono,
} from "next/font/google"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--loaded-display",
  display: "swap",
})
const gfsDidot = GFS_Didot({
  subsets: ["greek"],
  weight: ["400"],
  style: ["normal"],
  variable: "--loaded-greek",
  display: "swap",
})
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--loaded-body",
  display: "swap",
})
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--loaded-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Ionian Dream Villas — Lefkada, Greece",
    template: "%s · Ionian Dream Villas",
  },
  description: "Three private villas on the western shore of Lefkada. Private pools, three bedrooms, quiet roads near the water.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ionian-dream-villas.com"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1E28" },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${gfsDidot.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
