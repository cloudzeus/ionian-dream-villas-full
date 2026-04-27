"use client"
import { useState, useEffect, useCallback, useRef } from "react"

interface MediaItem {
  id: string
  filename: string
  bunnyUrl: string
  altEn: string
  altGr: string
  altDe: string
  folder: string
  usedBy: string | null
  width: number | null
  height: number | null
  size: number | null
  mimeType: string
  createdAt: string
}

interface Props {
  /** If provided, renders as a modal picker. Calls onSelect when items are picked. */
  mode?: "page" | "picker"
  multiple?: boolean
  onSelect?: (items: MediaItem[]) => void
  onClose?: () => void
  folder?: string
}

const btnBase: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  fontFamily: "ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 20px",
  borderRadius: 4,
}

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#0f172a",
  color: "white",
}

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  border: "1px solid #e2e8f0",
  color: "#0f172a",
}

function fmtBytes(n: number | null) {
  if (!n) return "—"
  if (n < 1024) return n + " B"
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB"
  return (n / 1024 / 1024).toFixed(1) + " MB"
}

export default function MediaGallery({ mode = "page", multiple = false, onSelect, onClose, folder: defaultFolder }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [folderFilter, setFolderFilter] = useState(defaultFolder || "")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editItem, setEditItem] = useState<MediaItem | null>(null)
  const [editAltEn, setEditAltEn] = useState("")
  const [editAltGr, setEditAltGr] = useState("")
  const [editAltDe, setEditAltDe] = useState("")
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const limit = 48

  const load = useCallback(async (p = 1, s = search, f = folderFilter) => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(p), limit: String(limit) })
    if (s) qs.set("search", s)
    if (f) qs.set("folder", f)
    const res = await fetch(`/api/admin/media?${qs}`)
    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.total || 0)
    setPage(p)
    setLoading(false)
  }, [search, folderFilter, limit])

  useEffect(() => { load(1, search, folderFilter) }, [search, folderFilter])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setUploadProgress(`Uploading 0 / ${files.length}…`)

    const fd = new FormData()
    files.forEach(f => fd.append("files", f))
    fd.append("folder", defaultFolder || "uploads")

    const res = await fetch("/api/admin/media", { method: "POST", body: fd })
    if (res.ok) {
      setUploadProgress(`Uploaded ${files.length} file${files.length > 1 ? "s" : ""}`)
      setTimeout(() => setUploadProgress(""), 3000)
      load(1)
    } else {
      setUploadProgress("Upload failed")
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!multiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  function confirmPick() {
    const picked = items.filter(i => selected.has(i.id))
    onSelect?.(picked)
  }

  function openEdit(item: MediaItem) {
    setEditItem(item)
    setEditAltEn(item.altEn)
    setEditAltGr(item.altGr)
    setEditAltDe(item.altDe)
  }

  async function saveEdit() {
    if (!editItem) return
    await fetch(`/api/admin/media/${editItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altEn: editAltEn, altGr: editAltGr, altDe: editAltDe }),
    })
    setEditItem(null)
    load(page)
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this media item? This cannot be undone.")) return
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" })
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
    load(page)
  }

  const totalPages = Math.ceil(total / limit)
  const isPickerMode = mode === "picker"

  const inner = (
    <div style={{ display: "flex", flexDirection: "column", height: isPickerMode ? "80vh" : "auto", minHeight: isPickerMode ? 400 : undefined }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Search filename or alt text…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            flex: 1,
            minWidth: 200,
            border: "1px solid #e2e8f0",
            background: "white",
            padding: "10px 14px",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            outline: "none",
            borderRadius: 4,
            color: "#0f172a",
          }}
        />
        <input
          type="text"
          placeholder="Folder filter…"
          value={folderFilter}
          onChange={e => { setFolderFilter(e.target.value); setPage(1) }}
          style={{
            width: 160,
            border: "1px solid #e2e8f0",
            background: "white",
            padding: "10px 14px",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            outline: "none",
            borderRadius: 4,
            color: "#0f172a",
          }}
        />
        <label style={{ ...btnSecondary, display: "inline-block", opacity: uploading ? 0.6 : 1, cursor: uploading ? "not-allowed" : "pointer" }}>
          {uploading ? "Uploading…" : "+ Upload"}
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
        </label>
        {uploadProgress && (
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#64748b" }}>{uploadProgress}</span>
        )}
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
          {total} item{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#94a3b8" }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#94a3b8" }}>No media found</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {items.map(item => {
              const isImg = item.mimeType.startsWith("image/")
              const isSelected = selected.has(item.id)
              return (
                <div
                  key={item.id}
                  onClick={() => isPickerMode && toggleSelect(item.id)}
                  style={{
                    border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                    overflow: "hidden",
                    cursor: isPickerMode ? "pointer" : "default",
                    position: "relative",
                    background: "#f8fafc",
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 22,
                      height: 22,
                      background: "#0f172a",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      zIndex: 2,
                    }}>✓</div>
                  )}

                  {isImg ? (
                    <img
                      src={item.bunnyUrl}
                      alt={item.altEn}
                      loading="lazy"
                      style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b" }}>
                      <span style={{ color: "white", fontFamily: "ui-monospace, monospace", fontSize: 11 }}>VIDEO</span>
                    </div>
                  )}

                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#64748b", wordBreak: "break-all", marginBottom: 4, lineHeight: 1.4 }}>
                      {item.filename.length > 28 ? item.filename.slice(0, 25) + "…" : item.filename}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "#94a3b8" }}>
                      {fmtBytes(item.size)}
                      {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
                    </div>
                    {!isPickerMode && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => openEdit(item)} style={{ ...btnSecondary, padding: "4px 10px", fontSize: 9 }}>Edit</button>
                        <button onClick={() => deleteItem(item.id)} style={{ ...btnBase, padding: "4px 10px", fontSize: 9, background: "transparent", border: "1px solid #c00", color: "#c00" }}>Del</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24, alignItems: "center" }}>
          <button onClick={() => load(page - 1)} disabled={page <= 1} style={{ ...btnSecondary, opacity: page <= 1 ? 0.4 : 1, padding: "8px 16px" }}>←</button>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#0f172a" }}>Page {page} / {totalPages}</span>
          <button onClick={() => load(page + 1)} disabled={page >= totalPages} style={{ ...btnSecondary, opacity: page >= totalPages ? 0.4 : 1, padding: "8px 16px" }}>→</button>
        </div>
      )}

      {/* Picker footer */}
      {isPickerMode && (
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
          <button onClick={confirmPick} disabled={selected.size === 0} style={{ ...btnPrimary, opacity: selected.size === 0 ? 0.4 : 1 }}>
            Use {selected.size > 0 ? `${selected.size} image${selected.size > 1 ? "s" : ""}` : "selected"} →
          </button>
        </div>
      )}
    </div>
  )

  if (isPickerMode) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,23,42,0.65)",
      }} onClick={e => e.target === e.currentTarget && onClose?.()}>
        <div style={{
          background: "#ffffff",
          width: "min(90vw, 1100px)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 32,
          overflowY: "auto",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "system-ui, sans-serif", fontSize: 22, fontWeight: 600, margin: 0, color: "#0f172a" }}>
              Media Library
            </h2>
            <button onClick={onClose} style={{ ...btnBase, background: "transparent", color: "#64748b", fontSize: 18, padding: "4px 12px" }}>✕</button>
          </div>
          {inner}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: 28, fontWeight: 600, margin: 0, color: "#0f172a" }}>Media Library</h1>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#94a3b8" }}>{total} items</span>
      </div>
      {inner}

      {/* Edit modal */}
      {editItem && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(28,42,51,0.6)",
        }} onClick={e => e.target === e.currentTarget && setEditItem(null)}>
          <div style={{ background: "#ffffff", width: "min(90vw, 560px)", padding: 32, borderRadius: 8 }}>
            <h2 style={{ fontFamily: "system-ui, sans-serif", fontSize: 22, fontWeight: 600, marginTop: 0, marginBottom: 24, color: "#0f172a" }}>Edit Alt Text</h2>
            <img src={editItem.bunnyUrl} alt="" style={{ width: "100%", height: 200, objectFit: "cover", marginBottom: 24, display: "block" }} />
            {[
              ["Alt (EN)", editAltEn, setEditAltEn],
              ["Alt (GR)", editAltGr, setEditAltGr],
              ["Alt (DE)", editAltDe, setEditAltDe],
            ].map(([label, value, setter]) => (
              <div key={label as string} style={{ marginBottom: 16 }}>
                <label className="mono-label" style={{ display: "block", marginBottom: 6 }}>{label as string}</label>
                <input
                  type="text"
                  value={value as string}
                  onChange={e => (setter as any)(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    padding: "10px 14px",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#0f172a",
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={saveEdit} style={btnPrimary}>Save →</button>
              <button onClick={() => setEditItem(null)} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
