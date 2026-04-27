"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface PageEntry {
  pageKey: string
  label: string
  group: string
}

interface SeoRecord {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  keywords: string
}

const LOCALES = ["en", "el", "de"] as const
type Locale = typeof LOCALES[number]

const LOCALE_LABELS: Record<Locale, string> = { en: "English", el: "Greek (Ελληνικά)", de: "German (Deutsch)" }

const charHint = (val: string, max: number) => {
  const n = val?.length ?? 0
  const color = n > max ? "#ef4444" : n > max * 0.85 ? "#f59e0b" : "#6b7280"
  return <span style={{ fontSize: 11, color }}>{n}/{max}</span>
}

function SeoForm({
  pageKey,
  locale,
  initial,
  onSaved,
}: {
  pageKey: string
  locale: Locale
  initial: SeoRecord | null
  onSaved: (rec: SeoRecord) => void
}) {
  const [form, setForm] = useState<SeoRecord>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
    keywords: initial?.keywords ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof SeoRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/ai/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, locale }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setForm({
        title: data.title ?? form.title,
        description: data.description ?? form.description,
        ogTitle: data.ogTitle ?? data.title ?? form.ogTitle,
        ogDescription: data.ogDescription ?? data.description ?? form.ogDescription,
        keywords: data.keywords ?? form.keywords,
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, locale, ...form }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onSaved(data)
      setSavedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* AI generate button */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={generating}
          style={{ borderColor: "#7c3aed", color: "#7c3aed", fontSize: 12 }}
        >
          {generating ? "Generating…" : "✦ AI Generate SEO"}
        </Button>
        {savedAt && <span style={{ fontSize: 12, color: "#6b7280" }}>Saved at {savedAt}</span>}
        {error && <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Title */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label style={{ fontSize: 12 }}>Meta Title</Label>
            {charHint(form.title, 60)}
          </div>
          <Input value={form.title} onChange={set("title")} placeholder="Page title (max 60 chars)" />
        </div>

        {/* OG Title */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label style={{ fontSize: 12 }}>OG Title</Label>
            {charHint(form.ogTitle, 60)}
          </div>
          <Input value={form.ogTitle} onChange={set("ogTitle")} placeholder="Same as title or catchier variant" />
        </div>

        {/* Description */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label style={{ fontSize: 12 }}>Meta Description</Label>
            {charHint(form.description, 155)}
          </div>
          <Textarea value={form.description} onChange={set("description")} placeholder="Description (140-155 chars)" rows={3} />
        </div>

        {/* OG Description */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label style={{ fontSize: 12 }}>OG Description</Label>
            {charHint(form.ogDescription, 155)}
          </div>
          <Textarea value={form.ogDescription} onChange={set("ogDescription")} placeholder="Social share description" rows={3} />
        </div>
      </div>

      {/* Keywords */}
      <div>
        <Label style={{ fontSize: 12, marginBottom: 6, display: "block" }}>Keywords (comma-separated)</Label>
        <Input value={form.keywords} onChange={set("keywords")} placeholder="e.g. villa Lefkada, luxury Greece, private pool" />
      </div>

      {/* Google preview */}
      {(form.title || form.description) && (
        <div style={{ background: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Google Preview</div>
          <div style={{ fontSize: 18, color: "#1a0dab", marginBottom: 2, lineHeight: 1.3 }}>{form.title || "Page title"}</div>
          <div style={{ fontSize: 12, color: "#006621", marginBottom: 4 }}>https://ionian-dream-villas.com › ...</div>
          <div style={{ fontSize: 13, color: "#545454", lineHeight: 1.5 }}>{form.description || "Description will appear here"}</div>
        </div>
      )}

      <div style={{ paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  )
}

function PageSeoPanel({ page, records, onSaved }: {
  page: PageEntry
  records: Record<Locale, SeoRecord | null>
  onSaved: (locale: Locale, rec: SeoRecord) => void
}) {
  return (
    <Tabs defaultValue="en">
      <TabsList>
        {LOCALES.map(l => (
          <TabsTrigger key={l} value={l} style={{ fontSize: 12 }}>
            {LOCALE_LABELS[l]}
            {records[l]?.title && <span style={{ marginLeft: 6, width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
          </TabsTrigger>
        ))}
      </TabsList>
      {LOCALES.map(l => (
        <TabsContent key={l} value={l} style={{ paddingTop: 20 }}>
          <SeoForm
            pageKey={page.pageKey}
            locale={l}
            initial={records[l]}
            onSaved={(rec) => onSaved(l, rec)}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function SeoManager({
  pages,
  initialRecords,
}: {
  pages: PageEntry[]
  initialRecords: Record<string, Record<Locale, SeoRecord | null>>
}) {
  const [records, setRecords] = useState(initialRecords)
  const [activeGroup, setActiveGroup] = useState<string>("main")

  const groups = Array.from(new Set(pages.map(p => p.group)))

  function handleSaved(pageKey: string, locale: Locale, rec: SeoRecord) {
    setRecords(prev => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] ?? { en: null, el: null, de: null }), [locale]: rec },
    }))
  }

  const filteredPages = pages.filter(p => p.group === activeGroup)

  const pageCompleteness = (pageKey: string) => {
    const rec = records[pageKey]
    if (!rec) return 0
    return LOCALES.filter(l => rec[l]?.title).length
  }

  return (
    <div>
      {/* Group tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12,
              border: "1px solid",
              borderColor: activeGroup === g ? "#0f172a" : "#e2e8f0",
              background: activeGroup === g ? "#0f172a" : "white",
              color: activeGroup === g ? "white" : "#374151",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Page list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredPages.map(page => {
          const done = pageCompleteness(page.pageKey)
          return (
            <details key={page.pageKey} style={{ borderTop: "1px solid #f1f5f9" }}>
              <summary style={{
                padding: "16px 0", cursor: "pointer", listStyle: "none",
                display: "flex", alignItems: "center", gap: 12,
                fontWeight: 500, fontSize: 14,
              }}>
                <span style={{ flex: 1 }}>{page.label}</span>
                <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{page.pageKey}</span>
                <Badge variant={done === 3 ? "default" : done > 0 ? "secondary" : "outline"} style={{ fontSize: 10 }}>
                  {done}/3 locales
                </Badge>
              </summary>
              <div style={{ padding: "0 0 24px" }}>
                <PageSeoPanel
                  page={page}
                  records={records[page.pageKey] ?? { en: null, el: null, de: null }}
                  onSaved={(locale, rec) => handleSaved(page.pageKey, locale, rec)}
                />
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
