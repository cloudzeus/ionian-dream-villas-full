import type { Metadata } from "next"
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
  description:
    "Three private villas on the western shore of Lefkada. Private pools, three bedrooms, quiet roads near the water.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${gfsDidot.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
