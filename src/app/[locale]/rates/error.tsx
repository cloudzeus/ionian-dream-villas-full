"use client"

export default function RatesError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      padding: "80px 48px",
      fontFamily: "var(--font-body)",
    }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)" }}>
        Error
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 300, margin: 0 }}>
        Something went wrong loading rates.
      </h2>
      <button
        onClick={() => unstable_retry()}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          background: "var(--color-ink)", color: "white",
          border: "none", padding: "14px 28px", cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  )
}
