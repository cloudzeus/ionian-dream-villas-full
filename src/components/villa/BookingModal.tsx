"use client"
import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/antispam"

interface Props {
  villaSlug: string
  villaName: string
  open: boolean
  onClose: () => void
}

export default function BookingModal({ villaSlug, villaName, open, onClose }: Props) {
  const t = useTranslations("booking")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [name, setName] = useState("")
  // Time-trap token: stored in a ref (no re-render), reset each time the modal opens.
  const loadedAt = useRef(0)
  useEffect(() => {
    if (open) loadedAt.current = Date.now()
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    const fd = new FormData(e.currentTarget)
    setName(String(fd.get("name") || ""))
    const body = {
      kind: "booking",
      name: fd.get("name"),
      email: fd.get("email"),
      villa: fd.get("villa"),
      arrival: fd.get("arrival"),
      nights: Number(fd.get("nights")),
      guests: Number(fd.get("guests")),
      message: fd.get("message"),
      [HONEYPOT_FIELD]: fd.get(HONEYPOT_FIELD) || "",
      [TIMESTAMP_FIELD]: loadedAt.current,
    }
    const res = await fetch("/api/enquire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setStatus(res.ok ? "success" : "error")
  }

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(28,42,51,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-bg)",
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 48,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-ink-soft)",
          }}
        >
          {t("close")} ×
        </button>

        <div className="mono-label" style={{ marginBottom: 16 }}>{t("heading")}</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, margin: "0 0 40px", fontStyle: "italic" }}>
          {villaName}
        </h2>

        {status === "success" ? (
          <div>
            {name && (
              <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-ink)", fontWeight: 600, marginBottom: 8 }}>
                {name},
              </p>
            )}
            <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-ink-soft)" }}>{t("success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Honeypot — hidden from humans, must stay empty. */}
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            <Field label={t("name")} name="name" type="text" required />
            <Field label={t("email")} name="email" type="email" required />
            <div>
              <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>{t("villa")}</label>
              <select
                name="villa"
                defaultValue={villaSlug}
                style={inputStyle}
              >
                {[["castro", "Castro"], ["jira", "Jira"], ["milos", "Milos"]].map(([v, n]) => (
                  <option key={v} value={v}>{n}</option>
                ))}
              </select>
            </div>
            <Field label={t("arrival")} name="arrival" type="date" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("nights")} name="nights" type="number" min="7" defaultValue="7" />
              <Field label={t("guests")} name="guests" type="number" min="1" max="6" defaultValue="2" />
            </div>
            <div>
              <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>{t("message")}</label>
              <textarea
                name="message"
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: "var(--color-ink)",
                color: "white",
                border: "none",
                padding: "18px 32px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                alignSelf: "flex-start",
                opacity: status === "sending" ? 0.6 : 1,
              }}
            >
              {status === "sending" ? "…" : t("send")}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type,
  required,
  min,
  max,
  defaultValue,
}: {
  label: string
  name: string
  type: string
  required?: boolean
  min?: string
  max?: string
  defaultValue?: string
}) {
  return (
    <div>
      <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        min={min}
        max={max}
        defaultValue={defaultValue}
        style={inputStyle}
      />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-rule)",
  background: "transparent",
  padding: "12px 16px",
  fontFamily: "var(--font-body)",
  fontSize: 16,
  color: "var(--color-ink)",
  outline: "none",
}
