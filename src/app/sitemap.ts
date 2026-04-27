import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://ionian-dream-villas.com"
const LOCALES = ["en", "el", "de"] as const

function url(path: string, priority: number, changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"]): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map(l => [l, `${BASE}/${l}${path.replace(/^\/[a-z]{2}/, "")}`])
      ),
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [villas, locations] = await Promise.all([
    prisma.villa.findMany({ where: { published: true }, select: { slug: true } }),
    prisma.location.findMany({ where: { published: true }, select: { slug: true } }),
  ])

  const staticPages = LOCALES.flatMap(l => [
    url(`/${l}`, 1.0, "weekly"),
    url(`/${l}/villas`, 0.9, "weekly"),
    url(`/${l}/lefkada`, 0.8, "weekly"),
    url(`/${l}/rates`, 0.7, "monthly"),
    url(`/${l}/contact`, 0.6, "monthly"),
  ])

  const villaPages = LOCALES.flatMap(l =>
    villas.map(v => url(`/${l}/villas/${v.slug}`, 0.95, "monthly"))
  )

  const locationPages = LOCALES.flatMap(l =>
    locations.map(loc => url(`/${l}/lefkada/${loc.slug}`, 0.75, "monthly"))
  )

  return [...staticPages, ...villaPages, ...locationPages]
}
