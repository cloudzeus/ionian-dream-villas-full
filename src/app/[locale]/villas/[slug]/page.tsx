import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata, SITE_URL, SITE_NAME } from "@/lib/seo"
import Image from "next/image"
import Link from "next/link"
import MotionInit from "@/components/chrome/MotionInit"
import VillaBookingButton from "@/components/villa/VillaBookingButton"
import VillaGallery from "@/components/villa/VillaGallery"
import JsonLd from "@/components/primitives/JsonLd"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const [seo, villa] = await Promise.all([
    getPageSeo(`villa:${slug}`, locale),
    prisma.villa.findUnique({
      where: { slug },
      select: {
        translations: { where: { locale: locale as any }, select: { name: true, blurb: true } },
        images: { where: { isCover: true }, take: 1, select: { url: true } },
      },
    }),
  ])
  const tr = villa?.translations[0]
  const image = villa?.images[0]?.url
  // Use DB seo if it has real content, else fall back to villa content
  if (!seo.title.includes("Ionian Dream Villas") && tr) {
    seo.title = seo.title || `${tr.name} — Luxury Villa · Lefkada, Greece`
    seo.description = seo.description || tr.blurb?.slice(0, 155) || ""
  }
  return await buildMetadata(seo, { path: `/${locale}/villas/${slug}`, locale, image })
}

export async function generateStaticParams() {
  return [
    { locale: "en", slug: "castro" }, { locale: "en", slug: "jira" }, { locale: "en", slug: "milos" },
    { locale: "el", slug: "castro" }, { locale: "el", slug: "jira" }, { locale: "el", slug: "milos" },
    { locale: "de", slug: "castro" }, { locale: "de", slug: "jira" }, { locale: "de", slug: "milos" },
  ]
}

