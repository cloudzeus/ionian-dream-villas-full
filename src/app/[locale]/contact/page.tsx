import { getTranslations } from "next-intl/server"
import PageHeader from "@/components/primitives/PageHeader"
import ContactForm from "@/components/forms/ContactForm"

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "contact" })

  return (
    <>
      <PageHeader eyebrow="Ionian Dream Villas" title={t("heading")} />
      <section style={{ padding: "80px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
        <div>
          <div className="mono-label" style={{ marginBottom: 24 }}>{t("left.heading")}</div>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--color-ink-soft)", marginBottom: 60 }}>{t("left.body")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {[
              ["Email", t("email")],
              ["Phone", t("phone")],
              ["Address", t("address")],
              ["Response", t("responseTime")],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mono-label" style={{ marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontStyle: label === "Response" ? "italic" : "normal" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <ContactForm locale={locale} />
      </section>
    </>
  )
}
