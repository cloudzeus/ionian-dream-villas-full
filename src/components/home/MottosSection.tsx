interface Motto { eyebrow: string; title: string; body: string }

export default function MottosSection({ t }: { t: { mottos: Motto[] } }) {
  return (
    <section style={{ background: "var(--color-bg-deep)", color: "white", padding: "120px 0 100px" }}>
      {t.mottos.map((m, i) => (
        <div
          key={i}
          className="x-fade x-motto-row"
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 1fr",
            gap: "0 60px",
            padding: "72px 48px",
            borderTop: `1px solid rgba(255,255,255,${i === 0 ? 0 : 0.1})`,
            alignItems: "start",
          }}
        >
          {/* Number */}
          <div className="x-motto-number" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(64px, 8vw, 120px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.12)",
            lineHeight: 1,
            paddingTop: 4,
            fontStyle: "italic",
          }}>
            0{i + 1}
          </div>

          {/* Eyebrow + Title */}
          <div style={{ paddingTop: 8 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 24,
            }}>
              {m.eyebrow}
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3.5vw, 52px)",
              lineHeight: 1.08, letterSpacing: "-0.02em", fontWeight: 300,
              margin: 0, color: "white",
            }}>
              {m.title}
            </h2>
          </div>

          {/* Body */}
          <div style={{ paddingTop: 8 }}>
            <p style={{
              fontSize: 17, lineHeight: 1.85,
              color: "rgba(255,255,255,0.55)",
              margin: 0, maxWidth: 480,
            }}>
              {m.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
