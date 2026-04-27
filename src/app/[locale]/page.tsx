import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import HeroSlideshow from "@/components/home/HeroSlideshow"
import MottosSection from "@/components/home/MottosSection"
import VillasSection from "@/components/home/VillasSection"
import MarqueeSection from "@/components/home/MarqueeSection"
import PlacesGrid from "@/components/home/PlacesGrid"
import ClosingSection from "@/components/home/ClosingSection"
import MotionInit from "@/components/chrome/MotionInit"
import { getPosts, imgUrl } from "@/lib/strapi"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "home" })

  const [villas, strapiPosts, heroSlides] = await Promise.all([
    prisma.villa.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        translations: { where: { locale: locale as any } },
        images: { orderBy: { sortOrder: "asc" }, take: 5 },
        rates: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    getPosts(locale),
    prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const locations = strapiPosts.slice(0, 6).map((post, i) => ({
    slug: post.slug,
    tone: ["sea", "sand", "stone", "sea", "sand", "stone"][i] as "sea" | "sand" | "stone",
    translations: [{ name: post.title, nameLocal: post.title, kind: post.type, short: post.shordDescription }],
    images: post.images[0] ? [{ url: imgUrl(post.images[0].formats?.large?.url ?? post.images[0].url) }] : [],
  }))

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