export default async function VillaDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: "villa" })

  const villa = await prisma.villa.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: locale as any } },
      images: { orderBy: { sortOrder: "asc" } },
      rooms: {
        orderBy: { sortOrder: "asc" },
        include: { translations: { where: { locale: locale as any } }, beds: true },
      },
      amenities: { include: { translations: { where: { locale: locale as any } } } },
      rates: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!villa) notFound()

  const tr = villa.translations[0]
  const coverImage = villa.images.find(i => i.isCover) || villa.images[0]

  const allVillas = await prisma.villa.findMany({
    where: { published: true, NOT: { slug } },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: locale as any } },
      images: { where: { isCover: true }, take: 1 },
    },
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: tr?.name || slug,
    description: tr?.blurb,
    url: `${SITE_URL}/${locale}/villas/${slug}`,
    image: coverImage?.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lefkada",
      addressCountry: "GR",
    },
    containedInPlace: {
      "@type": "TouristDestination",
      name: "Lefkada, Ionian Islands, Greece",
    },
    amenityFeature: villa.amenities.slice(0, 8).map(a => ({
      "@type": "LocationFeatureSpecification",
      name: a.translations[0]?.label || a.slug,
      value: true,
    })),
    offers: villa.rates.map(r => ({
      "@type": "Offer",
      name: r.season,
      price: r.weekly,
      priceCurrency: "EUR",
      unitText: "WEEK",
    })),
    numberOfRooms: villa.bedrooms,
    permittedUsage: "Vacation rental",
    brand: { "@type": "Brand", name: SITE_NAME },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <MotionInit />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="x-hero-section" style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden", color: "white" }}>
        <div className="x-hero-bg" style={{ position: "absolute", inset: "-15% 0", background: "#1C2A33" }}>
          {coverImage && (
            <Image src={coverImage.url} alt={tr?.name || slug} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 30%" }} />
          )}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,30,40,0.55) 0%, rgba(14,30,40,0.1) 40%, rgba(14,30,40,0.75) 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(14,30,40,0.5) 0%, transparent 55%)", zIndex: 1 }} />

        {/* Top bar */}
        <div className="x-hero-topbar" style={{ position: "absolute", top: 100, left: 48, right: 48, zIndex: 3, display: "flex", justifyContent: "space-between" }}>
          <div className="x-hero-meta mono-label" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>Villa · Lefkada · Greece</div>
          <div className="x-hero-meta mono-label" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>{tr?.region}</div>
        </div>

        {/* Title */}
        <div className="x-hero-text" style={{ position: "absolute", left: 48, right: "30%", bottom: "20vh", zIndex: 3 }}>
          <h1 style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 0.92, fontSize: "clamp(56px, 10vw, 180px)" }}>
            <span className="x-hero-line" style={{ display: "block" }}>{tr?.name || slug}</span>
          </h1>
          {tr?.nameLocal && (
            <div className="x-hero-line" style={{ fontFamily: "var(--font-greek)", fontSize: "clamp(22px, 3vw, 40px)", fontStyle: "italic", opacity: 0.8 }}>
              {tr.nameLocal}
            </div>
          )}
        </div>

        {/* Booking CTA */}
        <div className="x-hero-meta" style={{ position: "absolute", right: 48, bottom: "20vh", zIndex: 3 }}>
          <VillaBookingButton villaSlug={slug} villaName={tr?.name || slug} dark />
        </div>

        {/* Scroll line */}
        <div className="x-hero-meta" style={{ position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ writingMode: "vertical-rl", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Scroll</div>
          <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.2)", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "40%", background: "white", animation: "scrollLine 2s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ── SPECS STRIP ──────────────────────────────────────────────────── */}
      <section className="x-specs-strip" style={{ background: "var(--color-bg-deep)", color: "white" }}>
        <div className="x-stagger x-specs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: "0 48px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            [t("maxAdults"), `${villa.guests} guests`],
            [t("bedrooms"), `${villa.bedrooms} bedrooms`],
            [t("sqm"), `${villa.sqm} m²`],
            [t("pool"), tr?.pool || "Private pool"],
            [t("views"), tr?.view?.split(" · ")[0] || "Sea & olive"],
          ].map(([k, val]) => (
            <div key={k} style={{ padding: "32px 0", borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{k}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic", color: "rgba(255,255,255,0.88)" }}>{val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section className="x-villa-about" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "70vh" }}>
        <div className="x-fade x-villa-about-text" style={{ padding: "96px 64px 96px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>{t("aboutVilla")}</div>
          <div style={{ fontFamily: "var(--font-greek)", fontSize: "clamp(15px, 1.8vw, 22px)", color: "var(--color-sea)", marginBottom: 28, fontStyle: "italic" }}>
            Λευκάδα · {tr?.nameLocal}
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 2.2vw, 30px)", lineHeight: 1.38, fontStyle: "italic", margin: "0 0 32px" }}>
            {tr?.blurb}
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: "var(--color-ink-soft)", maxWidth: 520 }}>
            {tr?.description}
          </p>
        </div>
        <div className="x-clip-reveal x-villa-about-img" style={{ position: "relative", background: "#c0cdd4", minHeight: 520 }}>
          {villa.images[1] && (
            <Image src={villa.images[1].url} alt="" fill sizes="50vw" style={{ objectFit: "cover" }} />
          )}
        </div>
      </section>

      {/* ── ROOMS + RIGHT PANEL ───────────────────────────────────────────── */}
      <section className="x-rooms-section" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", borderTop: "1px solid var(--color-rule)" }}>
        {/* Rooms */}
        <div className="x-fade x-rooms-panel" style={{ padding: "80px 64px 80px 48px", borderRight: "1px solid var(--color-rule)" }}>
          <div className="mono-label" style={{ marginBottom: 36, color: "var(--color-accent)" }}>{t("rooms")} · {villa.bedrooms} bedrooms</div>
          {villa.rooms.map((r, i) => {
            const rtr = r.translations[0]
            const bedStr = r.beds.map(b => `${b.quantity}× ${b.type}`).join(", ")
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "0 20px", padding: "24px 0", borderTop: "1px solid var(--color-rule)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontStyle: "italic", color: "rgba(28,42,51,0.15)", lineHeight: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>{rtr?.name || `Room ${i + 1}`}</div>
                  {rtr?.note && <div style={{ fontSize: 14, color: "var(--color-ink-soft)", lineHeight: 1.6, marginBottom: 8 }}>{rtr.note}</div>}
                  {bedStr && <div className="mono-label" style={{ color: "var(--color-sea)" }}>{bedStr}</div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Amenities, Views, Rates */}
        <div className="x-fade x-amenities-panel" style={{ padding: "80px 48px" }}>
          {tr?.view && (
            <div style={{ marginBottom: 48 }}>
              <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>{t("views")}</div>
              {tr.view.split(" · ").map((v, i) => (
                <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--color-rule)", fontSize: 15, display: "flex", gap: 16, alignItems: "center" }}>
                  <span className="mono-label" style={{ color: "rgba(28,42,51,0.25)", minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}

          {villa.amenities.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>{t("amenities")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {villa.amenities.map((a) => {
                  const atr = a.translations[0]
                  return (
                    <div key={a.id} style={{ padding: "11px 0", borderBottom: "1px solid var(--color-rule)", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
                      {a.icon && <span>{a.icon}</span>}
                      <span style={{ color: "var(--color-ink-soft)" }}>{atr?.label || a.slug}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {villa.rates.length > 0 && (
            <div>
              <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>Season rates</div>
              {villa.rates.map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: "1px solid var(--color-rule)" }}>
                  <span style={{ fontSize: 14, color: "var(--color-ink-soft)" }}>{r.season}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontStyle: "italic" }}>
                    €{r.weekly.toLocaleString()}
                    <span style={{ fontSize: 12, fontStyle: "normal", color: "var(--color-ink-soft)", marginLeft: 4 }}>/week</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      {villa.images.length > 1 && (
        <section style={{ paddingTop: 4 }}>
          <VillaGallery images={villa.images} villaName={tr?.name || slug} />
        </section>
      )}

      {/* ── BOOK CTA ──────────────────────────────────────────────────────── */}
      <section className="x-fade x-book-cta" style={{ background: "var(--color-bg-deep)", color: "white", padding: "120px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <div className="mono-label" style={{ marginBottom: 20, color: "var(--color-accent)" }}>Book your stay</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 5.5vw, 90px)", lineHeight: 0.95, letterSpacing: "-0.025em", fontWeight: 300, margin: "0 0 20px" }}>
            {t("bookCta")} <em>{tr?.name}.</em>
          </h2>
          {villa.rates[0] && (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontStyle: "italic", color: "rgba(255,255,255,0.45)" }}>
              From €{villa.rates[0].weekly.toLocaleString()} / week
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 32 }}>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 360 }}>
            Minimum 7 nights. Private pool, full kitchen, and the whole island on your doorstep.
          </p>
          <VillaBookingButton villaSlug={slug} villaName={tr?.name || slug} dark />
        </div>
      </section>

      {/* ── OTHER VILLAS ──────────────────────────────────────────────────── */}
      {allVillas.length > 0 && (
        <section className="x-other-villas" style={{ padding: "80px 48px", borderTop: "1px solid var(--color-rule)" }}>
          <div className="mono-label" style={{ marginBottom: 40, color: "var(--color-accent)" }}>{t("otherVillas")}</div>
          <div className="x-other-villas-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${allVillas.length}, 1fr)`, gap: 32 }}>
            {allVillas.map((v) => {
              const vtr = v.translations[0]
              const vImg = v.images[0]
              return (
                <Link key={v.slug} href={`/${locale}/villas/${v.slug}`} className="villa-thumb" style={{ textDecoration: "none", color: "var(--color-ink)", display: "block" }}>
                  <div style={{ position: "relative", height: 280, overflow: "hidden", marginBottom: 20, background: "#1C2A33" }}>
                    {vImg && (
                      <Image src={vImg.url} alt={vtr?.name || v.slug} fill sizes="33vw"
                        className="villa-thumb-img"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 300, marginBottom: 4 }}>{vtr?.name || v.slug}</div>
                  <div style={{ fontFamily: "var(--font-greek)", fontSize: 16, fontStyle: "italic", color: "var(--color-sea)", marginBottom: 8 }}>{vtr?.nameLocal}</div>
                  <div className="mono-label" style={{ color: "var(--color-accent)" }}>View villa →</div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

    </>
  )
}
