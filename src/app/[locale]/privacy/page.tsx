import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPageSeo, buildMetadata } from "@/lib/seo"
import { getLegalDefault } from "@/lib/legal-defaults"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const seo = await getPageSeo("privacy", locale)
  return await buildMetadata(seo, { path: `/${locale}/privacy`, locale })
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const page = await prisma.legalPage.findUnique({
    where: { pageKey_locale: { pageKey: "privacy", locale: locale as any } },
  }).catch(() => null)
  const fallback = page ? null : await prisma.legalPage.findUnique({
    where: { pageKey_locale: { pageKey: "privacy", locale: "en" } },
  }).catch(() => null)
  const dbContent = page || fallback
  const staticDefault = getLegalDefault("privacy", locale)
  const content = dbContent ?? (staticDefault ? { ...staticDefault, updatedAt: new Date(0) } : null)
  if (!content) notFound()

  return (
    <div style={{ paddingTop: 140, paddingBottom: 100, paddingLeft: 48, paddingRight: 48, maxWidth: 860, margin: "0 auto" }}>
      <div className="mono-label" style={{ color: "var(--color-accent)", marginBottom: 24 }}>
        Legal
      </div>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(36px, 5vw, 64px)",
        fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em",
        marginBottom: 64,
      }}>
        {content.title}
      </h1>
      <div
        className="x-legal-content"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
      {content.updatedAt.getTime() > 0 && (
        <div style={{ marginTop: 64, borderTop: "1px solid var(--color-rule)", paddingTop: 24 }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--color-ink-soft)",
          }}>
            Last updated: {new Date(content.updatedAt).toLocaleDateString(locale === "el" ? "el-GR" : locale === "de" ? "de-DE" : "en-GB", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      )}
    </div>
  )
}
