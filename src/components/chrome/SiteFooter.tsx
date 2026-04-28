import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"

interface Props {
  locale: string
}

const SOCIAL_ICONS: Record<string, string> = {
  instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  facebook:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  twitter:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  youtube:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>`,
  tripadvisor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 5c-2.67 0-5-1.34-6.45-3.37l1.76-.88C8.18 13.52 9.97 14.5 12 14.5s3.82-.98 4.69-2.75l1.76.88C17 14.66 14.67 16 12 16z"/></svg>`,
}

export default async function SiteFooter({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "footer" })

  // Load social + contact data from DB
  const keys = [
    "social:instagram", "social:facebook", "social:twitter", "social:youtube", "social:tripadvisor",
    "ci:email_main", "ci:phone1_value", "ci:addr1_value",
  ]
  // .catch() is correct here: this component is inside the layout, so error.tsx
  // cannot catch layout-level throws. The footer renders fine without DB data.
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } }).catch(() => [])
  const db = Object.fromEntries(rows.map(r => [r.key, r.value]))

  const socials = [
    { key: "instagram",   label: "Instagram",   href: db["social:instagram"] },
    { key: "facebook",    label: "Facebook",    href: db["social:facebook"] },
    { key: "twitter",     label: "X / Twitter", href: db["social:twitter"] },
    { key: "youtube",     label: "YouTube",     href: db["social:youtube"] },
    { key: "tripadvisor", label: "TripAdvisor", href: db["social:tripadvisor"] },
  ].filter(s => s.href)

  const email = db["ci:email_main"]
  const phone = db["ci:phone1_value"]
  const address = db["ci:addr1_value"]

  const navLinks = [
    { label: t("nav.villas"),  href: `/${locale}/villas` },
    { label: t("nav.rates"),   href: `/${locale}/rates` },
    { label: t("nav.lefkada"), href: `/${locale}/lefkada` },
    { label: t("nav.contact"), href: `/${locale}/contact` },
  ]

  const legalLinks = [
    { label: t("links.terms"),   href: `/${locale}/terms` },
    { label: t("links.privacy"), href: `/${locale}/privacy` },
    { label: t("links.cookies"), href: `/${locale}/cookies` },
  ]

  const year = new Date().getFullYear()

  return (
    <footer className="x-site-footer" style={{
      background: "var(--color-bg-deep)",
      color: "white",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    }}>
      {/* Main footer grid */}
      <div className="x-footer-grid" style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
        gap: "60px 48px",
        padding: "72px 48px 56px",
        maxWidth: 1440,
        margin: "0 auto",
      }}>
        {/* Brand column */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 28, fontWeight: 300, fontStyle: "italic",
            letterSpacing: "-0.02em",
            marginBottom: 6,
            color: "rgba(247,244,238,0.95)",
          }}>
            Ionian Dream<br />Villas
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            marginBottom: 16,
          }}>
            {t("established")}
          </div>
          <p style={{
            fontSize: 13, lineHeight: 1.8,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 280, marginBottom: 32,
          }}>
            {t("tagline")}
          </p>

          {/* Social icons */}
          {socials.length > 0 && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {socials.map(s => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 38, height: 38,
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  className="x-footer-social"
                  dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[s.key] || "" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>
            {t("explore")}
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 300,
                  color: "rgba(255,255,255,0.6)", textDecoration: "none",
                  transition: "color 0.2s",
                }}
                className="x-footer-link"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>
            {t("contact")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {email && (
              <a
                href={`mailto:${email}`}
                style={{
                  fontSize: 14, color: "rgba(255,255,255,0.6)",
                  textDecoration: "none", lineHeight: 1.5,
                }}
                className="x-footer-link"
              >
                {email}
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                style={{
                  fontSize: 14, color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                }}
                className="x-footer-link"
              >
                {phone}
              </a>
            )}
            {address && (
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                {address}
              </div>
            )}
          </div>
        </div>

        {/* Legal */}
        <div>
          <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 20 }}>
            {t("legal")}
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {legalLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 300,
                  color: "rgba(255,255,255,0.5)", textDecoration: "none",
                  transition: "color 0.2s",
                }}
                className="x-footer-link"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginTop: 32 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
              lineHeight: 1.8,
            }}>
              38°43′N · 20°39′E<br />
              Lefkada · Ionian Islands<br />
              Greece
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        maxWidth: 1440,
        margin: "0 auto",
      }} className="x-footer-bottom">
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.15em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}>
          {t("copy")} {year}. {t("rights")}
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {legalLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 9,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)", textDecoration: "none",
              }}
              className="x-footer-link"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
