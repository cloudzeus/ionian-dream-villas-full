export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <header
      className="x-page-header"
      style={{
        paddingTop: 160,
        paddingBottom: 80,
        paddingLeft: 40,
        paddingRight: 40,
        borderBottom: "1px solid var(--color-rule)",
      }}
    >
      {eyebrow && (
        <div className="mono-label" style={{ marginBottom: 24 }}>
          {eyebrow}
        </div>
      )}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-display-l)",
          lineHeight: 0.94,
          letterSpacing: "-0.02em",
          fontWeight: 400,
          margin: 0,
          color: "var(--color-ink)",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            marginTop: 32,
            fontSize: 18,
            lineHeight: 1.8,
            color: "var(--color-ink-soft)",
            maxWidth: 560,
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
