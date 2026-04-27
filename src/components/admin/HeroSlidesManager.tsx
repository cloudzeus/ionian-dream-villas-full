"use client"
import { useState, useCallback } from "react"
import MediaGallery from "@/components/admin/MediaGallery"

interface HeroSlide {
  id: string
  imageUrl: string
  captionEn: string
  captionGr: string
  sortOrder: number
  active: boolean
}

export default function HeroSlidesManager({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const reload = async () => {
    const res = await fetch("/api/admin/hero")
    const data = await res.json()
    setSlides(data)
  }

  const handlePickerSelect = async (items: { id: string; bunnyUrl: string }[]) => {
    setShowPicker(false)
    for (const item of items) {
      await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: item.bunnyUrl }),
      })
    }
    reload()
  }

  const update = async (id: string, patch: Partial<HeroSlide>) => {
    setSaving(id)
    await fetch("/api/admin/hero", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    })
    setSaving(null)
    reload()
  }

  const remove = async (id: string) => {
    if (!confirm("Remove this slide?")) return
    await fetch("/api/admin/hero", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    reload()
  }

  // Drag-to-reorder
  const onDragStart = (id: string) => setDragging(id)
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id) }
  const onDrop = async (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return }
    const from = slides.findIndex(s => s.id === dragging)
    const to = slides.findIndex(s => s.id === targetId)
    const reordered = [...slides]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const updated = reordered.map((s, i) => ({ ...s, sortOrder: i }))
    setSlides(updated)
    setDragging(null)
    setDragOver(null)
    await Promise.all(updated.map(s => fetch("/api/admin/hero", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, sortOrder: s.sortOrder }),
    })))
  }

  return (
    <>
      {showPicker && (
        <MediaGallery
          mode="picker"
          multiple
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Hero Slideshow</h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Drag to reorder. Click the image to activate/deactivate.</p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            + Add slides
          </button>
        </div>

        {slides.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            No slides yet. Click "Add slides" to pick images from the media library.
          </div>
        )}

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {slides.map((slide) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => onDragStart(slide.id)}
              onDragOver={e => onDragOver(e, slide.id)}
              onDrop={() => onDrop(slide.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null) }}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 120px 1fr auto",
                gap: 16,
                alignItems: "center",
                padding: "12px 16px",
                border: `1px solid ${dragOver === slide.id ? "#2563eb" : "#e2e8f0"}`,
                borderRadius: 8,
                background: dragOver === slide.id ? "#eff6ff" : slide.active ? "white" : "#f8fafc",
                opacity: dragging === slide.id ? 0.5 : 1,
                cursor: "grab",
              }}
            >
              {/* Handle */}
              <div style={{ color: "#94a3b8", fontSize: 18, cursor: "grab", userSelect: "none", textAlign: "center" }}>⠿</div>

              {/* Thumbnail */}
              <div style={{ width: 120, height: 72, overflow: "hidden", borderRadius: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>

              {/* Captions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>Caption EN</label>
                  <input
                    defaultValue={slide.captionEn}
                    onBlur={e => update(slide.id, { captionEn: e.target.value })}
                    placeholder="e.g. Porto Katsiki · the cliff"
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, fontFamily: "system-ui", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>Caption GR</label>
                  <input
                    defaultValue={slide.captionGr}
                    onBlur={e => update(slide.id, { captionGr: e.target.value })}
                    placeholder="π.χ. Πόρτο Κατσίκι"
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 13, fontFamily: "system-ui", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => update(slide.id, { active: !slide.active })}
                  title={slide.active ? "Deactivate" : "Activate"}
                  style={{
                    padding: "4px 10px", borderRadius: 4, border: "1px solid #e2e8f0", fontSize: 11,
                    fontWeight: 600, cursor: "pointer", fontFamily: "system-ui",
                    background: slide.active ? "#f0fdf4" : "white", color: slide.active ? "#16a34a" : "#94a3b8",
                  }}
                >
                  {saving === slide.id ? "…" : slide.active ? "Live" : "Hidden"}
                </button>
                <button
                  onClick={() => remove(slide.id)}
                  style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #fee2e2", background: "#fef2f2", color: "#dc2626", fontSize: 13, cursor: "pointer" }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
