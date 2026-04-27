"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

const STORAGE_KEY = "idv_cookie_consent"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted") } catch {}
    setVisible(false)
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, "declined") } catch {}
    setVisible(false)
  }

  if (!visible) return null

  const texts: Record<string, { msg: string; accept: string; decline: string; more: string }> = {
    en: {
      msg: "We use cookies to improve your experience. By continuing, you agree to our cookies policy.",
      accept: "Accept",
      decline: "Decline",
      more: "Learn more",
    },
    el: {
      msg: "Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας. Συνεχίζοντας, αποδέχεστε την πολιτική cookies μας.",
      accept: "Αποδοχή",
      decline: "Απόρριψη",
      more: "Μάθετε περισσότερα",
    },
    de: {
      msg: "Wir verwenden Cookies, um Ihr Erlebnis zu verbessern. Durch die weitere Nutzung stimmen Sie unserer Cookie-Richtlinie zu.",
      accept: "Akzeptieren",
      decline: "Ablehnen",
      more: "Mehr erfahren",
    },
  }
  const t = texts[locale] || texts.en

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "var(--color-bg-deep)",
        color: "white",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        flexWrap: "wrap",
      }}
      className="x-cookie-banner"
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
        {t.msg}{" "}
        <Link
          href={`/${locale}/cookies`}
          style={{ color: "var(--color-accent)", textDecoration: "underline" }}
        >
          {t.more}
        </Link>
      </p>
      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "10px 20px",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          {t.decline}
        </button>
        <button
          onClick={accept}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "10px 24px",
            background: "var(--color-accent)",
            color: "var(--color-bg-deep)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t.accept}
        </button>
      </div>
    </div>
  )
}
