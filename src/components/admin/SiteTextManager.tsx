"use client"
import { useState } from "react"

const LOCALES = ["en", "el", "de"] as const
type Locale = typeof LOCALES[number]
const LOCALE_LABELS: Record<Locale, string> = { en: "English", el: "Greek", de: "German" }

const GENERAL_FIELDS = [
  { key: "villasHeading", label: "Villas section heading", rows: 1 },
  { key: "villasSubheading", label: "Villas section subheading", rows: 1 },
  { key: "closingGreek", label: "Closing Greek phrase", rows: 1 },
  { key: "closingEn", label: "Closing English phrase", rows: 1 },
  { key: "reserve", label: "Reserve button text", rows: 1 },
]

const MOTTO_FIELDS = [
  { key: "motto0Eyebrow", label: "Motto 1 — eyebrow", rows: 1 },
  { key: "motto0Title", label: "Motto 1 — title", rows: 1 },
  { key: "motto0Body", label: "Motto 1 — body", rows: 3 },
  { key: "motto1Eyebrow", label: "Motto 2 — eyebrow", rows: 1 },
  { key: "motto1Title", label: "Motto 2 — title", rows: 1 },
  { key: "motto1Body", label: "Motto 2 — body", rows: 3 },
  { key: "motto2Eyebrow", label: "Motto 3 — eyebrow", rows: 1 },
  { key: "motto2Title", label: "Motto 3 — title", rows: 1 },
  { key: "motto2Body", label: "Motto 3 — body", rows: 3 },
]

const ALL_FIELDS = [...GENERAL_FIELDS, ...MOTTO_FIELDS]

interface Props { initialValues: Record<string, string> }

export default function SiteTextManager({ initialValues }: Props) {
  const [locale, setLocale] = useState<Locale>("en")
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const lk = (key: string, l = locale) => `${l}:${key}`
  const get = (key: string, l = locale) => values[lk(key, l)] ?? ""
  const set = (key: string, value: string) => setValues(prev => ({ ...prev, [lk(key)]: value }))

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  async function save() {
    setSaving(true)
    const payload: Record<string, string> = {}
    for (const l of LOCALES) {
      for (const { key } of ALL_FIELDS) payload[lk(key, l)] = get(key, l)
    }
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    flash(res.ok ? "Saved" : "Error saving", res.ok)
  }

  async function translateFromEN(targetLocale: "el" | "de") {
    setTranslating(true)
    try {
      const fields: Record<string, string> = {}
      for (const { key } of ALL_FIELDS) {
        const val = get(key, "en")
        if (val) fields[key] = val
      }
      const res = await fetch("/api/admin/ai/translate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, targetLocale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Translation failed")
      setValues(prev => {
        const next = { ...prev }
        for (const [key, val] of Object.entries(data)) {
          next[lk(key as string, targetLocale)] = val as string
        }
        return next
      })
      flash(`Translated all fields to ${LOCALE_LABELS[targetLocale]}`, true)
    } catch (e: any) {
      flash(e.message, false)
    } finally {
      setTranslating(false)
    }
  }

  async function generateMottos() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/ai/generate-mottos", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setValues(prev => {
        const next = { ...prev }
        for (const l of ["en", "el", "de"] as const) {
          const set = data[l]
          if (!set) continue
          for (const i of [0, 1, 2] as const) {
            const m = set[`motto${i}`]
            if (!m) continue
            next[lk(`motto${i}Eyebrow`, l)] = m.eyebrow ?? ""
            next[lk(`motto${i}Title`, l)] = m.title ?? ""
            next[lk(`motto${i}Body`, l)] = m.body ?? ""
          }
        }
        return next
      })
      flash("Generated 3 new mottos in EN + EL + DE", true)
    } catch (e: any) {
      flash(e.message, false)
    } finally {
      setGenerating(false)
    }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 4,
    fontSize: 13, fontFamily: "system-ui", boxSizing: "border-box", background: "white", color: "#0f172a",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
    letterSpacing: "0.06em", display: "block", marginBottom: 4,
  }
  const btnAI: React.CSSProperties = {
    padding: "6px 12px", borderRadius: 5, border: "1px solid #7c3aed", background: "#7c3aed",
    color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: 5, opacity: (translating || generating) ? 0.6 : 1,
  }

  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8 }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Site Text</h2>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Edit homepage text per language. Use AI to translate or auto-generate mottos.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LOCALES.map(l => (
            <button key={l} onClick={() => setLocale(l)} style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: locale === l ? "#2563eb" : "white",
              color: locale === l ? "white" : "#64748b",
            }}>{LOCALE_LABELS[l]}</button>
          ))}
        </div>
      </div>

      {/* AI toolbar */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #f1f5f9", background: "#faf5ff", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", textTransform: "uppercase" }}>✦ AI</span>
        <button
          style={btnAI}
          disabled={translating || generating}
          onClick={generateMottos}
        >
          {generating ? "Generating…" : "✦ Generate mottos (all languages)"}
        </button>
        {locale !== "en" && (
          <button
            style={btnAI}
            disabled={translating || generating}
            onClick={() => translateFromEN(locale as "el" | "de")}
          >
            {translating ? "Translating…" : `✦ Translate all from EN → ${LOCALE_LABELS[locale]}`}
          </button>
        )}
        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>
          {locale === "en" ? "Switch to EL or DE to see translate option" : ""}
        </span>
      </div>

      {msg && (
        <div style={{
          margin: "12px 24px 0", padding: "10px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: msg.ok ? "#f0fdf4" : "#fef2f2",
          color: msg.ok ? "#16a34a" : "#dc2626",
          border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
        }}>{msg.text}</div>
      )}

      {/* General fields */}
      <div style={{ padding: "20px 24px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>General</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {GENERAL_FIELDS.map(({ key, label, rows }) => (
            <div key={key} style={{ gridColumn: rows > 1 ? "span 2" : "span 1" }}>
              <span style={labelStyle}>{label}</span>
              {rows > 1 ? (
                <textarea value={get(key)} onChange={e => set(key, e.target.value)} rows={rows} style={{ ...input, resize: "vertical" }} />
              ) : (
                <input type="text" value={get(key)} onChange={e => set(key, e.target.value)} style={input} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mottos */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Mottos</p>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>— or click "Generate mottos" above to replace all with AI-written content</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {MOTTO_FIELDS.map(({ key, label, rows }) => (
            <div key={key} style={{ gridColumn: rows > 1 ? "span 2" : "span 1" }}>
              <span style={labelStyle}>{label}</span>
              {rows > 1 ? (
                <textarea value={get(key)} onChange={e => set(key, e.target.value)} rows={rows} style={{ ...input, resize: "vertical" }} />
              ) : (
                <input type="text" value={get(key)} onChange={e => set(key, e.target.value)} style={input} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div style={{ padding: "20px 24px 24px" }}>
        <button onClick={save} disabled={saving} style={{
          background: "#2563eb", color: "white", border: "none", borderRadius: 6,
          padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          opacity: saving ? 0.6 : 1,
        }}>{saving ? "Saving…" : "Save all text"}</button>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
          Saves all locales at once. Overrides default translation files.
        </p>
      </div>
    </div>
  )
}
