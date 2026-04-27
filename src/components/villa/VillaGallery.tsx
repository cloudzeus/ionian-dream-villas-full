"use client"
import { useState, useCallback, useEffect } from "react"
import Image from "next/image"

interface GalleryImage {
  id: string
  url: string
  altEn: string
  isCover: boolean
  sortOrder: number
}

export default function VillaGallery({ images, villaName }: { images: GalleryImage[]; villaName: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const nonCover = images.filter(i => !i.isCover)

  const close = useCallback(() => setLightbox(null), [])
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + nonCover.length) % nonCover.length : null), [nonCover.length])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % nonCover.length : null), [nonCover.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [lightbox, close, prev, next])

  if (nonCover.length === 0) return null

  // Build a responsive layout: first image large, rest in grid
  const [first, ...rest] = nonCover

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Hero gallery image */}
        <div
          style={{ position: "relative", height: "60vh", overflow: "hidden", cursor: "zoom-in" }}
          onClick={() => setLightbox(0)}
        >
          <Image
            src={first.url} alt={first.altEn || villaName}
            fill style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div style={{
            position: "absolute", bottom: 20, right: 20,
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "white", background: "rgba(14,30,40,0.6)",
            padding: "6px 12px", backdropFilter: "blur(4px)",
          }}>
            View all {nonCover.length} photos
          </div>
        </div>

        {/* Grid of rest */}
        {rest.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(rest.length, 4)}, 1fr)`,
            gap: 4,
          }}>
            {rest.slice(0, 4).map((img, i) => (
              <div
                key={img.id}
                style={{ position: "relative", height: 240, overflow: "hidden", cursor: "zoom-in" }}
                onClick={() => setLightbox(i + 1)}
              >
                <Image
                  src={img.url} alt={img.altEn || ""}
                  fill style={{ objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
                {i === 3 && rest.length > 4 && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(14,30,40,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontSize: 28,
                    fontStyle: "italic", color: "white",
                  }}>
                    +{rest.length - 3} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(10,18,24,0.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={close}
        >
          {/* Image */}
          <div
            style={{ position: "relative", width: "85vw", height: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={nonCover[lightbox].url}
              alt={nonCover[lightbox].altEn || villaName}
              fill style={{ objectFit: "contain" }}
            />
          </div>

          {/* Controls */}
          <button
            onClick={e => { e.stopPropagation(); close() }}
            style={{
              position: "fixed", top: 24, right: 24,
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "white", width: 44, height: 44,
              borderRadius: "50%", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >×</button>

          <button
            onClick={e => { e.stopPropagation(); prev() }}
            style={{
              position: "fixed", left: 24, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "white", width: 52, height: 52,
              borderRadius: "50%", cursor: "pointer", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >‹</button>

          <button
            onClick={e => { e.stopPropagation(); next() }}
            style={{
              position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "white", width: 52, height: 52,
              borderRadius: "50%", cursor: "pointer", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >›</button>

          {/* Counter */}
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)",
          }}>
            {String(lightbox + 1).padStart(2, "0")} / {String(nonCover.length).padStart(2, "0")}
          </div>
        </div>
      )}
    </>
  )
}
