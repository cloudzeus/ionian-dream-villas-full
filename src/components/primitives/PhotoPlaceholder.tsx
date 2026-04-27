type Tone = "sea" | "sand" | "stone" | "deep"

const palettes: Record<Tone, [string, string]> = {
  sea: ["#cfd9dd", "#b9c8cd"],
  sand: ["#e8dfd0", "#d8cdb9"],
  stone: ["#cdc6bb", "#b8b1a4"],
  deep: ["#3d5868", "#2d4453"],
}

export default function PhotoPlaceholder({
  label = "photo",
  ratio = "4 / 3",
  tone = "sea",
  style = {},
  className,
  children,
}: {
  label?: string
  ratio?: string
  tone?: Tone
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}) {
  const [a, b] = palettes[tone]
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        background: `repeating-linear-gradient(135deg, ${a} 0 14px, ${b} 14px 28px)`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "rgba(0,0,0,0.5)",
          textTransform: "uppercase",
          mixBlendMode: "multiply",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}
