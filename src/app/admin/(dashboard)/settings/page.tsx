import { prisma } from "@/lib/prisma"
import HeroSlidesManager from "@/components/admin/HeroSlidesManager"
import SiteTextManager from "@/components/admin/SiteTextManager"
import en from "@/messages/en.json"
import el from "@/messages/el.json"
import de from "@/messages/de.json"

// Flatten nested JSON into dot-notation keys: { home: { villasHeading: "Villas" } } → { "home.villasHeading": "Villas" }
function flatten(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === "string") {
      out[key] = v
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          Object.assign(out, flatten(item, `${key}.${i}`))
        }
      })
    } else if (typeof v === "object" && v !== null) {
      Object.assign(out, flatten(v, key))
    }
  }
  return out
}

export default async function SettingsPage() {
  const [slides, settings] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findMany(),
  ])

  // Build defaults from JSON files so every field shows its current value
  const defaults: Record<string, string> = {}
  for (const [locale, messages] of [["en", en], ["el", el], ["de", de]] as const) {
    const flat = flatten(messages as Record<string, any>)
    for (const [dotKey, val] of Object.entries(flat)) {
      defaults[`${locale}:${dotKey}`] = val
    }
  }

  // DB values override JSON defaults
  const dbValues = Object.fromEntries(settings.map(s => [s.key, s.value]))
  const siteText = { ...defaults, ...dbValues }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage site-wide configuration</p>
      </div>
      <HeroSlidesManager initialSlides={slides} />
      <SiteTextManager initialValues={siteText} />
    </div>
  )
}
