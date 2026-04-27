"use client"
import { useState } from "react"

const LOCALES = ["en", "el", "de"] as const
const LOCALE_LABELS = { en: "English", el: "Greek", de: "German" }

const FIELDS = [
  { key: "villasHeading", label: "Villas section heading", rows: 1 },
  { key: "villasSubheading", label: "Villas section subheading", rows: 1 },
  { key: "closingGreek", label: "Closing Greek phrase", rows: 1 },
  { key: "closingEn", label: "Closing English phrase", rows: 1 },
  { key: "reserve", label: "Reserve button text", rows: 1 },
  { key: "motto0Eyebrow", label: "Motto 1 — eyebrow", rows: 1 },
  { key: "motto0Title", label: "Motto 1 — title", rows: 1 },
  { key: "motto0Body", label: "Motto 1 — body text", rows: 3 },
  { key: "motto1Eyebrow", label: "Motto 2 — eyebrow", rows: 1 },
  { key: "motto1Title", label: "Motto 2 — title", rows: 1 },
  { key: "motto1Body", label: "Motto 2 — body text", rows: 3 },
  { key: "motto2Eyebrow", label: "Motto 3 — eyebrow", rows: 1 },
  { key: "motto2Title", label: "Motto 3 — title", rows: 1 },
  { key: "motto2Body", label: "Motto 3 — body text", rows: 3 },
]

interface Props {
  initialValues: Record<string, string>
}

export default function SiteTextManager({ initialValues }: Props) {
  const [locale, setLocale] = useState<"en" | "el" | "de">("en")
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const localeKey = (key: string) => `${locale}:${key}`

  const get = (key: string) => values[localeKey(key)] ?? ""
  const set = (key: string, value: string) =>
    setValues(prev => ({ ...prev, [localeKey(key)]: value }))

  async function save() {
    setSaving(true)
    const payload: Record<string, string> = {}
    for (const { key } of FIELDS) {
      payload[localeKey(key)] = get(key)
    }
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    setMsg({ text: res.ok ? "Saved" : "Error saving", ok: res.ok })
    setTimeout(() => setMsg(null), 2500)
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 4,
    fontSize: 13, fontFamily: "system-ui", boxSizing: "border-box", background: "white",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
    letterSpacing: "0.06em", display: "block", marginBottom: 4,
  }

  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8 }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Site Text</h2>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Edit homepage mottos, headings, and button labels per language.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {LOCALES.map(l => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: locale === l ? "#2563eb" : "white",
                color: locale === l ? "white" : "#64748b",
              }}
            >{LOCALE_LABELS[l]}</button>
          ))}
        </div>
      </div>

      {msg && (
        <div style={{
          margin: "16px 24px 0", padding: "10px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: msg.ok ? "#f0fdf4" : "#fef2f2",
          color: msg.ok ? "#16a34a" : "#dc2626",
          border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
        }}>{msg.text}</div>
      )}

      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {FIELDS.map(({ key, label, rows }) => (
          <div key={key} style={{ gridColumn: rows > 1 ? "span 2" : "span 1" }}>
            <span style={labelStyle}>{label}</span>
            {rows > 1 ? (
              <textarea
                value={get(key)}
                onChange={e => set(key, e.target.value)}
                rows={rows}
                style={{ ...input, resize: "vertical" }}
              />
            ) : (
              <input
                type="text"
                value={get(key)}
                onChange={e => set(key, e.target.value)}
                style={input}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "0 24px 20px" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
        >{saving ? "Saving…" : "Save text"}</button>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
          Note: changes are stored in the database and override the default translation files.
        </p>
      </div>
    </div>
  )
}
