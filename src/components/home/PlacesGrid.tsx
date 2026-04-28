"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

interface LocationData {
  slug: string
  tone: string
  translations: { name: string; nameLocal?: string; kind: string; short: string }[]
  images: { url: string }[]
}

const WIDTHS = [380, 320, 420, 340, 360]
const HEIGHTS = [520, 440, 480, 500, 460]

export default function PlacesGrid({ locations, locale }: { locations: LocationData[]; locale: string }) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  // Outer section height = viewport + horizontal scroll distance.
  // Computed client-side once track is measured; until then the section
  // is just one viewport tall and the track scrolls horizontally natively.
  const [sectionHeight, setSectionHeight] = useState<number | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (isMobile) return // mobile: native vertical scroll, cards stack via CSS

    let raf = 0
    let distance = 0

    const measure = () => {
      // Inner content overflow: how far we need to translate the track.
      distance = Math.max(0, track.scrollWidth - window.innerWidth)
      setSectionHeight(window.innerHeight + distance)
    }

    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        track.style.transform = "translate3d(0,0,0)"
        return
      }
      // progress: 0 when section top hits viewport top, 1 when bottom reaches viewport bottom
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      track.style.transform = `translate3d(${-progress * distance}px,0,0)`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    measure()
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", () => { measure(); update() })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [locations.length])

  if (!locations.length) return null

  return (
    <section
      ref={sectionRef}
      className="x-places-scroll-section"
      style={{
        position: "relative",
        background: "var(--color-bg)",
        height: sectionHeight ? `${sectionHeight}px` : "100vh",
      }}
    >
      <div className="x-places-scroll-stage" style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        <div className="x-places-scroll-header" style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: 320, zIndex: 2, padding: "0 48px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          background: "var(--color-bg)",
          borderRight: "1px solid var(--color-rule)",
        }}>
          <div className="mono-label" style={{ marginBottom: 20, color: "var(--color-accent)" }}>Λευκάδα · The guide</div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.0, letterSpacing: "-0.025em", fontWeight: 300,
            margin: "0 0 24px",
          }}>
            Places<br />worth<br /><em>knowing.</em>
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-ink-soft)", lineHeight: 1.7, margin: "0 0 32px" }}>
            Scroll to explore the island — beaches, villages, and viewpoints.
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--color-ink-soft)",
          }}>
            <span>Scroll</span>
            <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
              <path d="M0 4h22M18 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div
          ref={trackRef}
          className="x-places-scroll-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            paddingLeft: 360,
            paddingRight: 80,
            height: "100%",
            willChange: "transform",
          }}
        >
          {locations.map((loc, i) => {
            const tr = loc.translations[0]
            const img = loc.images[0]
            const w = WIDTHS[i % WIDTHS.length]
            const h = HEIGHTS[i % HEIGHTS.length]

            return (
              <Link
                key={loc.slug}
                href={`/${locale}/lefkada/${loc.slug}`}
                className="x-place-card"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "var(--color-ink)",
                  flexShrink: 0,
                  width: w,
                }}
              >
                <div style={{
                  overflow: "hidden", marginBottom: 20,
                  position: "relative",
                  background: "#c8d4d9",
                }}>
                  {img ? (
                    <Image
                      src={img.url} alt={tr?.name || loc.slug}
                      width={w} height={h}
                      className="place-card-img"
                      style={{ width: "100%", height: h, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ height: h, background: "linear-gradient(135deg, #4A7B92, #2C4F62)" }} />
                  )}
                  <div style={{
                    position: "absolute", bottom: 16, left: 16,
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    color: "white", background: "rgba(14,30,40,0.65)",
                    padding: "4px 10px", backdropFilter: "blur(4px)",
                  }}>
                    {tr?.kind}
                  </div>
                </div>

                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>{tr?.name}</div>
                {tr?.nameLocal && (
                  <div style={{ fontFamily: "var(--font-greek)", fontStyle: "italic", fontSize: 15, color: "var(--color-sea)", marginBottom: 10 }}>{tr.nameLocal}</div>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-ink-soft)", margin: 0 }}>
                  {tr?.short?.slice(0, 100)}{(tr?.short?.length || 0) > 100 ? "…" : ""}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
