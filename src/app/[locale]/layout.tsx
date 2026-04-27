import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import PageNav from "@/components/chrome/PageNav"
import FixedFooter from "@/components/chrome/FixedFooter"
import LangSetter from "@/components/chrome/LangSetter"

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "el" }, { locale: "de" }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) notFound()
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages}>
      <LangSetter locale={locale} />
      <PageNav locale={locale} />
      <main>{children}</main>
      <FixedFooter />
    </NextIntlClientProvider>
  )
}
