import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import MotionInit from "@/components/chrome/MotionInit"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata, SITE_URL } from "@/lib/seo"
import JsonLd from "@/components/primitives/JsonLd"

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const [seo, location] = await Promise.all([
    getPageSeo(`location:${slug}`, locale),
    prisma.location.findUnique({
      where: { slug },
      select: {
        translations: { where: { locale: locale as any } },
        images: { where: { isCover: true }, take: 1 },
      },
    }),
  ])
  const tr = location?.translations[0]
  const cover = location?.images[0]
  const overriddenSeo = {
    ...seo,
    title: seo.title || (tr?.name ? `${tr.name} — Lefkada Island Guide · Ionian Dream Villas` : seo.title),
    description: seo.description || tr?.short || seo.description,
  }
  return await buildMetadata(overriddenSeo, {
    path: `/${locale}/lefkada/${slug}`,
    locale,
    image: cover?.url,
  })
}

export async function generateStaticParams() {
  const locations = await prisma.location.findMany({ where: { published: true }, select: { slug: true } })
  const locales = ["en", "el", "de"]
  return locales.flatMap(locale => locations.map(l => ({ locale, slug: l.slug })))
}

export default async function LocationDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: "lefkada" })

  const location = await prisma.location.findUnique({
    where: { slug, published: true },
    include: {
      translations: { where: { locale: locale as any } },
      images: { orderBy: { sortOrder: "asc" } },
      facts: {
        orderBy: { sortOrder: "asc" },
        include: { translations: { where: { locale: locale as any } } },
      },
    },
  })

  if (!location) notFound()

  const tr = location.translations[0]
  const coverImage = location.images.find(i => i.isCover) || location.images[0]
  const secondImage = location.images[1]
  const galleryImages = location.images.slice(2)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: tr?.name || slug,
    description: tr?.long || tr?.short || undefined,
    url: `${SITE_URL}/${locale}/lefkada/${slug}`,
    ...(coverImage ? { image: coverImage.url } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lefkada",
      addressRegion: "Ionian Islands",
      addressCountry: "GR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "38.7167",
      longitude: "20.6500",
    },
    isLocatedInPlace: {
      "@type": "AdministrativeArea",
      name: "Lefkada",
      containedInPlace: { "@type": "Country", name: "Greece" },
    },
    touristType: ["Beach", "Nature", "Sightseeing"],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <MotionInit />

      {/* Full-screen hero */}
      <section
        className="x-hero-section"
        style={{ position: "relative", height: "100vh", minHeight: 640, overflow: "hidden", color: "white" }}
      >
        <div
          className="x-hero-bg"
          style={{ position: "absolute", inset: "-15% 0", background: "linear-gradient(135deg, #1C3848 0%, #0e1e28 100%)" }}
        >
          {coverImage && (
            <Image
              src={coverImage.url}
              alt={coverImage.altEn || tr?.name || slug}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center 35%" }}
            />
          )}
        </div>

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,30,40,0.55) 0%, rgba(14,30,40,0.1) 40%, rgba(14,30,40,0.7) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(14,30,40,0.5) 0%, transparent 65%)", zIndex: 1 }} />

        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: "100px 48px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Link
            href={`/${locale}/lefkada`}
            className="x-hero-meta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: "var(--font-mono)", fontSize: 9,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)", textDecoration: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Island Guide
          </Link>
          <div className="x-hero-meta mono-label" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>
            Lefkada · Greece
          </div>
        </div>

        {/* Type + title */}
        <div style={{ position: "absolute", left: 48, right: "20%", bottom: "14vh", zIndex: 3 }}>
          <div className="x-hero-meta mono-label" style={{ marginBottom: 20, color: "var(--color-accent)", letterSpacing: "0.2em" }}>
            {tr?.kind || "Location"}
          </div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 0.93 }}>
            <div className="x-hero-line" style={{ fontSize: "clamp(56px, 9vw, 150px)", display: "block", overflow: "hidden" }}>
              {tr?.name || slug}
            </div>
          </h1>
          {tr?.nameLocal && (
            <div className="x-hero-meta" style={{ fontFamily: "var(--font-greek)", fontSize: 24, fontStyle: "italic", marginTop: 12, opacity: 0.85 }}>
              {tr.nameLocal}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", right: 48, bottom: 48, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }} className="x-hero-meta">
          <div style={{
            writingMode: "vertical-rl", fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
          }}>Scroll</div>
          <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "40%", background: "white", animation: "scrollLine 2s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* Large italic blurb */}
      <section className="x-fade" style={{ padding: "100px 48px", borderBottom: "1px solid var(--color-rule)" }}>
        <p style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: "clamp(24px, 3vw, 44px)",
          lineHeight: 1.35, maxWidth: 860, margin: 0,
          color: "var(--color-ink)", letterSpacing: "-0.01em",
        }}>
          {tr?.short}
        </p>
      </section>

      {/* Long description + sidebar */}
      <section className="x-fade x-location-about" style={{
        padding: "100px 48px",
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 96,
        alignItems: "start",
        borderBottom: "1px solid var(--color-rule)",
      }}>
        <div>
          <div className="mono-label" style={{ marginBottom: 32, color: "var(--color-accent)" }}>About this place</div>
          <p style={{ fontSize: 18, lineHeight: 1.9, color: "var(--color-ink-soft)", maxWidth: 640, margin: 0 }}>
            {tr?.long}
          </p>
        </div>

        <div>
          {secondImage && (
            <div className="x-clip-reveal" style={{ overflow: "hidden", marginBottom: 40 }}>
              <Image
                src={secondImage.url}
                alt={secondImage.altEn || tr?.name || slug}
                width={600}
                height={420}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}

          {/* Facts */}
          {location.facts.length > 0 && (
            <div style={{ borderTop: "1px solid var(--color-rule)", paddingTop: 32 }}>
              <div className="mono-label" style={{ marginBottom: 24 }}>Details</div>
              {location.facts.map(fact => {
                const ft = fact.translations[0]
                return ft ? (
                  <div key={fact.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--color-rule)" }}>
                    <div className="mono-label" style={{ marginBottom: 6 }}>{ft.label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic" }}>{ft.value}</div>
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="x-fade x-location-gallery" style={{ padding: "100px 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 48 }}>
            <div className="mono-label" style={{ color: "var(--color-accent)" }}>Gallery</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-ink-soft)" }}>
              {galleryImages.length} images
            </div>
          </div>
          <div className="x-location-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {galleryImages.map((img, i) => (
              <div key={img.id} style={{
                overflow: "hidden",
                aspectRatio: i % 5 === 0 ? "3/4" : i % 3 === 0 ? "4/3" : "3/2",
              }}>
                <Image
                  src={img.url}
                  alt={img.altEn || tr?.name || slug}
                  width={600}
                  height={450}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  className="place-card-img"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dark CTA */}
      <section className="x-fade x-location-cta" style={{
        background: "var(--color-bg-deep)", color: "white",
        padding: "120px 48px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        <div>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>Ionian Dream</div>
          <p style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "clamp(28px, 3.5vw, 52px)",
            lineHeight: 1.2, margin: "0 0 40px",
            color: "rgba(247,244,238,0.9)", letterSpacing: "-0.01em",
          }}>
            Stay close. Explore further.
          </p>
          <Link
            href={`/${locale}/villas`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 16,
              background: "var(--color-accent)", color: "var(--color-bg-deep)",
              padding: "18px 36px",
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.2em", textTransform: "uppercase",
              textDecoration: "none",
            }}
            className="link-hover-light"
          >
            View the villas
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Link
            href={`/${locale}/lefkada`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 4,
              alignSelf: "flex-start",
            }}
            className="link-hover-light"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t("backToGuide")}
          </Link>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)", marginTop: 8,
          }}>
            38°43′N · 20°39′E · Ionian Sea
          </div>
        </div>
      </section>
    </>
  )
}
