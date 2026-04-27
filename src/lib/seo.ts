import type { Metadata } from "next"
import { prisma } from "./prisma"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ionian-dream-villas.com"
export const SITE_NAME = "Ionian Dream Villas"

export interface SeoData {
  title: string
  description: string
  ogTitle?: string | null
  ogDescription?: string | null
  keywords?: string | null
}

const OG_LOCALE: Record<string, string> = { en: "en_US", el: "el_GR", de: "de_DE" }

// Built-in fallbacks — these are only used when the DB has no entry yet.
// The admin can override them via /admin/seo at any time.
const DEFAULTS: Record<string, Record<string, SeoData>> = {
  home: {
    en: {
      title: "Ionian Dream Villas — Three Private Villas on Lefkada",
      description: "Three luxury villas on the western shore of Lefkada island, Greece. Private pools, sea views, peaceful gardens. Book direct.",
      keywords: "Lefkada villa rental, luxury villas Greece, Ionian island holiday, private pool villa Lefkada",
    },
    el: {
      title: "Ionian Dream Villas — Τρεις Βίλες στη Λευκάδα, Ελλάδα",
      description: "Τρεις πολυτελείς βίλες στη δυτική ακτή της Λευκάδας. Ιδιωτικές πισίνες, θέα στο Ιόνιο, παραδοσιακός κήπος.",
      keywords: "βίλα Λευκάδα, ενοικίαση βίλας Ελλάδα, Ιόνιος πολυτελής διαμονή",
    },
    de: {
      title: "Ionian Dream Villas — Drei Privatvillen auf Lefkada, Griechenland",
      description: "Drei Luxusvillen an der Westküste von Lefkada. Private Pools, Meerblick, ruhige Lage direkt am Wasser.",
      keywords: "Villa Lefkada mieten, Griechenland Luxusvilla, Ionische Inseln Urlaub",
    },
  },
  villas: {
    en: {
      title: "Our Three Villas — Ionian Dream Villas · Lefkada",
      description: "Castro, Jira and Milos — three privately owned villas on Lefkada's west coast. Each with a private pool, three bedrooms and direct access to quiet roads.",
      keywords: "Castro villa Lefkada, Jira villa, Milos villa, three bedroom villa Greece",
    },
    el: {
      title: "Οι Τρεις Βίλες μας — Ionian Dream Villas · Λευκάδα",
      description: "Κάστρο, Τζήρα και Μύλος — τρεις ιδιωτικές βίλες στη δυτική ακτή της Λευκάδας. Πισίνα, τρία υπνοδωμάτια και ησυχία.",
      keywords: "Κάστρο βίλα Λευκάδα, Τζήρα βίλα, Μύλος βίλα, βίλα Ελλάδα",
    },
    de: {
      title: "Unsere drei Villen — Ionian Dream Villas · Lefkada",
      description: "Castro, Jira und Milos — drei Privatvillen an der Westküste Lefkadas. Jede mit Privatpool, drei Schlafzimmern und ruhiger Lage.",
      keywords: "Castro Villa Lefkada, Jira Villa, Milos Villa, drei Schlafzimmer Villa Griechenland",
    },
  },
  lefkada: {
    en: {
      title: "Lefkada Island Guide — Beaches, Villages & Viewpoints",
      description: "Discover the best beaches, villages and hidden spots on Lefkada island. Porto Katsiki, Egremni, Nydri and more — a local guide from Ionian Dream Villas.",
      keywords: "Lefkada guide, best beaches Lefkada, Porto Katsiki, Lefkada villages, things to do Lefkada",
    },
    el: {
      title: "Οδηγός Λευκάδας — Παραλίες, Χωριά και Θέα",
      description: "Ανακαλύψτε τις καλύτερες παραλίες, χωριά και κρυμμένα τοπία της Λευκάδας. Από το Πόρτο Κατσίκι μέχρι τα ορεινά χωριά.",
      keywords: "παραλίες Λευκάδα, Πόρτο Κατσίκι, οδηγός Λευκάδα, χωριά Λευκάδα",
    },
    de: {
      title: "Lefkada Reiseführer — Strände, Dörfer und Aussichtspunkte",
      description: "Entdecken Sie die schönsten Strände, Dörfer und versteckten Orte auf Lefkada. Porto Katsiki, Egremni und mehr — ein lokaler Reiseführer.",
      keywords: "Lefkada Reiseführer, Strände Lefkada, Porto Katsiki, Lefkada Dörfer",
    },
  },
  rates: {
    en: {
      title: "Villa Rates & Pricing — Ionian Dream Villas · Lefkada",
      description: "Seasonal rental rates for Castro, Jira and Milos villas on Lefkada. Weekly prices, booking terms, included services. Book direct for the best rate.",
      keywords: "Lefkada villa prices, villa rental rates Greece, weekly villa hire Lefkada",
    },
    el: {
      title: "Τιμές Ενοικίασης Βίλας — Ionian Dream Villas · Λευκάδα",
      description: "Εποχιακές τιμές για τις βίλες Κάστρο, Τζήρα και Μύλο στη Λευκάδα. Εβδομαδιαίες τιμές, όροι κράτησης.",
      keywords: "τιμές βίλα Λευκάδα, ενοικίαση βίλας Ελλάδα, εβδομαδιαία τιμή",
    },
    de: {
      title: "Villapreise & Konditionen — Ionian Dream Villas · Lefkada",
      description: "Saisonale Mietpreise für die Villen Castro, Jira und Milos auf Lefkada. Wochenpreise, Buchungsbedingungen und inklusive Leistungen.",
      keywords: "Villapreise Lefkada, Ferienvilla mieten Griechenland, Wochenpreis",
    },
  },
  contact: {
    en: {
      title: "Contact Us — Ionian Dream Villas · Lefkada, Greece",
      description: "Get in touch with Ionian Dream Villas. Enquire about availability, make a booking, or ask any questions about our villas on Lefkada.",
      keywords: "contact Ionian Dream Villas, book villa Lefkada, villa enquiry",
    },
    el: {
      title: "Επικοινωνία — Ionian Dream Villas · Λευκάδα",
      description: "Επικοινωνήστε μαζί μας για διαθεσιμότητα, κρατήσεις ή οποιαδήποτε ερώτηση για τις βίλες στη Λευκάδα.",
      keywords: "επικοινωνία βίλα Λευκάδα, κράτηση βίλας, ερώτηση",
    },
    de: {
      title: "Kontakt — Ionian Dream Villas · Lefkada, Griechenland",
      description: "Nehmen Sie Kontakt mit Ionian Dream Villas auf. Fragen zur Verfügbarkeit, Buchung oder allgemeine Anfragen zu unseren Villen auf Lefkada.",
      keywords: "Kontakt Ionian Dream Villas, Villa Lefkada buchen, Anfrage",
    },
  },
  terms: {
    en: { title: "Terms & Conditions — Ionian Dream Villas", description: "Booking terms, cancellation policy, occupancy rules and legal conditions for stays at Ionian Dream Villas, Lefkada, Greece." },
    el: { title: "Όροι & Προϋποθέσεις — Ionian Dream Villas", description: "Όροι κράτησης, πολιτική ακύρωσης και νομικοί όροι για διαμονές στις Ionian Dream Villas, Λευκάδα." },
    de: { title: "AGB — Ionian Dream Villas", description: "Buchungsbedingungen, Stornierungsrichtlinien und rechtliche Bedingungen für Aufenthalte in den Ionian Dream Villas, Lefkada." },
  },
  privacy: {
    en: { title: "Privacy Policy — Ionian Dream Villas", description: "How Ionian Dream Villas collects, uses and protects your personal data in accordance with GDPR." },
    el: { title: "Πολιτική Απορρήτου — Ionian Dream Villas", description: "Πώς οι Ionian Dream Villas συλλέγουν, χρησιμοποιούν και προστατεύουν τα προσωπικά σας δεδομένα σύμφωνα με τον GDPR." },
    de: { title: "Datenschutzerklärung — Ionian Dream Villas", description: "Wie Ionian Dream Villas Ihre personenbezogenen Daten gemäß DSGVO erfasst, verwendet und schützt." },
  },
  cookies: {
    en: { title: "Cookies Policy — Ionian Dream Villas", description: "Information about the cookies used on the Ionian Dream Villas website and how to manage your preferences." },
    el: { title: "Πολιτική Cookies — Ionian Dream Villas", description: "Πληροφορίες για τα cookies που χρησιμοποιούνται στον ιστότοπο των Ionian Dream Villas και πώς να διαχειριστείτε τις προτιμήσεις σας." },
    de: { title: "Cookie-Richtlinie — Ionian Dream Villas", description: "Informationen über die auf der Website von Ionian Dream Villas verwendeten Cookies und deren Verwaltung." },
  },
}

