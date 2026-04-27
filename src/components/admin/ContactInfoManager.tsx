"use client"

import { useState, useTransition } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// ─── Types ────────────────────────────────────────────────────────────────────

type Settings = Record<string, string>

// ─── Default thank-you HTML template ─────────────────────────────────────────

const DEFAULT_THANKYOU_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thank you</title>
</head>
<body style="margin:0;padding:0;background:#F7F4EE;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EE;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #ddd;">

          <!-- Header -->
          <tr>
            <td style="background:#1C2A33;padding:40px 48px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(247,244,238,0.5);">Ionian Dream Villas</p>
              <h1 style="margin:16px 0 0;font-family:Georgia,serif;font-size:36px;font-weight:300;font-style:italic;color:#F7F4EE;line-height:1.1;">Thank you,<br/>{{name}}.</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.8;color:#3d4d57;">
                We have received your enquiry and will get back to you shortly — usually within twenty-four hours.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.8;color:#3d4d57;">
                While you wait, feel free to explore the island guide on our website for inspiration on beaches, villages, and hidden corners of Lefkada.
              </p>
              <p style="margin:40px 0 0;font-family:Georgia,serif;font-size:18px;font-style:italic;color:#1C2A33;">
                Ἕως αὔριον · Until tomorrow.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #e8e4dc;">
              <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#aaa;">
                Ionian Dream Villas · Lefkada, Greece · stay@ionian-dream-villas.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, id, type = "text", value, onChange, placeholder, hint }: {
  label: string; id: string; type?: string
  value: string; onChange: (v: string) => void
  placeholder?: string; hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input
        id={id} type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono text-sm"
        autoComplete="off"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SectionTitle({ children, description }: { children: React.ReactNode; description?: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">{children}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}

function SaveBar({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <p className="text-xs text-muted-foreground">Changes are saved to the database immediately.</p>
      <div className="flex items-center gap-3">
        {saved && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactInfoManager({ initialSettings }: { initialSettings: Settings }) {
  const [s, setS] = useState<Settings>(initialSettings)
  const [saving, startSave] = useTransition()
  const [savedTab, setSavedTab] = useState<string | null>(null)

  const get = (key: string) => s[key] || ""
  const set = (key: string) => (v: string) => setS(prev => ({ ...prev, [key]: v }))

  const saveKeys = (keys: string[], tab: string) => {
    const payload = Object.fromEntries(keys.map(k => [k, s[k] || ""]))
    startSave(async () => {
      await fetch("/api/admin/contact-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      setSavedTab(tab)
      setTimeout(() => setSavedTab(null), 3000)
    })
  }

  // ── Contact tab ─────────────────────────────────────────────────────────────
  const contactKeys = [
    "ci:addr1_label", "ci:addr1_value",
    "ci:addr2_label", "ci:addr2_value",
    "ci:phone1_label", "ci:phone1_value",
    "ci:phone2_label", "ci:phone2_value",
    "ci:email_main", "ci:email_booking", "ci:response_time",
  ]

  // ── Social tab ──────────────────────────────────────────────────────────────
  const socialKeys = [
    "social:facebook", "social:instagram", "social:twitter",
    "social:youtube", "social:tripadvisor",
  ]

  // ── SMTP tab ────────────────────────────────────────────────────────────────
  const smtpKeys = [
    "smtp:host", "smtp:port", "smtp:secure",
    "smtp:user", "smtp:pass",
    "smtp:from_name", "smtp:from_email", "smtp:to_email",
  ]

  const [smtpTestState, setSmtpTestState] = useState<"idle" | "testing" | "ok" | "fail">("idle")
  const [smtpTestError, setSmtpTestError] = useState("")

  async function testSmtp() {
    setSmtpTestState("testing")
    try {
      const res = await fetch("/api/admin/contact-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-smtp",
          host: get("smtp:host"),
          port: parseInt(get("smtp:port") || "587"),
          secure: get("smtp:secure") === "true",
          user: get("smtp:user"),
          pass: get("smtp:pass"),
          fromName: get("smtp:from_name"),
          fromEmail: get("smtp:from_email"),
          toEmail: get("smtp:to_email"),
        }),
      })
      const data = await res.json()
      setSmtpTestState(data.ok ? "ok" : "fail")
      setSmtpTestError(data.error || "")
    } catch (e: any) {
      setSmtpTestState("fail")
      setSmtpTestError(e.message)
    }
    setTimeout(() => setSmtpTestState("idle"), 5000)
  }

  // ── Thank-you tab ───────────────────────────────────────────────────────────
  const thankyouKeys = ["thankyou:subject", "thankyou:body_html"]
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("code")
  const htmlBody = get("thankyou:body_html") || DEFAULT_THANKYOU_HTML

  // Set default on first use
  const ensureDefault = () => {
    if (!s["thankyou:body_html"]) setS(prev => ({ ...prev, "thankyou:body_html": DEFAULT_THANKYOU_HTML }))
    if (!s["thankyou:subject"]) setS(prev => ({ ...prev, "thankyou:subject": "Thank you for your enquiry — Ionian Dream Villas" }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contact">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="brand">Brand Icon</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="thankyou">Thank-you Email</TabsTrigger>
        </TabsList>

        {/* ── CONTACT ─────────────────────────────────────────────────────── */}
        <TabsContent value="contact" className="space-y-8 pt-6">

          <div className="grid grid-cols-2 gap-8">
            {/* Address 1 */}
            <div className="space-y-4 p-5 border border-border rounded-lg bg-muted/30">
              <SectionTitle>Address 1</SectionTitle>
              <Field id="addr1_label" label="Label" value={get("ci:addr1_label")} onChange={set("ci:addr1_label")} placeholder="e.g. Main Office" />
              <Field id="addr1_value" label="Address" value={get("ci:addr1_value")} onChange={set("ci:addr1_value")} placeholder="e.g. Agios Nikitas, Lefkada 31080, Greece" />
            </div>

            {/* Address 2 */}
            <div className="space-y-4 p-5 border border-border rounded-lg bg-muted/30">
              <SectionTitle description="Optional — leave label blank to hide">Address 2</SectionTitle>
              <Field id="addr2_label" label="Label" value={get("ci:addr2_label")} onChange={set("ci:addr2_label")} placeholder="e.g. Mailing address" />
              <Field id="addr2_value" label="Address" value={get("ci:addr2_value")} onChange={set("ci:addr2_value")} placeholder="Optional second address" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Phone 1 */}
            <div className="space-y-4 p-5 border border-border rounded-lg bg-muted/30">
              <SectionTitle>Phone 1</SectionTitle>
              <Field id="phone1_label" label="Label" value={get("ci:phone1_label")} onChange={set("ci:phone1_label")} placeholder="e.g. Reservations" />
              <Field id="phone1_value" label="Number" type="tel" value={get("ci:phone1_value")} onChange={set("ci:phone1_value")} placeholder="+30 694 000 0000" />
            </div>

            {/* Phone 2 */}
            <div className="space-y-4 p-5 border border-border rounded-lg bg-muted/30">
              <SectionTitle description="Optional — leave label blank to hide">Phone 2</SectionTitle>
              <Field id="phone2_label" label="Label" value={get("ci:phone2_label")} onChange={set("ci:phone2_label")} placeholder="e.g. WhatsApp" />
              <Field id="phone2_value" label="Number" type="tel" value={get("ci:phone2_value")} onChange={set("ci:phone2_value")} placeholder="+30 694 000 0000" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 p-5 border border-border rounded-lg bg-muted/30">
            <SectionTitle description="Shown on the contact page and footer">Email &amp; Response</SectionTitle>
            <div className="col-span-3 grid grid-cols-3 gap-6">
              <Field id="email_main" label="Main email" type="email" value={get("ci:email_main")} onChange={set("ci:email_main")} placeholder="stay@ionian-dream-villas.com" />
              <Field id="email_booking" label="Booking email" type="email" value={get("ci:email_booking")} onChange={set("ci:email_booking")} placeholder="book@ionian-dream-villas.com" />
              <Field id="response_time" label="Response time" value={get("ci:response_time")} onChange={set("ci:response_time")} placeholder="Usually within 24 hours" />
            </div>
          </div>

          <SaveBar onSave={() => saveKeys(contactKeys, "contact")} saving={saving} saved={savedTab === "contact"} />
        </TabsContent>

        {/* ── SOCIAL ──────────────────────────────────────────────────────── */}
        <TabsContent value="social" className="space-y-6 pt-6">
          <p className="text-sm text-muted-foreground">Enter full URLs including https://. Leave blank to hide a platform.</p>

          <div className="grid grid-cols-1 gap-5">
            {[
              { key: "social:facebook",    label: "Facebook",    icon: "f", placeholder: "https://facebook.com/ioniandreamvillas" },
              { key: "social:instagram",   label: "Instagram",   icon: "ig", placeholder: "https://instagram.com/ioniandreamvillas" },
              { key: "social:twitter",     label: "X / Twitter", icon: "x", placeholder: "https://x.com/ioniandreamvillas" },
              { key: "social:youtube",     label: "YouTube",     icon: "▶", placeholder: "https://youtube.com/@ioniandreamvillas" },
              { key: "social:tripadvisor", label: "TripAdvisor", icon: "ta", placeholder: "https://tripadvisor.com/…" },
            ].map(({ key, label, icon, placeholder }) => (
              <div key={key} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="w-10 h-10 shrink-0 rounded-md bg-muted flex items-center justify-center font-mono text-xs font-bold text-muted-foreground border border-border">
                  {icon}
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</Label>
                  <Input
                    type="url"
                    value={get(key)}
                    onChange={e => setS(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="font-mono text-sm"
                  />
                </div>
                {get(key) && (
                  <a href={get(key)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
                    Visit ↗
                  </a>
                )}
              </div>
            ))}
          </div>

          <SaveBar onSave={() => saveKeys(socialKeys, "social")} saving={saving} saved={savedTab === "social"} />
        </TabsContent>

        {/* ── BRAND ICON ──────────────────────────────────────────────────── */}
        <TabsContent value="brand" className="space-y-6 pt-6">
          <p className="text-sm text-muted-foreground">
            Paste your SVG logo/icon markup below. This is used as the site icon and in emails.
            The SVG should be square, ideally 32×32 or viewBox="0 0 32 32".
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">SVG Source</Label>
              <Textarea
                value={get("brand:icon_svg")}
                onChange={e => set("brand:icon_svg")(e.target.value)}
                placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">\n  <!-- your icon here -->\n</svg>`}
                rows={20}
                className="font-mono text-xs resize-none"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Preview</Label>
              <div className="border border-border rounded-lg p-6 bg-muted/30 space-y-6">
                {get("brand:icon_svg") ? (
                  <>
                    <div className="flex flex-wrap gap-4 items-end">
                      {[16, 32, 48, 64, 96].map(size => (
                        <div key={size} className="flex flex-col items-center gap-2">
                          <div
                            style={{ width: size, height: size }}
                            dangerouslySetInnerHTML={{ __html: get("brand:icon_svg") }}
                          />
                          <span className="text-[10px] text-muted-foreground font-mono">{size}px</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="p-3 bg-white rounded border border-border">
                        <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: get("brand:icon_svg") }} />
                      </div>
                      <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
                        <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: get("brand:icon_svg") }} />
                      </div>
                      <div className="p-3 bg-[#F7F4EE] rounded border border-border">
                        <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: get("brand:icon_svg") }} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Previewed on white, dark, and cream backgrounds.</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Paste SVG code on the left to preview it here.</p>
                )}
              </div>
            </div>
          </div>

          <SaveBar onSave={() => saveKeys(["brand:icon_svg"], "brand")} saving={saving} saved={savedTab === "brand"} />
        </TabsContent>

        {/* ── SMTP ────────────────────────────────────────────────────────── */}
        <TabsContent value="smtp" className="space-y-6 pt-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>SMTP credentials are stored encrypted in the database.</strong> Configure an outgoing mail server
              to enable automatic enquiry notifications and thank-you emails to guests.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">

            <div className="space-y-5 p-5 border border-border rounded-lg bg-muted/30">
              <SectionTitle description="Outgoing mail server">Server</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Field id="smtp_host" label="SMTP Host" value={get("smtp:host")} onChange={set("smtp:host")} placeholder="smtp.gmail.com" />
                </div>
                <Field id="smtp_port" label="Port" type="number" value={get("smtp:port") || "587"} onChange={set("smtp:port")} placeholder="587" />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="smtp_secure"
                  checked={get("smtp:secure") === "true"}
                  onCheckedChange={v => set("smtp:secure")(v ? "true" : "false")}
                />
                <Label htmlFor="smtp_secure" className="text-sm">
                  Use SSL/TLS
                  <span className="text-xs text-muted-foreground ml-2">(port 465 uses SSL; port 587 uses STARTTLS)</span>
                </Label>
              </div>
            </div>

            <div className="space-y-5 p-5 border border-border rounded-lg bg-muted/30">
              <SectionTitle description="Login credentials">Authentication</SectionTitle>
              <Field id="smtp_user" label="Username / Email" value={get("smtp:user")} onChange={set("smtp:user")} placeholder="noreply@yourdomain.com" />
              <Field id="smtp_pass" label="Password / App password" type="password" value={get("smtp:pass")} onChange={set("smtp:pass")} placeholder="••••••••••••" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 p-5 border border-border rounded-lg bg-muted/30">
            <SectionTitle description="How emails appear to recipients">From &amp; To</SectionTitle>
            <div className="col-span-3 grid grid-cols-3 gap-6">
              <Field id="smtp_from_name"  label="From Name"  value={get("smtp:from_name")}  onChange={set("smtp:from_name")}  placeholder="Ionian Dream Villas" />
              <Field id="smtp_from_email" label="From Email" type="email" value={get("smtp:from_email")} onChange={set("smtp:from_email")} placeholder="stay@ionian-dream-villas.com" />
              <Field id="smtp_to_email"   label="Notify To (admin)"  type="email" value={get("smtp:to_email")}   onChange={set("smtp:to_email")}   placeholder="eleni@ionian-dream-villas.com" hint="Where new enquiry notifications go" />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button variant="outline" onClick={testSmtp} disabled={smtpTestState === "testing"} size="sm">
              {smtpTestState === "testing" ? "Connecting…" : "Test connection"}
            </Button>
            {smtpTestState === "ok" && (
              <Badge variant="default" className="bg-green-600">Connection successful ✓</Badge>
            )}
            {smtpTestState === "fail" && (
              <Badge variant="destructive">Failed: {smtpTestError}</Badge>
            )}
          </div>

          <SaveBar onSave={() => saveKeys(smtpKeys, "smtp")} saving={saving} saved={savedTab === "smtp"} />
        </TabsContent>

        {/* ── THANK-YOU EMAIL ─────────────────────────────────────────────── */}
        <TabsContent value="thankyou" className="space-y-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                This email is sent automatically to guests after they submit an enquiry. Use{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{"{{name}}"}</code> for the guest's name,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{"{{villa}}"}</code> for the villa,{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{"{{arrival}}"}</code> for the arrival date.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={ensureDefault}>
              Load default template
            </Button>
          </div>

          <div className="space-y-3">
            <Field
              id="thankyou_subject"
              label="Email Subject"
              value={get("thankyou:subject") || "Thank you for your enquiry — Ionian Dream Villas"}
              onChange={set("thankyou:subject")}
              placeholder="Thank you for your enquiry — Ionian Dream Villas"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email Body (HTML)</Label>
              <div className="flex gap-1 text-xs border border-border rounded overflow-hidden">
                <button
                  onClick={() => setPreviewMode("code")}
                  className={`px-3 py-1 transition-colors ${previewMode === "code" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  Code
                </button>
                <button
                  onClick={() => setPreviewMode("preview")}
                  className={`px-3 py-1 transition-colors ${previewMode === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  Preview
                </button>
              </div>
            </div>

            {previewMode === "code" ? (
              <Textarea
                value={htmlBody}
                onChange={e => set("thankyou:body_html")(e.target.value)}
                rows={28}
                className="font-mono text-xs resize-none"
                placeholder="Paste your HTML email template here…"
              />
            ) : (
              <div className="border border-border rounded-lg overflow-hidden" style={{ height: "600px" }}>
                <iframe
                  srcDoc={htmlBody.replace(/\{\{name\}\}/g, "Γιάννης").replace(/\{\{villa\}\}/g, "Castro").replace(/\{\{arrival\}\}/g, "15 June 2026")}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs font-mono space-y-1">
            <p className="text-muted-foreground font-sans font-medium text-xs uppercase tracking-widest mb-2">Available placeholders</p>
            {[
              ["{{name}}", "Guest's name"],
              ["{{villa}}", "Requested villa slug (e.g. castro)"],
              ["{{arrival}}", "Arrival date string"],
              ["{{nights}}", "Number of nights"],
              ["{{guests}}", "Number of guests"],
              ["{{message}}", "Guest's message"],
            ].map(([code, desc]) => (
              <div key={code} className="flex gap-3">
                <span className="text-foreground w-28 shrink-0">{code}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>

          <SaveBar onSave={() => saveKeys(thankyouKeys, "thankyou")} saving={saving} saved={savedTab === "thankyou"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
