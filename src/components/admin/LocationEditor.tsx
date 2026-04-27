"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, PlusIcon, Trash2, Star, Loader2, Wand2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface LocImage { id: string; url: string; altEn: string; sortOrder: number; isCover: boolean }
interface FactTr { id: string; locale: string; label: string; value: string }
interface Fact { id: string; sortOrder: number; translations: FactTr[] }
interface LocTr { id: string; locale: string; name: string; nameLocal: string; kind: string; short: string; long: string }
interface Location {
  id: string; slug: string; tone: string; sortOrder: number; published: boolean
  translations: LocTr[]
  images: LocImage[]
  facts: Fact[]
}

const LOCALES = ["en", "el", "de"] as const
const LOCALE_LABELS: Record<string, string> = { en: "English", el: "Greek (Ελληνικά)", de: "German (Deutsch)" }

// ─── Sortable image card ────────────────────────────────────────────────────
function SortableImageCard({
  img,
  onSetCover,
  onDelete,
}: {
  img: LocImage
  onSetCover: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: img.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg overflow-hidden bg-card",
        img.isCover ? "border-primary border-2" : "border-border"
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <Image src={img.url} alt={img.altEn || ""} fill className="object-cover" sizes="30vw" />
        {img.isCover && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
            COVER
          </div>
        )}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 bg-black/50 text-white rounded p-1 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </button>
      </div>
      <div className="p-2.5">
        <div className="text-xs text-muted-foreground mb-2 break-all line-clamp-1">{img.altEn || "No alt text"}</div>
        <div className="flex gap-1.5">
          {!img.isCover && (
            <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => onSetCover(img.id)}>
              <Star className="h-3 w-3 mr-1" /> Cover
            </Button>
          )}
          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onDelete(img.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Sortable fact row ───────────────────────────────────────────────────────
function SortableFactRow({
  fact,
  locationId,
  onDelete,
  saving,
}: {
  fact: Fact
  locationId: string
  onDelete: (id: string) => void
  saving: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: fact.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border rounded-lg p-4 bg-card mb-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground">Fact #{fact.sortOrder + 1}</span>
        </div>
        <Button size="sm" variant="destructive" onClick={() => onDelete(fact.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {LOCALES.map((locale, li) => (
        <FactLocaleRow
          key={locale}
          fact={fact}
          locale={locale}
          locationId={locationId}
          saving={saving}
          isLast={li === LOCALES.length - 1}
        />
      ))}
    </div>
  )
}

function FactLocaleRow({
  fact,
  locale,
  locationId,
  saving,
  isLast,
}: {
  fact: Fact
  locale: string
  locationId: string
  saving: boolean
  isLast: boolean
}) {
  const ft = fact.translations.find(t => t.locale === locale) || { id: "", locale, label: "", value: "" }
  const [lbl, setLbl] = useState(ft.label)
  const [val, setVal] = useState(ft.value)

  async function save() {
    const res = await fetch(`/api/admin/locations/${locationId}/facts/${fact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, label: lbl, value: val }),
    })
    if (res.ok) toast.success("Saved")
    else toast.error("Save failed")
  }

  return (
    <div className={cn("pb-3 mb-3", !isLast && "border-b border-border/50")}>
      <div className="text-xs font-semibold text-muted-foreground mb-2">{LOCALE_LABELS[locale]}</div>
      <div className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
        <div>
          <Label className="text-xs mb-1 block">Label</Label>
          <Input className="h-8 text-sm" value={lbl} onChange={e => setLbl(e.target.value)} placeholder="Distance from villas" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Value</Label>
          <Input className="h-8 text-sm" value={val} onChange={e => setVal(e.target.value)} placeholder="Roughly 45 km…" />
        </div>
        <Button size="sm" className="h-8" onClick={save} disabled={saving}>Save</Button>
      </div>
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────
export default function LocationEditor({ location }: { location: Location }) {
  const [tab, setTab] = useState<"general" | "translations" | "images" | "facts">("general")
  const [saving, setSaving] = useState(false)

  // General state
  const [slug, setSlug] = useState(location.slug)
  const [tone, setTone] = useState(location.tone)
  const [sortOrder, setSortOrder] = useState(location.sortOrder)
  const [published, setPublished] = useState(location.published)

  // Translations
  const initTr = () => {
    const map: Record<string, LocTr> = {}
    for (const locale of LOCALES) {
      const t = location.translations.find(t => t.locale === locale)
      map[locale] = t || { id: "", locale, name: "", nameLocal: "", kind: "", short: "", long: "" }
    }
    return map
  }
  const [translations, setTranslations] = useState(initTr)
  const [translatingLocale, setTranslatingLocale] = useState<string | null>(null)

  // Images
  const [images, setImages] = useState<LocImage[]>(
    [...location.images].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [addImageOpen, setAddImageOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageAlt, setNewImageAlt] = useState("")
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null)

  // Facts
  const [facts, setFacts] = useState<Fact[]>(
    [...location.facts].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [addFactOpen, setAddFactOpen] = useState(false)
  const [deleteFactId, setDeleteFactId] = useState<string | null>(null)

  const imageSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const factSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Helpers ──────────────────────────────────────────────────────────────
  async function patch(endpoint: string, body: object) {
    setSaving(true)
    try {
      const res = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      toast.success("Saved")
    } catch (e: any) {
      toast.error("Error: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveGeneral() {
    await patch(`/api/admin/locations/${location.id}`, { slug, tone, sortOrder, published })
  }

  async function saveTr(locale: string) {
    const t = translations[locale]
    await patch(`/api/admin/locations/${location.id}/translations/${locale}`, t)
  }

  async function translateWithAI(targetLocale: string) {
    const en = translations["en"]
    setTranslatingLocale(targetLocale)
    try {
      const res = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: { name: en.name, nameLocal: en.nameLocal, kind: en.kind, short: en.short, long: en.long },
          targetLocale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Translation failed")
      setTranslations(prev => ({ ...prev, [targetLocale]: { ...prev[targetLocale], ...data } }))
      toast.success(`Translated to ${LOCALE_LABELS[targetLocale]}`)
    } catch (e: any) {
      toast.error("Translation failed: " + e.message)
    } finally {
      setTranslatingLocale(null)
    }
  }

  async function addImage() {
    if (!newImageUrl.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/locations/${location.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newImageUrl.trim(), altEn: newImageAlt.trim(), sortOrder: images.length, isCover: images.length === 0 }),
      })
      const img = await res.json()
      if (!res.ok) throw new Error(img.error)
      setImages(prev => [...prev, img])
      setNewImageUrl(""); setNewImageAlt("")
      setAddImageOpen(false)
      toast.success("Image added")
    } catch (e: any) {
      toast.error("Error: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteImage(imgId: string) {
    const res = await fetch(`/api/admin/locations/${location.id}/images/${imgId}`, { method: "DELETE" })
    if (res.ok) {
      setImages(prev => prev.filter(i => i.id !== imgId))
      toast.success("Image deleted")
    } else {
      toast.error("Delete failed")
    }
  }

  async function setCover(imgId: string) {
    const res = await fetch(`/api/admin/locations/${location.id}/images/${imgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCover: true }),
    })
    if (res.ok) {
      setImages(prev => prev.map(i => ({ ...i, isCover: i.id === imgId })))
      toast.success("Cover updated")
    }
  }

  async function handleImageDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex(i => i.id === active.id)
    const newIndex = images.findIndex(i => i.id === over.id)
    const newImages = arrayMove(images, oldIndex, newIndex)
    setImages(newImages)
    // Persist each new sortOrder
    await Promise.all(
      newImages.map((img, idx) =>
        fetch(`/api/admin/locations/${location.id}/images/${img.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: idx }),
        })
      )
    )
    toast.success("Image order saved")
  }

  async function addFact() {
    const res = await fetch(`/api/admin/locations/${location.id}/facts`, { method: "POST" })
    const fact = await res.json()
    if (res.ok) {
      setFacts(prev => [...prev, fact])
      setAddFactOpen(false)
      toast.success("Fact added")
    } else {
      toast.error("Failed to add fact")
    }
  }

  async function deleteFact(factId: string) {
    const res = await fetch(`/api/admin/locations/${location.id}/facts/${factId}`, { method: "DELETE" })
    if (res.ok) {
      setFacts(prev => prev.filter(f => f.id !== factId))
      toast.success("Fact deleted")
    } else {
      toast.error("Delete failed")
    }
  }

  async function handleFactDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = facts.findIndex(f => f.id === active.id)
    const newIndex = facts.findIndex(f => f.id === over.id)
    const newFacts = arrayMove(facts, oldIndex, newIndex).map((f, i) => ({ ...f, sortOrder: i }))
    setFacts(newFacts)
    // Could add a reorder API call here if needed
  }

  const tabList = [
    { key: "general", label: "General" },
    { key: "translations", label: "Translations" },
    { key: "images", label: `Images (${images.length})` },
    { key: "facts", label: `Facts (${facts.length})` },
  ] as const

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/admin/locations" className="text-sm text-muted-foreground hover:text-foreground">
            ← Locations
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">
            {location.translations.find(t => t.locale === "en")?.name || location.slug}
          </h1>
          <div className="text-xs text-muted-foreground mt-0.5">/{location.slug}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/en/lefkada/${location.slug}`} target="_blank">Preview ↗</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabList.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {tab === "general" && (
        <div className="border border-border rounded-xl p-6 bg-card space-y-5">
          <h2 className="text-base font-semibold text-foreground">General Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Slug</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Tone (sea / sand / stone / deep)</Label>
              <Input value={tone} onChange={e => setTone(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="pub" checked={published} onChange={e => setPublished(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="pub">Published</Label>
            </div>
          </div>
          <Button onClick={saveGeneral} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save General"}
          </Button>
        </div>
      )}

      {/* ── TRANSLATIONS ── */}
      {tab === "translations" && (
        <div className="space-y-5">
          {LOCALES.map(locale => {
            const t = translations[locale]
            const isEN = locale === "en"
            return (
              <div key={locale} className="border border-border rounded-xl p-6 bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">{LOCALE_LABELS[locale]}</h2>
                  {!isEN && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => translateWithAI(locale)}
                      disabled={translatingLocale === locale}
                    >
                      {translatingLocale === locale ? (
                        <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Translating…</>
                      ) : (
                        <><Wand2 className="h-3 w-3 mr-1.5" /> Translate with AI</>
                      )}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Name</Label>
                    <Input value={t.name} onChange={e => setTranslations(prev => ({ ...prev, [locale]: { ...prev[locale], name: e.target.value } }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Local name (Greek)</Label>
                    <Input value={t.nameLocal} onChange={e => setTranslations(prev => ({ ...prev, [locale]: { ...prev[locale], nameLocal: e.target.value } }))} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Kind / Category</Label>
                    <Input value={t.kind} onChange={e => setTranslations(prev => ({ ...prev, [locale]: { ...prev[locale], kind: e.target.value } }))} placeholder="e.g. Beach · west coast" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Short description</Label>
                  <Textarea className="min-h-20 resize-y" value={t.short} onChange={e => setTranslations(prev => ({ ...prev, [locale]: { ...prev[locale], short: e.target.value } }))} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Long description</Label>
                  <Textarea className="min-h-36 resize-y" value={t.long} onChange={e => setTranslations(prev => ({ ...prev, [locale]: { ...prev[locale], long: e.target.value } }))} />
                </div>
                <Button onClick={() => saveTr(locale)} disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : `Save ${locale.toUpperCase()}`}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── IMAGES ── */}
      {tab === "images" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddImageOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Image
            </Button>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No images yet. Add one above.</div>
          ) : (
            <DndContext sensors={imageSensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
              <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 gap-4">
                  {images.map(img => (
                    <SortableImageCard
                      key={img.id}
                      img={img}
                      onSetCover={setCover}
                      onDelete={setDeleteImageId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* ── FACTS ── */}
      {tab === "facts" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddFactOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Fact
            </Button>
          </div>

          {facts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No facts yet. Add one above.</div>
          ) : (
            <DndContext sensors={factSensors} collisionDetection={closestCenter} onDragEnd={handleFactDragEnd}>
              <SortableContext items={facts.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {facts.map(fact => (
                  <SortableFactRow
                    key={fact.id}
                    fact={fact}
                    locationId={location.id}
                    onDelete={setDeleteFactId}
                    saving={saving}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* ── Add Image Dialog ── */}
      <Dialog open={addImageOpen} onOpenChange={setAddImageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Image URL (BunnyCDN or Strapi)</Label>
              <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Alt text (English)</Label>
              <Input value={newImageAlt} onChange={e => setNewImageAlt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={addImage} disabled={saving || !newImageUrl}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding…</> : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Fact Dialog ── */}
      <Dialog open={addFactOpen} onOpenChange={setAddFactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fact</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">A new empty fact will be created. Fill in labels and values in each language after adding.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={addFact}>Add Fact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Image confirm ── */}
      <AlertDialog
        open={deleteImageId !== null}
        onOpenChange={open => !open && setDeleteImageId(null)}
        title="Delete image?"
        description="This image will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => { if (deleteImageId) deleteImage(deleteImageId) }}
      />

      {/* ── Delete Fact confirm ── */}
      <AlertDialog
        open={deleteFactId !== null}
        onOpenChange={open => !open && setDeleteFactId(null)}
        title="Delete fact?"
        description="This fact and all its translations will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => { if (deleteFactId) deleteFact(deleteFactId) }}
      />
    </div>
  )
}
