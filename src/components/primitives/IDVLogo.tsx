export default function IDVLogo({ color = "currentColor", size = 28 }: { color?: string; size?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="1" />
        <path d="M8 24 Q 14 20, 20 24 T 32 24" stroke={color} strokeWidth="1.2" fill="none" />
        <path d="M8 28 Q 14 24, 20 28 T 32 28" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
        <text x="20" y="17" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="11" fontStyle="italic" fill={color} letterSpacing="1">IDV</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          IONIAN DREAM
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 12, opacity: 0.7, letterSpacing: "0.18em", marginTop: 6, whiteSpace: "nowrap" }}>
          villas · Lefkada
        </span>
      </div>
    </div>
  )
}
