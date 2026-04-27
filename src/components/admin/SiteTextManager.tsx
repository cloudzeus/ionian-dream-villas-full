"use client"
import { useState } from "react"

const LOCALES = ["en", "el", "de"] as const
type Locale = typeof LOCALES[number]
const LOCALE_LABELS: Record<Locale, string> = { en: "English", el: "Greek", de: "German" }

// Fields use dot-notation namespacing: "namespace.key"
const GENERAL_FIELDS = [
  { key: "home.villasHeading", label: "Villas section heading", rows: 1 },
  { key: "home.villasSubheading", label: "Villas section subheading", rows: 1 },
  { key: "home.closingGreek", label: "Closing Greek phrase", rows: 1 },
  { key: "home.closingEn", label: "Closing English phrase", rows: 1 },
  { key: "home.reserve", label: "Reserve button text", rows: 1 },
]

const MOTTO_FIELDS = [
  { key: "home.mottos.0.eyebrow", label: "Motto 1 — eyebrow", rows: 1 },
  { key: "home.mottos.0.title", label: "Motto 1 — title", rows: 1 },
  { key: "home.mottos.0.body", label: "Motto 1 — body", rows: 3 },
  { key: "home.mottos.1.eyebrow", label: "Motto 2 — eyebrow", rows: 1 },
  { key: "home.mottos.1.title", label: "Motto 2 — title", rows: 1 },
  { key: "home.mottos.1.body", label: "Motto 2 — body", rows: 3 },
  { key: "home.mottos.2.eyebrow", label: "Motto 3 — eyebrow", rows: 1 },
  { key: "home.mottos.2.title", label: "Motto 3 — title", rows: 1 },
  { key: "home.mottos.2.body", label: "Motto 3 — body", rows: 3 },
]

const RATES_FIELDS = [
  { key: "rates.termsDeposit", label: "Terms — Deposit label", rows: 1 },
  { key: "rates.termsDepositBody", label: "Terms — Deposit text", rows: 2 },
  { key: "rates.termsIncluded", label: "Terms — Included label", rows: 1 },
  { key: "rates.termsIncludedBody", label: "Terms — Included text", rows: 2 },
  { key: "rates.termsCleaning", label: "Terms — Cleaning label", rows: 1 },
  { key: "rates.termsCleaningBody", label: "Terms — Cleaning text", rows: 2 },
  { key: "rates.termsMinStay", label: "Terms — Minimum stay label", rows: 1 },
  { key: "rates.termsMinStayBody", label: "Terms — Minimum stay text", rows: 2 },
  { key: "rates.ctaBody", label: "Reservations CTA body text", rows: 2 },
]

const LOCATION_FIELDS = [
  { key: "lefkada.heading", label: "Lefkada page heading", rows: 1 },
  { key: "lefkada.subheading", label: "Lefkada page subheading", rows: 1 },
  { key: "lefkada.readMore", label: "Read more button", rows: 1 },
  { key: "lefkada.backToGuide", label: "Back to guide link", rows: 1 },
  { key: "lefkada.aboutPlace", label: "\"About this place\" label", rows: 1 },
  { key: "lefkada.gallery", label: "Gallery label", rows: 1 },
  { key: "lefkada.details", label: "Details label", rows: 1 },
  { key: "lefkada.stayClose", label: "CTA — \"Stay close\" text", rows: 1 },
  { key: "lefkada.viewVillas", label: "CTA — View villas button", rows: 1 },
]

const VILLA_FIELDS = [
  { key: "villa.aboutVilla", label: "About the villa label", rows: 1 },
  { key: "villa.rooms", label: "Rooms label", rows: 1 },
  { key: "villa.amenities", label: "Amenities label", rows: 1 },
  { key: "villa.facilities", label: "Facilities label", rows: 1 },
  { key: "villa.gallery", label: "Gallery label", rows: 1 },
  { key: "villa.otherVillas", label: "Other villas label", rows: 1 },
  { key: "villa.bookCta", label: "Book CTA prefix", rows: 1 },
  { key: "villa.bookBtn", label: "Book button text", rows: 1 },
  { key: "villa.stayClose", label: "CTA — \"Stay close\" text", rows: 1 },
]

const SECTIONS: { label: string; fields: typeof GENERAL_FIELDS }[] = [
  { label: "General (Homepage)", fields: GENERAL_FIELDS },
  { label: "Mottos", fields: MOTTO_FIELDS },
  { label: "Rates Page Terms", fields: RATES_FIELDS },
  { label: "Location Pages", fields: LOCATION_FIELDS },
  { label: "Villa Pages", fields: VILLA_FIELDS },
]

const ALL_FIELDS = [...GENERAL_FIELDS, ...MOTTO_FIELDS, ...RATES_FIELDS, ...LOCATION_FIELDS, ...VILLA_FIELDS]

interface Props { initialValues: Record<string, string> }

export default function SiteTextManager({ initialValues }: Props) {
  const [locale, setLocale] = useState<Locale>("en")
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // DB keys are stored as "{locale}:{dotKey}" e.g. "el:rates.termsDeposit"
  const lk = (key: string, l = locale) => `${l}:${key}`
  const get = (key: string, l = locale) => values[lk(key, l)] ?? ""
  const set = (key: string, value: string) => setValues(prev => ({ ...prev, [lk(key)]: value }))

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 4000)
  }

  async function save() {
    setSaving(true)
    const payload: Record<string, string> = {}
    for (const l of LOCALES) {
      for (const { key } of ALL_FIELDS) {
        const val = get(key, l)
        if (val) payload[lk(key, l)] = val
      }
    }
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    flash(res.ok ? "All text saved — changes go live on next page load." : "Error saving", res.ok)
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
            next[lk(`home.mottos.${i}.eyebrow`, l)] = m.eyebrow ?? ""
            next[lk(`home.mottos.${i}.title`, l)] = m.title ?? ""
            next[lk(`home.mottos.${i}.body`, l)] = m.body ?? ""
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
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Site Text & Translations</h2>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
            Edit all page labels per language. DB values override the default translation files on every page load.
          </p>
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
        <button style={btnAI} disabled={translating || generating} onClick={generateMottos}>
          {generating ? "Generating…" : "✦ Generate mottos (all languages)"}
        </button>
        {locale !== "en" && (
          <button style={btnAI} disabled={translating || generating} onClick={() => translateFromEN(locale as "el" | "de")}>
            {translating ? "Translating…" : `✦ Translate ALL fields from EN → ${LOCALE_LABELS[locale]}`}
          </button>
        )}
        <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>
          {locale === "en" ? "Switch to EL or DE to enable auto-translate" : ""}
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

      {/* Sections */}
      {SECTIONS.map(section => (
        <div key={section.label} style={{ padding: "20px 24px 0" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            {section.label}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {section.fields.map(({ key, label, rows }) => (
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
      ))}

      {/* Save */}
      <div style={{ padding: "20px 24px 24px" }}>
        <button onClick={save} disabled={saving} style={{
          background: "#2563eb", color: "white", border: "none", borderRadius: 6,
          padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          opacity: saving ? 0.6 : 1,
        }}>{saving ? "Saving…" : "Save all text"}</button>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
          Saves all locales. DB values override JSON defaults on every page load — no redeployment needed.
        </p>
      </div>
    </div>
  )
}
