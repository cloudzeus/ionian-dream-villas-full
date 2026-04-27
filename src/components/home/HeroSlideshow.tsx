"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface Villa {
  slug: string
  images: { url: string; isCover: boolean }[]
  translations: { name: string; nameLocal: string; region: string }[]
}

interface Slide {
  id: string
  imageUrl: string
  captionEn: string
  captionGr: string
}

interface Props {
  locale: string
  villas: Villa[]
  slides: Slide[]
}

export default function HeroSlideshow({ locale, villas, slides }: Props) {
  const villa = villas[0]
  const cover = villa?.images.find(i => i.isCover) || villa?.images[0]
  const tr = villa?.translations[0]

  // Fall back to villa cover if no hero slides configured
  const images: { src: string; caption: string }[] =
    slides.length > 0
      ? slides.map(s => ({
          src: s.imageUrl,
          caption: locale === "gr" ? s.captionGr : s.captionEn,
        }))
      : cover
      ? [{ src: cover.url, caption: "" }]
      : []

  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setActive(cur => {
        setPrev(cur)
        return (cur + 1) % images.length
      })
    }, 6000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <section
      className="x-hero-section"
      style={{ position: "relative", height: "100vh", minHeight: 640, overflow: "hidden", color: "white" }}
    >
      {/* Slide backgrounds */}
      <div className="x-hero-bg" style={{ position: "absolute", inset: "-15% 0", background: "linear-gradient(135deg, #1C3848 0%, #0e1e28 100%)" }}>
        {images.map((img, i) => (
          <Image
            key={i}
            src={img.src}
            alt="Lefkada · Ionian Sea"
            fill
            priority={i === 0}
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center 40%",
              transition: "opacity 1.4s ease",
              opacity: i === active ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* Layered overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,30,40,0.5) 0%, rgba(14,30,40,0.1) 40%, rgba(14,30,40,0.65) 100%)", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(14,30,40,0.6) 0%, transparent 60%)", zIndex: 1 }} />

      {/* Coordinates — top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: "100px 48px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="x-hero-meta mono-label" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }}>
          38°43′N · 20°39′E · Lefkada
        </div>
        <div className="x-hero-meta mono-label" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }}>
          Est. 1962
        </div>
      </div>

      {/* Main text */}
      <div style={{ position: "absolute", left: 48, right: "30%", bottom: "18vh", zIndex: 3, overflow: "hidden" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 0.93 }}>
          <div className="x-hero-line" style={{ fontSize: "clamp(52px, 9vw, 160px)", display: "block", overflow: "hidden" }}>A quiet</div>
          <div className="x-hero-line" style={{ fontSize: "clamp(52px, 9vw, 160px)", display: "block", paddingLeft: "12vw", fontStyle: "italic", overflow: "hidden" }}>island</div>
          <div className="x-hero-line" style={{ fontSize: "clamp(52px, 9vw, 160px)", display: "block", overflow: "hidden" }}>kept for the few.</div>
        </h1>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "absolute", left: 48, right: 48, bottom: 48, zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div className="x-hero-meta">
          {images[active]?.caption ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
              {images[active].caption}
            </div>
          ) : tr?.nameLocal ? (
            <div style={{ fontFamily: "var(--font-greek)", fontSize: 22, marginBottom: 6, opacity: 0.85 }}>{tr.nameLocal}</div>
          ) : null}
          <div className="mono-label" style={{ color: "rgba(255,255,255,0.55)" }}>
            Three villas · Lefkada island · Greece
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
          {/* Slide dots */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPrev(active); setActive(i) }}
                  style={{
                    width: i === active ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    border: "none",
                    background: i === active ? "white" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              ))}
            </div>
          )}

          <Link
            href={`/${locale}/villas`}
            className="x-hero-meta btn-hover-ghost"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              border: "1px solid rgba(255,255,255,0.35)", color: "white",
              padding: "14px 28px", textDecoration: "none",
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.07)",
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
          >
            Explore the villas
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="x-hero-meta" style={{
        position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)",
        zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <div style={{
          writingMode: "vertical-rl", fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
        }}>Scroll</div>
        <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.25)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "40%",
            background: "white", animation: "scrollLine 2s ease-in-out infinite",
          }} />
        </div>
      </div>
    </section>
  )
}
