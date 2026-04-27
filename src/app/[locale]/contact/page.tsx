import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { getPageSeo, buildMetadata } from "@/lib/seo"
import { prisma } from "@/lib/prisma"
import PageHeader from "@/components/primitives/PageHeader"
import ContactForm from "@/components/forms/ContactForm"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const seo = await getPageSeo("contact", locale)
  return buildMetadata(seo, { path: `/${locale}/contact`, locale })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "contact" })

  // Load live contact data from DB, fall back to i18n strings
  const keys = [
    "ci:addr1_label", "ci:addr1_value",
    "ci:addr2_label", "ci:addr2_value",
    "ci:phone1_label", "ci:phone1_value",
    "ci:phone2_label", "ci:phone2_value",
    "ci:email_main", "ci:email_booking", "ci:response_time",
    "social:facebook", "social:instagram", "social:twitter",
    "social:youtube", "social:tripadvisor",
  ]
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } })
  const ci = Object.fromEntries(rows.map(r => [r.key, r.value]))

  const email       = ci["ci:email_main"]    || t("email")
  const phone       = ci["ci:phone1_value"]  || t("phone")
  const phoneLabel  = ci["ci:phone1_label"]  || "Phone"
  const phone2      = ci["ci:phone2_value"]  || ""
  const phone2Label = ci["ci:phone2_label"]  || ""
  const addr        = ci["ci:addr1_value"]   || t("address")
  const addrLabel   = ci["ci:addr1_label"]   || "Address"
  const addr2       = ci["ci:addr2_value"]   || ""
  const addr2Label  = ci["ci:addr2_label"]   || ""
  const response    = ci["ci:response_time"] || t("responseTime")
  const bookingEmail = ci["ci:email_booking"] || ""

  const socials = [
    { key: "social:instagram",   label: "Instagram",   href: ci["social:instagram"] },
    { key: "social:facebook",    label: "Facebook",    href: ci["social:facebook"] },
    { key: "social:tripadvisor", label: "TripAdvisor", href: ci["social:tripadvisor"] },
    { key: "social:youtube",     label: "YouTube",     href: ci["social:youtube"] },
    { key: "social:twitter",     label: "X",           href: ci["social:twitter"] },
  ].filter(s => s.href)

  // Build contact items list
  const contactItems: [string, string, string?][] = [
    ["Email", email, `mailto:${email}`],
    ...(bookingEmail && bookingEmail !== email ? [["Bookings", bookingEmail, `mailto:${bookingEmail}`] as [string, string, string]] : []),
    [phoneLabel, phone, `tel:${phone.replace(/\s/g, "")}`],
    ...(phone2 && phone2Label ? [[phone2Label, phone2, `tel:${phone2.replace(/\s/g, "")}`] as [string, string, string]] : []),
    [addrLabel, addr],
    ...(addr2 && addr2Label ? [[addr2Label, addr2] as [string, string]] : []),
    ["Response", response],
  ]

  return (
    <>
      <PageHeader eyebrow="Ionian Dream Villas" title={t("heading")} />
      <section className="x-contact-section" style={{ padding: "80px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
        <div>
          <div className="mono-label" style={{ marginBottom: 24 }}>{t("left.heading")}</div>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-ink-soft)", marginBottom: 60 }}>
            {t("left.body")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {contactItems.map(([label, value, href]) => (
              <div key={label}>
                <div className="mono-label" style={{ marginBottom: 8 }}>{label}</div>
                {href ? (
                  <a
                    href={href}
                    style={{
                      fontFamily: "var(--font-display)", fontSize: 22,
                      color: "var(--color-ink)", textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {value}
                  </a>
                ) : (
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontStyle: label === "Response" ? "italic" : "normal" }}>
                    {value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <div className="mono-label" style={{ marginBottom: 16 }}>Follow us</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {socials.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono-label"
                    style={{
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--color-accent)",
                      paddingBottom: 2,
                    }}
                  >
                    {label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <ContactForm locale={locale} />
      </section>
    </>
  )
}
