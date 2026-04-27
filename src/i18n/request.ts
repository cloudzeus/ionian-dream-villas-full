import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import { prisma } from "@/lib/prisma"

/**
 * Deep-set a nested key in an object using dot notation.
 * e.g. setDeep(obj, "rates.termsDeposit", "Anzahlung") sets obj.rates.termsDeposit
 */
function setDeep(obj: Record<string, any>, path: string, value: string) {
  const parts = path.split(".")
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  // Load base messages from JSON files
  const messages: Record<string, any> = (await import(`../messages/${locale}.json`)).default

  // Merge any DB overrides stored as `{locale}:{namespace}.{key}` in SiteSetting
  // e.g. "en:rates.termsDeposit" → messages.rates.termsDeposit
  // e.g. "el:home.villasHeading" → messages.home.villasHeading
  try {
    const prefix = `${locale}:`
    const rows = await prisma.siteSetting.findMany({
      where: { key: { startsWith: prefix } },
    })
    for (const row of rows) {
      const dotKey = row.key.slice(prefix.length) // e.g. "home.villasHeading"
      if (row.value) setDeep(messages, dotKey, row.value)
    }
  } catch {
    // DB unavailable — fall through to JSON defaults
  }

  return { locale, messages }
})
