import { prisma } from "@/lib/prisma"
import HeroSlidesManager from "@/components/admin/HeroSlidesManager"
import SiteTextManager from "@/components/admin/SiteTextManager"

export default async function SettingsPage() {
  const [slides, settings] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findMany(),
  ])

  const siteText = Object.fromEntries(settings.map(s => [s.key, s.value]))

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
