import nodemailer from "nodemailer"
import { prisma } from "./prisma"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  fromName: string
  fromEmail: string
  toEmail: string
}

// ─── Read SMTP config — DB first, env vars as fallback ───────────────────────

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const keys = [
    "smtp:host", "smtp:port", "smtp:secure",
    "smtp:user", "smtp:pass",
    "smtp:from_name", "smtp:from_email", "smtp:to_email",
  ]
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
  const db = Object.fromEntries(rows.map(r => [r.key, r.value]))

  // Resolve each value: DB → env var → hardcoded default
  const host      = db["smtp:host"]      || process.env.NODEMAILER_HOST      || ""
  const port      = db["smtp:port"]      || process.env.NODEMAILER_PORT      || "587"
  // Derive the secure default from the *resolved* port (not env), so a DB-set
  // port of 587 doesn't inherit secure=true from NODEMAILER_PORT=465.
  const secure    = db["smtp:secure"]    ?? (port === "465" ? "true" : "false")
  const user      = db["smtp:user"]      || process.env.NODEMAILER_USER      || ""
  const pass      = db["smtp:pass"]      || process.env.NODEMAILER_PASS      || ""
  const fromName  = db["smtp:from_name"] || process.env.NODEMAILER_FROM_NAME || "Ionian Dream Villas"
  const fromEmail = db["smtp:from_email"]|| process.env.NODEMAILER_USER      || user
  const toEmail   = db["smtp:to_email"]  || process.env.MAIL_TO              || "info@ionian-dream-villas.com"

  if (!host || !user || !pass) return null

  return {
    host,
    port: parseInt(port, 10),
    secure: secure === "true",
    user,
    pass,
    fromName,
    fromEmail,
    toEmail,
  }
}

// ─── Default config seeded from env (for admin UI pre-fill) ──────────────────

export function getEnvSmtpDefaults(): Partial<SmtpConfig> {
  return {
    host:      process.env.NODEMAILER_HOST      || "",
    port:      parseInt(process.env.NODEMAILER_PORT || "587", 10),
    secure:    process.env.NODEMAILER_PORT === "465",
    user:      process.env.NODEMAILER_USER      || "",
    pass:      process.env.NODEMAILER_PASS      || "",
    fromName:  process.env.NODEMAILER_FROM_NAME || "Ionian Dream Villas",
    fromEmail: process.env.NODEMAILER_USER      || "",
    toEmail:   process.env.MAIL_TO              || "info@ionian-dream-villas.com",
  }
}

// ─── Create transporter ───────────────────────────────────────────────────────

function makeTransporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  })
}

// ─── Admin notification email ─────────────────────────────────────────────────

export async function sendEnquiryNotification(enquiry: {
  kind: string
  name: string
  email: string
  villa?: string | null
  arrival?: string | null
  nights?: number | null
  guests?: number | null
  message: string
}) {
  const cfg = await getSmtpConfig()
  if (!cfg) {
    console.warn("[mailer] enquiry notification skipped — SMTP not configured (host/user/pass missing)")
    return
  }

  const lines = [
    `Name:    ${enquiry.name}`,
    `Email:   ${enquiry.email}`,
    enquiry.villa    ? `Villa:   ${enquiry.villa}`   : null,
    enquiry.arrival  ? `Arrival: ${enquiry.arrival}` : null,
    enquiry.nights   ? `Nights:  ${enquiry.nights}`  : null,
    enquiry.guests   ? `Guests:  ${enquiry.guests}`  : null,
    ``,
    `Message:`,
    enquiry.message,
  ].filter(l => l !== null).join("\n")

  const t = makeTransporter(cfg)
  await t.sendMail({
    from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
    to: cfg.toEmail,
    replyTo: enquiry.email,
    subject: `New ${enquiry.kind} enquiry — ${enquiry.name}`,
    text: lines,
    html: `<pre style="font-family:monospace;font-size:14px;line-height:1.7">${lines}</pre>`,
  })
}

// ─── Thank-you email to guest ─────────────────────────────────────────────────

const DEFAULT_THANKYOU_HTML = `
  <div style="font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#222;max-width:560px">
    <p>Dear {{name}},</p>
    <p>Thank you for reaching out to <strong>Ionian Dream Villas</strong>. We have received your
    enquiry and a member of our team will get back to you very shortly.</p>
    <p>Warm regards,<br/>The Ionian Dream Villas Team</p>
  </div>
`.trim()

export async function sendThankYouEmail(
  toEmail: string,
  vars: Record<string, string>,
) {
  const cfg = await getSmtpConfig()
  if (!cfg) {
    console.warn("[mailer] thank-you email skipped — SMTP not configured")
    return
  }

  const keys = ["thankyou:subject", "thankyou:body_html"]
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))

  const rawSubject = map["thankyou:subject"] || "Thank you for your enquiry, {{name}}"
  // Fall back to a sensible default so guests are always thanked by name,
  // even before an admin customises the template in the admin panel.
  const rawHtml = map["thankyou:body_html"] || DEFAULT_THANKYOU_HTML

  // Replace all {{variable}} placeholders
  const replace = (str: string) =>
    Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v),
      str,
    )

  const t = makeTransporter(cfg)
  await t.sendMail({
    from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
    to: toEmail,
    subject: replace(rawSubject),
    html: replace(rawHtml),
  })
}

// ─── Test connection ──────────────────────────────────────────────────────────

export async function testSmtpConnection(cfg: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const t = makeTransporter(cfg)
    await t.verify()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection failed" }
  }
}
