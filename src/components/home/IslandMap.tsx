const LEFKADA_PATH = "M120,20 C140,18 160,28 168,52 C176,76 178,108 174,140 C170,172 164,210 152,240 C144,260 132,278 116,290 C100,300 84,302 72,290 C60,276 56,254 60,228 C64,200 70,172 78,144 C86,118 96,90 104,64 C110,44 110,22 120,20 Z"

interface VillaPin { slug: string; coordX: number; coordY: number; translations: { name: string; nameLocal: string }[] }

export default function IslandMap({ villas, locale }: { villas: VillaPin[]; locale: string }) {
  return (
    <section style={{ padding: "120px 40px", background: "var(--color-bg-alt)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
      <div className="x-fade">
        <div className="mono-label" style={{ marginBottom: 24 }}>Λευκάδα · Lefkada</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display-m)", lineHeight: 1, letterSpacing: "-0.02em", fontWeight: 400, margin: "0 0 32px" }}>
          Three villas.<br />
          <span className="greek-accent">One quiet island.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--color-ink-soft)", maxWidth: 440 }}>
          All three villas sit within minutes of each other on the western shore — a quiet road, olive trees, and the sound of the sea.
        </p>
      </div>
      <div className="a-map" style={{ display: "flex", justifyContent: "center" }}>
        <svg viewBox="0 0 200 320" width={220} height={350} style={{ overflow: "visible" }}>
          <path
            className="a-map-island"
            d={LEFKADA_PATH}
            fill="var(--color-sea)"
            fillOpacity={0.18}
            stroke="var(--color-sea)"
            strokeWidth={1.5}
          />
          {villas.map((v, i) => {
            const x = (v.coordX / 100) * 200
            const y = (v.coordY / 100) * 320
            const tr = v.translations[0]
            return (
              <g key={v.slug} className="a-map-pin">
                <circle cx={x} cy={y} r={5} fill="var(--color-accent)" />
                <circle cx={x} cy={y} r={10} fill="var(--color-accent)" fillOpacity={0.2} />
                <text x={x + 14} y={y + 4} fontFamily="var(--font-mono)" fontSize={9} letterSpacing={1} fill="var(--color-ink)" style={{ textTransform: "uppercase" }}>
                  {tr?.name || v.slug}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
