import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata } from "@/lib/seo"
import Link from "next/link"
import Image from "next/image"
import MotionInit from "@/components/chrome/MotionInit"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const seo = await getPageSeo("rates", locale)
  return await buildMetadata(seo, { path: `/${locale}/rates`, locale })
}

const FEE_UNIT_LABELS: Record<string, Record<string, string>> = {
  en: {
    per_stay:         "per stay",
    per_day:          "per day",
    per_week:         "per week",
    per_person_night: "per person / night",
    per_person_stay:  "per person / stay",
  },
  el: {
    per_stay:         "ανά διαμονή",
    per_day:          "ανά ημέρα",
    per_week:         "ανά εβδομάδα",
    per_person_night: "ανά άτομο / διανυκτέρευση",
    per_person_stay:  "ανά άτομο / διαμονή",
  },
  de: {
    per_stay:         "pro Aufenthalt",
    per_day:          "pro Tag",
    per_week:         "pro Woche",
    per_person_night: "pro Person / Nacht",
    per_person_stay:  "pro Person / Aufenthalt",
  },
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

  // These tables may not exist yet on older deployments — fail gracefully
  const [dbTerms, dbFees] = await Promise.all([
    prisma.rateTerm.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: true } }).catch(() => []),
    prisma.rateFee.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: true } }).catch(() => []),
  ])

  // Resolve translation for current locale, fall back to EN
  function getTr<T extends { locale: string }>(translations: T[]): T | undefined {
    return translations.find(t => t.locale === locale) ?? translations.find(t => t.locale === "en")
  }

  const unitLabel = (unit: string) =>
    (FEE_UNIT_LABELS[locale] ?? FEE_UNIT_LABELS.en)[unit] ?? unit

  return (
    <>
      <MotionInit />

      {/* Page header */}
      <section className="x-page-header-dark" style={{ padding: "100px 48px 72px", background: "var(--color-bg-deep)", color: "white", position: "relative", overflow: "hidden" }}>
        {/* Ghost text */}
        <div style={{
          position: "absolute", right: 32, bottom: -40,
          fontFamily: "var(--font-display)", fontSize: "clamp(80px, 14vw, 200px)",
          fontWeight: 300, fontStyle: "italic",
          color: "rgba(255,255,255,0.04)",
          lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>€</div>

        <div className="x-stagger" style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>Lefkada · Apr — Oct</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(40px, 5vw, 72px)",
            lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 300, margin: "0 0 24px",
          }}>
            {t("heading")}&ensp;<em>{t("subheading")}</em>
          </h1>
          <p style={{
            fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.4)",
            maxWidth: 480, margin: 0,
          }}>
            {t("headerNote")}
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
            className="x-fade x-rate-section"
            style={{
              borderTop: "1px solid var(--color-rule)",
              padding: "100px 48px",
              background: vi % 2 === 0 ? "var(--color-bg)" : "var(--color-bg-alt)",
            }}
          >
            {/* Villa header */}
            <div className="x-rate-villa-header" style={{
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

            {/* Rate rows — weekly only */}
            <div style={{ borderTop: "1px solid var(--color-rule)" }}>
              <div className="x-rate-header" style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                padding: "16px 0",
                borderBottom: "1px solid var(--color-rule)",
              }}>
                <div className="mono-label">{t("season")}</div>
                <div className="mono-label">{t("weekly")}</div>
              </div>

              {v.rates.map(r => (
                <div
                  key={r.id}
                  className="x-rate-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 200px",
                    padding: "24px 0",
                    borderBottom: "1px solid var(--color-rule)",
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontSize: 17, color: "var(--color-ink)" }}>{r.season}</div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(22px, 2vw, 32px)",
                    fontStyle: "italic",
                    letterSpacing: "-0.01em",
                    color: "var(--color-ink)",
                  }}>
                    €{r.weekly.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Extra fees inline (if any) */}
            {dbFees.length > 0 && (
              <div style={{ marginTop: 24 }}>
                {dbFees.map(fee => {
                  const ftr = getTr(fee.translations)
                  if (!ftr?.label) return null
                  return (
                    <div
                      key={fee.id}
                      style={{
                        display: "flex", alignItems: "baseline", gap: 16,
                        padding: "10px 0",
                        borderBottom: "1px dashed var(--color-rule)",
                        fontSize: 14,
                        color: "var(--color-ink-soft)",
                      }}
                    >
                      <span style={{ flex: 1 }}>{ftr.label}{ftr.note ? ` — ${ftr.note}` : ""}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, color: "var(--color-ink)" }}>
                        €{fee.amount} <span style={{ fontSize: 12 }}>{unitLabel(fee.unit)}</span>
                      </span>
                      {!fee.mandatory && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                          {locale === "el" ? "Προαιρετικό" : locale === "de" ? "Optional" : "Optional"}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

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
                {t("viewVilla")}
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
                {t("enquire")}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </section>
        )
      })}

      {/* Terms */}
      {dbTerms.length > 0 && (
        <section className="x-fade x-terms-section" style={{ padding: "100px 48px", borderTop: "1px solid var(--color-rule)" }}>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 48 }}>{t("terms")}</div>
          <div className="x-terms-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 80px" }}>
            {dbTerms.map(term => {
              const ttr = getTr(term.translations)
              if (!ttr?.label) return null
              return (
                <div key={term.id} style={{ borderTop: "1px solid var(--color-rule)", paddingTop: 24 }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic",
                    marginBottom: 12, color: "var(--color-ink)",
                  }}>{ttr.label}</div>
                  <p style={{ fontSize: 16, lineHeight: 1.85, color: "var(--color-ink-soft)", margin: 0 }}>{ttr.body}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Dark CTA */}
      <section className="x-fade x-rates-cta" style={{
        background: "var(--color-bg-deep)", color: "white",
        padding: "120px 48px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        <div>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>{t("reservations")}</div>
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
            {t("ctaBody")}
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
