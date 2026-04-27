const WORDS = "Λευκάδα · Ἰθάκη · Ὀδύσσεια · θάλασσα · meltemi · ἡλιοβασίλεμα · Ἰόνιο · νησί · παραλία · ἐλιά"

export default function MarqueeSection() {
  return (
    <div style={{
      overflow: "hidden",
      borderTop: "1px solid var(--color-rule)",
      borderBottom: "1px solid var(--color-rule)",
      padding: "16px 0",
      background: "var(--color-bg-alt)",
    }}>
      {/* GSAP drives this via .x-marquee-track in motion.ts */}
      <div
        className="x-marquee-track"
        style={{ display: "inline-flex", whiteSpace: "nowrap", willChange: "transform" }}
      >
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="mono-label"
            style={{ color: "var(--color-ink-soft)", paddingRight: 64, opacity: 0.7 }}
          >
            {WORDS}
          </span>
        ))}
      </div>
    </div>
  )
}
