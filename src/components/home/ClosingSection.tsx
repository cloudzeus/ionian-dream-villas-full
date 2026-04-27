import Link from "next/link"

export default function ClosingSection({
  locale,
  t,
}: {
  locale: string
  t: { greek: string; en: string; reserve: string }
}) {
  return (
    <section
      className="x-fade"
      style={{
        background: "var(--color-bg-deep)", color: "white",
        padding: "140px 48px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}
    >
      {/* Left: large Greek text */}
      <div>
        <div style={{
          fontFamily: "var(--font-greek)",
          fontSize: "clamp(56px, 8vw, 130px)",
          lineHeight: 0.9, fontStyle: "italic",
          color: "rgba(247,244,238,0.92)",
          marginBottom: 20,
        }}>
          {t.greek}
        </div>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: 18,
          color: "rgba(247,244,238,0.4)", letterSpacing: "0.04em",
        }}>
          {t.en}
        </div>
      </div>

      {/* Right: CTA block */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 40 }}>
        <p style={{
          fontSize: 18, lineHeight: 1.8,
          color: "rgba(255,255,255,0.5)",
          margin: 0, maxWidth: 400,
        }}>
          Three private villas on a Greek island that still keeps its secrets. Seven nights minimum.
        </p>

        <Link
          href={`/${locale}/contact`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 16,
            background: "var(--color-accent)", color: "var(--color-bg-deep)",
            padding: "18px 36px",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.2em", textTransform: "uppercase",
            textDecoration: "none",
            transition: "opacity 0.25s ease",
          }}
          className="link-hover-light"
        >
          {t.reserve}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
        }}>
          38°43′N · 20°39′E · Ionian Sea
        </div>
      </div>
    </section>
  )
}
