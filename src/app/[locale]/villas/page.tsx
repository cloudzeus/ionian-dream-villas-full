import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata } from "@/lib/seo"
import Link from "next/link"
import Image from "next/image"
import MotionInit from "@/components/chrome/MotionInit"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const seo = await getPageSeo("villas", locale)
  const cover = await prisma.villaImage.findFirst({ where: { isCover: true }, orderBy: { sortOrder: "asc" } }).catch(() => null)
  return await buildMetadata(seo, { path: `/${locale}/villas`, locale, image: cover?.url })
}

export default async function VillasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "villa" })

  const villas = await prisma.villa.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: locale as any } },
      images: { orderBy: { sortOrder: "asc" }, take: 3 },
      rates: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  }).catch(() => [])

  return (
    <>
      <MotionInit />

      {/* Page header */}
      <section className="x-page-header-dark" style={{ padding: "160px 48px 80px", background: "var(--color-bg-deep)", color: "white" }}>
        <div className="x-stagger" style={{ maxWidth: 700 }}>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 24 }}>Ionian Dream · Three villas</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(56px, 9vw, 140px)", lineHeight: 0.93, letterSpacing: "-0.025em", fontWeight: 300, margin: "0 0 24px" }}>
            Villas.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Three private villas on the western shore of Lefkada.
          </p>
        </div>
      </section>

      {/* Villa rows */}
      <section>
        {villas.map((v, i) => {
          const tr = v.translations[0]
          const cover = v.images.find(img => img.isCover) || v.images[0]
          const extras = v.images.filter(img => !img.isCover).slice(0, 2)
          const even = i % 2 === 0

          return (
            <div
              key={v.slug}
              className="x-villa-row"
              style={{
                display: "grid",
                gridTemplateColumns: even ? "60% 40%" : "40% 60%",
                minHeight: "85vh",
                borderTop: i === 0 ? "none" : "1px solid var(--color-rule)",
              }}
            >
              {/* Image panel */}
              <div
                className="x-villa-img"
                style={{ order: even ? 0 : 1, position: "relative", overflow: "hidden", background: "#1c2a33" }}
              >
                {cover ? (
                  <Image src={cover.url} alt={tr?.name || v.slug} fill style={{ objectFit: "cover" }} sizes="60vw" />
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, #1C3848 0%, #0e1e28 100%)` }} />
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(14,30,40,0.5) 100%)" }} />
                {/* Villa index */}
                <div style={{ position: "absolute", top: 32, left: 32, fontFamily: "var(--font-display)", fontSize: "clamp(80px, 12vw, 180px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.08)", lineHeight: 1, userSelect: "none" }}>
                  0{i + 1}
                </div>
                {/* Extra thumbnails */}
                {extras.length > 0 && (
                  <div style={{ position: "absolute", bottom: 24, right: 24, display: "flex", gap: 8 }}>
                    {extras.map((img, j) => (
                      <div key={j} style={{ width: 80, height: 56, overflow: "hidden" }}>
                        <Image src={img.url} alt="" width={80} height={56} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content panel */}
              <div
                className="x-villa-content"
                style={{
                  order: even ? 1 : 0,
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: "72px 56px",
                  background: even ? "var(--color-bg)" : "var(--color-bg-alt)",
                }}
              >
                <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>{tr?.region || "Lefkada · Greece"}</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(42px, 5.5vw, 80px)", lineHeight: 0.94, letterSpacing: "-0.02em", fontWeight: 300, margin: "0 0 8px" }}>
                  {tr?.name || v.slug}
                </h2>
                {tr?.nameLocal && (
                  <div style={{ fontFamily: "var(--font-greek)", fontSize: 20, fontStyle: "italic", color: "var(--color-sea)", marginBottom: 32 }}>
                    {tr.nameLocal}
                  </div>
                )}
                <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--color-ink-soft)", marginBottom: 40, maxWidth: 400 }}>
                  {tr?.blurb}
                </p>

                {/* Specs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px", marginBottom: 48, paddingTop: 24, borderTop: "1px solid var(--color-rule)" }}>
                  {[
                    ["Bedrooms", `${v.bedrooms}`],
                    ["Guests", `${v.guests}`],
                    ["Area", `${v.sqm} m²`],
                    ...(v.rates[0] ? [["From", `€${v.rates[0].weekly.toLocaleString()}/wk`]] : []),
                  ].map(([k, val]) => (
                    <div key={k}>
                      <div className="mono-label" style={{ marginBottom: 6 }}>{k}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic" }}>{val}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/${locale}/villas/${v.slug}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 12, alignSelf: "flex-start",
                    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "var(--color-ink)", textDecoration: "none",
                    borderBottom: "1px solid currentColor", paddingBottom: 4,
                    transition: "color 0.25s ease",
                  }}
                  className="link-hover-accent"
                >
                  View villa
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
