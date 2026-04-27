"use client"
import { useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import IDVLogo from "@/components/primitives/IDVLogo"

const LOCALES = ["en", "el", "de"] as const
const LOCALE_LABELS: Record<string, string> = { en: "EN", el: "ΕΛ", de: "DE" }

export default function PageNav({ locale }: { locale: string }) {
  const t = useTranslations("nav")
  const pathname = usePathname()

  const isHome = /^\/[a-z]{2}\/?$/.test(pathname)
  const [scrolled, setScrolled] = useState(!isHome)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const handler = () => setScrolled(window.scrollY > 60)
    setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [isHome])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [menuOpen])

  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/"

  const navLinks: [string, string][] = [
    [t("villas"),  `/${locale}/villas`],
    [t("lefkada"), `/${locale}/lefkada`],
    [t("rates"),   `/${locale}/rates`],
    [t("contact"), `/${locale}/contact`],
  ]

  return (
    <>
      {/* ── Main nav bar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.3s ease, border-color 0.3s ease",
        background: scrolled ? "rgba(247,244,238,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-rule)" : "none",
        color: scrolled ? "var(--color-ink)" : "white",
      }}
      className="x-page-nav"
      >
        {/* Logo */}
        <Link href={`/${locale}`} style={{ zIndex: 2, flexShrink: 0 }}>
          <IDVLogo color={menuOpen ? "var(--color-ink)" : scrolled ? "var(--color-ink)" : "white"} />
        </Link>

        {/* Desktop nav links */}
        <div className="x-nav-links" style={{
          display: "flex", gap: 28,
          fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-mono)",
        }}>
          {navLinks.map(([label, href]) => (
            <Link key={href} href={href} style={{
              color: "inherit", textDecoration: "none",
              opacity: pathname.startsWith(href) ? 1 : 0.75, transition: "opacity 0.2s",
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="x-nav-right" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", border: `1px solid ${scrolled ? "var(--color-rule)" : "rgba(255,255,255,0.3)"}` }}>
            {LOCALES.map((loc) => (
              <Link key={loc} href={`/${loc}${pathWithoutLocale}`} style={{
                display: "block", padding: "5px 9px", textDecoration: "none",
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                color: loc === locale ? (scrolled ? "var(--color-ink)" : "white") : (scrolled ? "var(--color-ink-soft)" : "rgba(255,255,255,0.45)"),
                background: loc === locale ? (scrolled ? "var(--color-bg-alt)" : "rgba(255,255,255,0.14)") : "transparent",
                transition: "all 0.15s",
              }}>
                {LOCALE_LABELS[loc]}
              </Link>
            ))}
          </div>
          <Link href={`/${locale}/contact`} style={{
            background: scrolled ? "var(--color-ink)" : "white",
            color: scrolled ? "white" : "var(--color-ink)",
            padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em",
            textTransform: "uppercase", fontFamily: "var(--font-mono)",
            textDecoration: "none", display: "inline-block", transition: "all 0.2s",
          }}>
            {t("enquire")}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="x-nav-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            display: "none", // shown via CSS on mobile
            flexDirection: "column", justifyContent: "center", alignItems: "center",
            gap: 5, width: 44, height: 44, background: "none", border: "none",
            cursor: "pointer", padding: 8, zIndex: 2,
            color: scrolled ? "var(--color-ink)" : "white",
          }}
        >
          {/* Three-bar icon morphs to × when open */}
          <span style={{
            display: "block", width: 22, height: 1.5,
            background: "currentColor",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
          }} />
          <span style={{
            display: "block", width: 22, height: 1.5,
            background: "currentColor",
            transition: "opacity 0.3s ease",
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            display: "block", width: 22, height: 1.5,
            background: "currentColor",
            transition: "transform 0.3s ease, opacity 0.3s ease",
            transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
          }} />
        </button>
      </nav>

      {/* ── Mobile full-screen menu ───────────────────────────────────────── */}
      <div
        className="x-mobile-menu"
        aria-hidden={!menuOpen}
        style={{
          position: "fixed", inset: 0, zIndex: 49,
          background: "var(--color-bg)",
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "flex-start",
          padding: "80px 32px 48px",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.76, 0, 0.24, 1)",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        {/* Large nav links */}
        <nav style={{ width: "100%", marginBottom: 48 }}>
          {navLinks.map(([label, href], i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 12vw, 68px)",
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: pathname.startsWith(href) ? "var(--color-accent)" : "var(--color-ink)",
                textDecoration: "none",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-rule)",
                transition: "color 0.2s",
                animationDelay: `${i * 60}ms`,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Language switcher */}
        <div style={{
          display: "flex", gap: 0,
          border: "1px solid var(--color-rule)",
          marginBottom: 24,
        }}>
          {LOCALES.map((loc) => (
            <Link
              key={loc}
              href={`/${loc}${pathWithoutLocale}`}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block", padding: "10px 18px",
                textDecoration: "none",
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: loc === locale ? "var(--color-ink)" : "var(--color-ink-soft)",
                background: loc === locale ? "var(--color-bg-alt)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {LOCALE_LABELS[loc]}
            </Link>
          ))}
        </div>

        {/* Enquire CTA */}
        <Link
          href={`/${locale}/contact`}
          onClick={() => setMenuOpen(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "var(--color-ink)", color: "white",
            padding: "16px 28px",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.2em", textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          {t("enquire")}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Coordinates */}
        <div style={{
          position: "absolute", bottom: 56, left: 32,
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--color-ink-soft)",
        }}>
          38°43′N · 20°39′E · Lefkada
        </div>
      </div>
    </>
  )
}
