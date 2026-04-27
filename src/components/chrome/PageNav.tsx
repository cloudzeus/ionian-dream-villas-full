"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import IDVLogo from "@/components/primitives/IDVLogo"

const LOCALES = ["en", "el", "de"] as const
const LOCALE_LABELS: Record<string, string> = { en: "EN", el: "ΕΛ", de: "DE" }

export default function PageNav({ locale }: { locale: string }) {
  const t = useTranslations("nav")
  const pathname = usePathname()

  // Only homepage has a dark hero — all other pages start with a light background
  const isHome = /^\/[a-z]{2}\/?$/.test(pathname)
  const [scrolled, setScrolled] = useState(!isHome)

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const handler = () => setScrolled(window.scrollY > 60)
    setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [isHome])

  // Keep same sub-path when switching language (e.g. /el/villas → /de/villas)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/"

  return (
    <nav style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 50,
      padding: "20px 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "background 0.3s ease, border-color 0.3s ease",
      background: scrolled ? "rgba(247,244,238,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(8px)" : "none",
      borderBottom: scrolled ? "1px solid var(--color-rule)" : "none",
      color: scrolled ? "var(--color-ink)" : "white",
    }}>
      <Link href={`/${locale}`}>
        <IDVLogo color={scrolled ? "var(--color-ink)" : "white"} />
      </Link>

      <div style={{ display: "flex", gap: 28, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
        {([
          [t("villas"), `/${locale}/villas`],
          [t("lefkada"), `/${locale}/lefkada`],
          [t("rates"), `/${locale}/rates`],
          [t("contact"), `/${locale}/contact`],
        ] as [string, string][]).map(([label, href]) => (
          <Link key={href} href={href} style={{ color: "inherit", textDecoration: "none", opacity: pathname.startsWith(href) ? 1 : 0.75, transition: "opacity 0.2s" }}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* Language switcher: all 3 locales, current highlighted */}
        <div style={{ display: "flex", border: `1px solid ${scrolled ? "var(--color-rule)" : "rgba(255,255,255,0.3)"}` }}>
          {LOCALES.map((loc) => (
            <Link
              key={loc}
              href={`/${loc}${pathWithoutLocale}`}
              style={{
                display: "block",
                padding: "5px 9px",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: loc === locale
                  ? (scrolled ? "var(--color-ink)" : "white")
                  : (scrolled ? "var(--color-ink-soft)" : "rgba(255,255,255,0.45)"),
                background: loc === locale
                  ? (scrolled ? "var(--color-bg-alt)" : "rgba(255,255,255,0.14)")
                  : "transparent",
                transition: "all 0.15s",
              }}
            >
              {LOCALE_LABELS[loc]}
            </Link>
          ))}
        </div>

        <Link
          href={`/${locale}/contact`}
          style={{
            background: scrolled ? "var(--color-ink)" : "white",
            color: scrolled ? "white" : "var(--color-ink)",
            padding: "10px 20px",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
            textDecoration: "none",
            display: "inline-block",
            transition: "all 0.2s",
          }}
        >
          {t("enquire")}
        </Link>
      </div>
    </nav>
  )
}
