import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import HeroSlideshow from "@/components/home/HeroSlideshow"
import MottosSection from "@/components/home/MottosSection"
import VillasSection from "@/components/home/VillasSection"
import MarqueeSection from "@/components/home/MarqueeSection"
import PlacesGrid from "@/components/home/PlacesGrid"
import ClosingSection from "@/components/home/ClosingSection"
import MotionInit from "@/components/chrome/MotionInit"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "home" })

  const [villas, locationRows, heroSlides] = await Promise.all([
    prisma.villa.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        translations: { where: { locale: locale as any } },
        images: { orderBy: { sortOrder: "asc" }, take: 5 },
        rates: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.location.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
      include: {
        translations: { where: { locale: locale as any } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const tones = ["sea", "sand", "stone", "sea", "sand", "stone"] as const
  const locations = locationRows.map((loc, i) => {
    const tr = loc.translations[0]
    return {
      slug: loc.slug,
      tone: tones[i % tones.length],
      translations: [{ name: tr?.name ?? loc.slug, nameLocal: tr?.nameLocal ?? undefined, kind: tr?.kind ?? "", short: tr?.short ?? "" }],
      images: loc.images[0] ? [{ url: loc.images[0].url }] : [],
    }
  })

  return (
    <>
      <MotionInit />
      <HeroSlideshow locale={locale} villas={villas} slides={heroSlides} />
      <MarqueeSection />
      <VillasSection
        villas={villas}
        locale={locale}
        t={{ heading: t("villasHeading"), subheading: t("villasSubheading"), viewVilla: t("viewVilla") }}
      />
      <MottosSection t={{
        mottos: [
          { eyebrow: t("mottos.0.eyebrow"), title: t("mottos.0.title"), body: t("mottos.0.body") },
          { eyebrow: t("mottos.1.eyebrow"), title: t("mottos.1.title"), body: t("mottos.1.body") },
          { eyebrow: t("mottos.2.eyebrow"), title: t("mottos.2.title"), body: t("mottos.2.body") },
        ],
      }} />
      <PlacesGrid locations={locations} locale={locale} />
      <ClosingSection locale={locale} t={{ greek: t("closingGreek"), en: t("closingEn"), reserve: t("reserve") }} />
    </>
  )
}
