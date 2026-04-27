import Link from "next/link"
import Image from "next/image"

interface VillaData {
  slug: string
  sqm: number
  bedrooms: number
  guests: number
  pool: boolean
  translations: { name: string; nameLocal: string; region: string; blurb: string; pool: string }[]
  images: { url: string; isCover: boolean; altEn: string }[]
  rates: { weekly: number }[]
}

export default function VillasSection({
  villas,
  locale,
  t,
}: {
  villas: VillaData[]
  locale: string
  t: { heading: string; subheading: string; viewVilla: string }
}) {
  return (
    <section style={{ paddingTop: 0 }}>
      {/* Section header */}
      <div className="x-fade" style={{ padding: "100px 48px 64px", maxWidth: 720 }}>
        <div className="mono-label" style={{ marginBottom: 20, color: "var(--color-accent)" }}>Villas · Lefkada</div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(42px, 6vw, 88px)",
          lineHeight: 0.97, letterSpacing: "-0.025em", fontWeight: 300, margin: 0,
        }}>
          {t.heading}<br />
          <em>{t.subheading}</em>
        </h2>
      </div>

      {/* Villa rows */}
      {villas.map((v, i) => {
        const tr = v.translations[0]
        const cover = v.images.find(img => img.isCover) || v.images[0]
        const extras = v.images.filter(img => !img.isCover).slice(0, 2)
        const even = i % 2 === 0
        const weeklyRate = v.rates[0]?.weekly

        return (
          <div
            key={v.slug}
            className="x-villa-row"
            style={{
              display: "grid",
              gridTemplateColumns: even ? "58% 42%" : "42% 58%",
              minHeight: "88vh",
              borderTop: "1px solid var(--color-rule)",
            }}
          >
            {/* Image panel */}
            <div
              className="x-villa-img"
              style={{
                order: even ? 0 : 1,
                position: "relative",
                overflow: "hidden",
                background: "#1C2A33",
              }}
            >
              {cover ? (
                <Image
                  src={cover.url}
                  alt={tr?.name || v.slug}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="(max-width: 768px) 100vw, 58vw"
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1C3848 0%, #0e1e28 100%)" }} />
              )}
              {/* Dark overlay gradient */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(14,30,40,0.45) 100%)" }} />
              {/* Villa number */}
              <div style={{
                position: "absolute", top: 32, left: 32,
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}>0{i + 1}</div>
              {/* Thumbnail strip */}
              {extras.length > 0 && (
                <div style={{
                  position: "absolute", bottom: 24, right: 24,
                  display: "flex", gap: 8,
                }}>
                  {extras.map((img, j) => (
                    <div key={j} style={{ width: 72, height: 52, overflow: "hidden", opacity: 0.8 }}>
                      <Image src={img.url} alt="" width={72} height={52} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                padding: "64px 56px",
                background: even ? "var(--color-bg)" : "var(--color-bg-alt)",
              }}
            >
              <div className="mono-label" style={{ marginBottom: 24, color: "var(--color-accent)" }}>
                {tr?.region || "Lefkada · Greece"}
              </div>

              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5vw, 76px)",
                lineHeight: 0.95, letterSpacing: "-0.02em", fontWeight: 300,
                margin: "0 0 6px",
              }}>
                {tr?.name || v.slug}
              </h3>

              {tr?.nameLocal && (
                <div style={{
                  fontFamily: "var(--font-greek)", fontSize: 20,
                  color: "var(--color-sea)", fontStyle: "italic", marginBottom: 32,
                }}>
                  {tr.nameLocal}
                </div>
              )}

              <p style={{
                fontSize: 17, lineHeight: 1.8, color: "var(--color-ink-soft)",
                marginBottom: 40, maxWidth: 400,
              }}>
                {tr?.blurb}
              </p>

              {/* Specs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px", marginBottom: 48 }}>
                {[
                  ["Bedrooms", String(v.bedrooms)],
                  ["Guests", String(v.guests)],
                  ["Size", `${v.sqm} m²`],
                  ["Pool", tr?.pool || "Private pool"],
                  ...(weeklyRate ? [["From", `€${weeklyRate.toLocaleString()} / week`]] : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ borderTop: "1px solid var(--color-rule)", paddingTop: 14 }}>
                    <div className="mono-label" style={{ marginBottom: 6 }}>{label}</div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontSize: 20,
                      fontStyle: "italic", color: "var(--color-ink)",
                    }}>{val}</div>
                  </div>
                ))}
              </div>

              <Link
                href={`/${locale}/villas/${v.slug}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 12,
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "var(--color-ink)", textDecoration: "none",
                  borderBottom: "1px solid currentColor", paddingBottom: 4,
                  alignSelf: "flex-start",
                  transition: "color 0.25s ease",
                }}
                className="link-hover-accent"
              >
                {t.viewVilla}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        )
      })}
    </section>
  )
}
