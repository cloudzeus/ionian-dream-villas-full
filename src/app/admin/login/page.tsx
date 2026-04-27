"use client"
import { useActionState } from "react"
import IDVLogo from "@/components/primitives/IDVLogo"
import { loginAction } from "./actions"

const initialState = { error: "" }

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <IDVLogo color="var(--color-ink)" size={32} />
        </div>
        <div className="mono-label" style={{ marginBottom: 32, textAlign: "center" }}>Admin Panel</div>
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              style={{ width: "100%", border: "1px solid var(--color-rule)", background: "transparent", padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-ink)", outline: "none" }}
            />
          </div>
          <div>
            <label className="mono-label" style={{ display: "block", marginBottom: 8 }}>Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              style={{ width: "100%", border: "1px solid var(--color-rule)", background: "transparent", padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--color-ink)", outline: "none" }}
            />
          </div>
          {state?.error && (
            <p style={{ color: "#c0392b", fontSize: 14, margin: 0, fontFamily: "var(--font-body)" }}>{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            style={{ background: "var(--color-ink)", color: "white", border: "none", padding: "16px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.6 : 1 }}
          >
            {pending ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  )
}
