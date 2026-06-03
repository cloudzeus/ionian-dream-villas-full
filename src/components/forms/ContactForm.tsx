"use client"
import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/antispam"

export default function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contact")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [name, setName] = useState("")
  // Time-trap token: stored in a ref (no re-render, no hydration drift), set on mount.
  const loadedAt = useRef(0)
  useEffect(() => {
    loadedAt.current = Date.now()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    const fd = new FormData(e.currentTarget)
    setName(String(fd.get("name") || ""))
    const res = await fetch("/api/enquire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "contact",
        name: fd.get("name"),
        email: fd.get("email"),
        villa: fd.get("villa") || undefined,
        message: fd.get("message"),
        [HONEYPOT_FIELD]: fd.get(HONEYPOT_FIELD) || "",
        [TIMESTAMP_FIELD]: loadedAt.current,
      }),
    })
    setStatus(res.ok ? "success" : "error")
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

  if (status === "success") {
    return (
      <div style={{ paddingTop: 40 }}>
        {name && (
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-ink)", fontWeight: 600, marginBottom: 8 }}>
            {name},
          </p>
        )}
        <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-ink-soft)" }}>{t("success")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 16 }}>
      {/* Honeypot — hidden from humans, tempting to bots. Must stay empty. */}
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {[["name", t("name"), "text"], ["email", t("email"), "email"]].map(([name, label, type]) => (
        <div key={name}>
          <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>{label}</label>
          <input type={type} name={name} required style={inputStyle} />
        </div>
      ))}
      <div>
        <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>{t("villa")}</label>
        <select name="villa" style={inputStyle}>
          <option value="">—</option>
          {[["castro", "Castro"], ["jira", "Jira"], ["milos", "Milos"]].map(([v, n]) => (
            <option key={v} value={v}>{n}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>{t("message")}</label>
        <textarea name="message" required rows={6} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        style={{ background: "var(--color-ink)", color: "white", border: "none", padding: "18px 32px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start", opacity: status === "sending" ? 0.6 : 1 }}
      >
        {status === "sending" ? "…" : t("send")}
      </button>
    </form>
  )
}
