import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata } from "@/lib/seo"
import Link from "next/link"
import Image from "next/image"
import MotionInit from "@/components/chrome/MotionInit"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const seo = await getPageSeo("rates", locale)
  return buildMetadata(seo, { path: `/${locale}/rates`, locale })
}

const RATE_TERMS: Record<string, string> = {
  "Deposit": "A 25% deposit secures your week; the balance is due thirty days before arrival. Bank transfer or major card.",
  "Included": "Linen, towels, mid-week refresh, welcome basket from the garden, daily pool service, parking, Wi-Fi.",
  "Cleaning": "A €180 end-of-stay cleaning fee applies. Daily housekeeping can be arranged on request.",
  "Minimum stay": "Seven nights from late June through early September. Five nights in shoulder season.",
}

export default async function RatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "rates" })

  const villas = await prisma.villa.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale: locale as any } },
      rates: { orderBy: { sortOrder: "asc" } },
      images: { where: { isCover: true }, take: 1 },
    },
  })

  return (
    <>
      <MotionInit />

      {/* Page header */}
      <section style={{ padding: "160px 48px 100px", background: "var(--color-bg-deep)", color: "white", position: "relative", overflow: "hidden" }}>
        {/* Ghost text */}
        <div style={{
          position: "absolute", right: 32, bottom: -60,
          fontFamily: "var(--font-display)", fontSize: "clamp(140px, 24vw, 340px)",
          fontWeight: 300, fontStyle: "italic",
          color: "rgba(255,255,255,0.04)",
          lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>€</div>

        <div className="x-stagger" style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 24 }}>Lefkada · Apr — Oct</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(64px, 10vw, 150px)",
            lineHeight: 0.93, letterSpacing: "-0.025em", fontWeight: 300, margin: "0 0 32px",
          }}>
            {t("heading")}<br /><em>{t("subheading")}</em>
          </h1>
          <p style={{
            fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.4)",
            maxWidth: 520, margin: 0,
          }}>
            Seven nights minimum. Private pools. All rates in euros, inclusive of VAT.
          </p>
        </div>
      </section>

      {/* Villa rate sections */}
      {villas.map((v, vi) => {
        const tr = v.translations[0]
        const cover = v.images[0]

        return (
          <section
            key={v.slug}
            className="x-fade"
            style={{
              borderTop: "1px solid var(--color-rule)",
              padding: "100px 48px",
              background: vi % 2 === 0 ? "var(--color-bg)" : "var(--color-bg-alt)",
            }}
          >
            {/* Villa header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: cover ? "1fr auto" : "1fr",
              gap: 60,
              alignItems: "start",
              marginBottom: 64,
            }}>
              <div>
                <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>
                  Villa 0{vi + 1}
                </div>
                <h2 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(48px, 6vw, 96px)",
                  lineHeight: 0.93, letterSpacing: "-0.025em", fontWeight: 300,
                  margin: "0 0 8px",
                }}>
                  {tr?.name || v.slug}
                </h2>
                {tr?.nameLocal && (
                  <div style={{
                    fontFamily: "var(--font-greek)", fontSize: 22,
                    fontStyle: "italic", color: "var(--color-sea)",
                  }}>
                    {tr.nameLocal}
                  </div>
                )}
              </div>

              {/* Cover image thumbnail */}
              {cover && (
                <div style={{ width: 200, height: 140, overflow: "hidden", flexShrink: 0 }}>
                  <Image
                    src={cover.url}
                    alt={tr?.name || v.slug}
                    width={200}
                    height={140}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            {/* Rate rows */}
            <div style={{ borderTop: "1px solid var(--color-rule)" }}>
              {/* Header row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 180px 180px",
                padding: "16px 0",
                borderBottom: "1px solid var(--color-rule)",
              }}>
                <div className="mono-label">{t("season")}</div>
                <div className="mono-label">{t("weekly")}</div>
                <div className="mono-label">{t("nightly")}</div>
              </div>

              {v.rates.map((r, ri) => (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px 180px",
                    padding: "28px 0",
                    borderBottom: "1px solid var(--color-rule)",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{
                    fontSize: 18, color: "var(--color-ink)",
                  }}>
                    {r.season}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(24px, 2.5vw, 36px)",
                    fontStyle: "italic",
                    letterSpacing: "-0.01em",
                    color: "var(--color-ink)",
                  }}>
                    €{r.weekly.toLocaleString()}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    color: "var(--color-ink-soft)",
                    fontStyle: "italic",
                  }}>
                    €{r.nightly.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Villa CTA */}
            <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 40 }}>
              <Link
                href={`/${locale}/villas/${v.slug}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 12,
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "var(--color-ink)", textDecoration: "none",
                  borderBottom: "1px solid currentColor", paddingBottom: 4,
                }}
                className="link-hover-accent"
              >
                View villa
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href={`/${locale}/contact`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 12,
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "var(--color-accent)", textDecoration: "none",
                  borderBottom: "1px solid currentColor", paddingBottom: 4,
                }}
              >
                Enquire
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </section>
        )
      })}

      {/* Terms */}
      <section className="x-fade" style={{ padding: "100px 48px", borderTop: "1px solid var(--color-rule)" }}>
        <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 48 }}>{t("terms")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px" }}>
          {Object.entries(RATE_TERMS).map(([k, val]) => (
            <div key={k} style={{ borderTop: "1px solid var(--color-rule)", paddingTop: 24 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic",
                marginBottom: 12, color: "var(--color-ink)",
              }}>{k}</div>
              <p style={{ fontSize: 16, lineHeight: 1.85, color: "var(--color-ink-soft)", margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark CTA */}
      <section className="x-fade" style={{
        background: "var(--color-bg-deep)", color: "white",
        padding: "120px 48px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        <div>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>Reservations</div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 5vw, 80px)",
            lineHeight: 1.0, letterSpacing: "-0.02em", fontWeight: 300,
            margin: "0 0 40px", fontStyle: "italic",
            color: "rgba(247,244,238,0.92)",
          }}>
            {t("holdHeading")}
          </h2>
          <Link
            href={`/${locale}/contact`}
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
            {t("holdDate")}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        <div>
          <p style={{
            fontSize: 17, lineHeight: 1.9,
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 32px",
          }}>
            We respond within 24 hours. Rates are in euros and include all taxes. A 25% deposit holds your dates — no charge until you're certain.
          </p>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
          }}>
            38°43′N · 20°39′E · Ionian Sea
          </div>
        </div>
      </section>
    </>
  )
}