export async function getPageSeo(pageKey: string, locale: string): Promise<SeoData> {
  try {
    const row = await prisma.pageSeo.findUnique({
      where: { pageKey_locale: { pageKey, locale: locale as any } },
      select: { title: true, description: true, ogTitle: true, ogDescription: true, keywords: true },
    })
    if (row) return row
  } catch {}
  return DEFAULTS[pageKey]?.[locale] ?? DEFAULTS[pageKey]?.en ?? {
    title: "Ionian Dream Villas — Lefkada, Greece",
    description: "Three private luxury villas on Lefkada island, Greece.",
  }
}

/** Load social & contact settings from DB once and cache per request */
async function getSocialSettings() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "social:twitter", "social:facebook", "social:instagram",
            "social:youtube", "social:tripadvisor",
            "ci:email_main", "ci:phone1_value", "ci:addr1_value",
          ],
        },
      },
    })
    return Object.fromEntries(rows.map(r => [r.key, r.value]))
  } catch {
    return {}
  }
}

export async function buildMetadata(
  seo: SeoData,
  opts: {
    image?: string
    path: string
    locale: string
    type?: "website" | "article"
  }
): Promise<Metadata> {
  const title = seo.title
  const description = seo.description
  const ogTitle = seo.ogTitle || title
  const ogDescription = seo.ogDescription || description
  const image = opts.image ?? `${SITE_URL}/og-default.jpg`
  const canonical = `${SITE_URL}${opts.path}`

  // Load social + contact from DB for Twitter card handle and structured data
  const settings = await getSocialSettings()
  const twitterHandle = settings["social:twitter"]
    ? "@" + settings["social:twitter"].replace(/^https?:\/\/(www\.)?(twitter|x)\.com\/?@?/, "").replace(/\/$/, "")
    : "@IonianDreamVillas"

  const sameAs = [
    settings["social:facebook"],
    settings["social:instagram"],
    settings["social:twitter"],
    settings["social:youtube"],
    settings["social:tripadvisor"],
  ].filter(Boolean)

  const phone = settings["ci:phone1_value"]
  const email = settings["ci:email_main"]
  const address = settings["ci:addr1_value"]

  // Organization JSON-LD — always present
  const orgJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "LocalBusiness"],
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: image,
    description: DEFAULTS.home.en.description,
    priceRange: "€€€",
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    address: address
      ? { "@type": "PostalAddress", streetAddress: address, addressLocality: "Lefkada", addressRegion: "Ionian Islands", addressCountry: "GR" }
      : { "@type": "PostalAddress", addressLocality: "Lefkada", addressRegion: "Ionian Islands", addressCountry: "GR" },
    geo: { "@type": "GeoCoordinates", latitude: "38.7167", longitude: "20.6500" },
    ...(sameAs.length ? { sameAs } : {}),
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/en/villas?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }

  return {
    title,
    description,
    keywords: seo.keywords ?? undefined,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}${opts.path.replace(/^\/(en|el|de)/, "/en")}`,
        el: `${SITE_URL}${opts.path.replace(/^\/(en|el|de)/, "/el")}`,
        de: `${SITE_URL}${opts.path.replace(/^\/(en|el|de)/, "/de")}`,
        "x-default": `${SITE_URL}${opts.path.replace(/^\/(en|el|de)/, "/en")}`,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      type: opts.type ?? "website",
      locale: OG_LOCALE[opts.locale] ?? "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
    other: {
      "og:locale:alternate": Object.values(OG_LOCALE)
        .filter(l => l !== (OG_LOCALE[opts.locale] ?? "en_US"))
        .join(","),
      // Inline JSON-LD as meta for pages that don't have their own JsonLd component
      // (pages that do will render their own <script type="application/ld+json">)
    },
    // Structured data via script tags
    // We return it in `other` as a workaround since Next.js doesn't have native JSON-LD in Metadata yet
  }
}

/** Standalone helper for home page JSON-LD — used in root layout or home page */
export async function getOrganizationJsonLd() {
  const settings = await getSocialSettings()
  const sameAs = [
    settings["social:facebook"],
    settings["social:instagram"],
    settings["social:twitter"],
    settings["social:youtube"],
    settings["social:tripadvisor"],
  ].filter(Boolean)

  return {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "LocalBusiness"],
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Three luxury villas on the western shore of Lefkada island, Greece. Private pools, sea views, peaceful gardens.",
    priceRange: "€€€",
    telephone: settings["ci:phone1_value"] || undefined,
    email: settings["ci:email_main"] || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings["ci:addr1_value"] || undefined,
      addressLocality: "Lefkada",
      addressRegion: "Ionian Islands",
      addressCountry: "GR",
    },
    geo: { "@type": "GeoCoordinates", latitude: "38.7167", longitude: "20.6500" },
    ...(sameAs.length ? { sameAs } : {}),
  }
}
