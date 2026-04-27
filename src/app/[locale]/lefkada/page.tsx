import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import Image from "next/image"
import MotionInit from "@/components/chrome/MotionInit"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const seo = await getPageSeo("lefkada", locale)
  const cover = await prisma.locationImage.findFirst({ where: { isCover: true }, orderBy: { sortOrder: "asc" } })
  return await buildMetadata(seo, { path: `/${locale}/lefkada`, locale, image: cover?.url })
}

export default async function LefkadaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "lefkada" })

  const locations = await prisma.location.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: locale as any } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  })

  const featured = locations[0]
  const rest = locations.slice(1)

  return (
    <>
      <MotionInit />

      {/* Page header */}
      <section className="x-page-header-dark" style={{ padding: "160px 48px 100px", background: "var(--color-bg-deep)", color: "white", overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", right: 48, bottom: -40,
          fontFamily: "var(--font-display)", fontSize: "clamp(160px, 28vw, 400px)",
          fontWeight: 300, fontStyle: "italic",
          color: "rgba(255,255,255,0.04)",
          lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>Λ</div>

        <div className="x-stagger" style={{ maxWidth: 760, position: "relative", zIndex: 1 }}>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 24 }}>Island Guide · Lefkada</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(56px, 9vw, 140px)",
            lineHeight: 0.93, letterSpacing: "-0.025em", fontWeight: 300, margin: "0 0 32px",
          }}>
            {t("heading")}<br /><em>{t("subheading")}</em>
          </h1>
          <p style={{
            fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.45)",
            maxWidth: 560, margin: 0,
          }}>
            Beaches, villages, and hidden coves — everything the island keeps for those who venture beyond the shoreline.
          </p>
        </div>
      </section>

      {/* Featured location — editorial row */}
      {featured && (() => {
        const tr = featured.translations[0]
        const cover = featured.images[0]
        return (
          <Link
            href={`/${locale}/lefkada/${featured.slug}`}
            className="x-villa-row"
            style={{
              display: "grid",
              gridTemplateColumns: "60% 40%",
              minHeight: "72vh",
              borderTop: "1px solid var(--color-rule)",
              textDecoration: "none",
              color: "var(--color-ink)",
            }}
          >
            {/* Image */}
            <div style={{ position: "relative", overflow: "hidden", background: "#1C2A33" }}>
              {cover ? (
                <Image
                  src={cover.url}
                  alt={cover.altEn || tr?.name || featured.slug}
                  fill
                  priority
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="60vw"
                  className="place-card-img"
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1C3848 0%, #0e1e28 100%)" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(14,30,40,0.4) 100%)" }} />
              <div style={{
                position: "absolute", top: 32, left: 32,
                fontFamily: "var(--font-mono)", fontSize: 9,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                background: "rgba(14,30,40,0.5)",
                padding: "6px 12px",
                backdropFilter: "blur(8px)",
              }}>Featured</div>
            </div>

            {/* Content */}
            <div style={{
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "72px 56px",
              background: "var(--color-bg-alt)",
            }}>
              <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>
                {tr?.kind || "Location"}
              </div>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5vw, 72px)",
                lineHeight: 0.95, letterSpacing: "-0.02em", fontWeight: 300,
                margin: "0 0 10px",
              }}>
                {tr?.name || featured.slug}
              </h2>
              {tr?.nameLocal && (
                <div style={{ fontFamily: "var(--font-greek)", fontSize: 20, fontStyle: "italic", color: "var(--color-sea)", marginBottom: 24 }}>
                  {tr.nameLocal}
                </div>
              )}
              <p style={{
                fontSize: 17, lineHeight: 1.8, color: "var(--color-ink-soft)",
                marginBottom: 40, maxWidth: 400,
              }}>
                {tr?.short}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 12, alignSelf: "flex-start",
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--color-ink)",
                borderBottom: "1px solid currentColor", paddingBottom: 4,
              }} className="link-hover-accent">
                {t("readMore")}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </Link>
        )
      })()}

      {/* Rest — 3-col magazine grid */}
      {rest.length > 0 && (
        <section className="x-places-grid-section" style={{ padding: "0 48px 120px" }}>
          <div className="x-places-grid-inner" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            marginTop: "1px",
            background: "var(--color-rule)",
          }}>
            {rest.map((loc, i) => {
              const tr = loc.translations[0]
              const cover = loc.images[0]
              return (
                <Link
                  key={loc.id}
                  href={`/${locale}/lefkada/${loc.slug}`}
                  className="x-place-card x-fade"
                  style={{
                    textDecoration: "none", color: "var(--color-ink)",
                    display: "flex", flexDirection: "column",
                    background: "var(--color-bg)",
                  }}
                >
                  {/* Image */}
                  <div style={{ overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={cover.altEn || tr?.name || loc.slug}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="33vw"
                        className="place-card-img"
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, background: "var(--color-bg-deep)" }} />
                    )}
                    <div style={{
                      position: "absolute", top: 20, left: 20,
                      fontFamily: "var(--font-mono)", fontSize: 9,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      color: "white", background: "rgba(14,30,40,0.6)",
                      padding: "5px 10px", backdropFilter: "blur(6px)",
                    }}>{tr?.kind || "Location"}</div>
                    <div style={{
                      position: "absolute", bottom: 16, right: 20,
                      fontFamily: "var(--font-display)", fontSize: 48,
                      fontWeight: 300, fontStyle: "italic",
                      color: "rgba(255,255,255,0.2)", lineHeight: 1,
                    }}>0{i + 2}</div>
                  </div>

                  {/* Text */}
                  <div style={{ padding: "28px 32px 36px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(24px, 2.5vw, 36px)",
                      lineHeight: 1.0, letterSpacing: "-0.015em", fontWeight: 300,
                      margin: "0 0 16px",
                    }}>
                      {tr?.name || loc.slug}
                    </h3>
                    <p style={{
                      fontSize: 15, lineHeight: 1.75, color: "var(--color-ink-soft)",
                      margin: "0 0 24px", flex: 1,
                    }}>
                      {tr?.short}
                    </p>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontFamily: "var(--font-mono)", fontSize: 9,
                      letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "var(--color-accent)",
                    }}>
                      {t("readMore")}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {locations.length === 0 && (
        <section style={{ padding: "120px 48px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontStyle: "italic", color: "var(--color-ink-soft)" }}>
            Coming soon — the island guide is being written.
          </p>
        </section>
      )}
    </>
  )
}
