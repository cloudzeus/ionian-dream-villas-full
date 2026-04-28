"use client"

import { useEffect } from "react"

export default function LocaleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[locale error boundary]", error)
  }, [error])

  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      padding: "120px 48px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--color-accent)",
      }}>
        Temporary error
      </div>
      <h2 style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 44px)",
        fontWeight: 300, margin: 0, maxWidth: 560,
      }}>
        We couldn't load this page just now.
      </h2>
      <p style={{
        fontSize: 15, lineHeight: 1.7, color: "var(--color-ink-soft)",
        margin: 0, maxWidth: 480,
      }}>
        This is usually a brief connection hiccup. Try again — it should work.
      </p>
      <button
        onClick={() => unstable_retry()}
        style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          background: "var(--color-ink)", color: "white",
          border: "none", padding: "16px 32px", cursor: "pointer",
          marginTop: 8,
        }}
      >
        Try again
      </button>
    </div>
  )
}
