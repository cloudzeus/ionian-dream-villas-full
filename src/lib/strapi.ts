const STRAPI_URL = process.env.STRAPI_URL || "https://ionianback.wwa.gr"

export interface StrapiImage {
  id: number
  url: string
  width: number
  height: number
  alternativeText: string | null
  formats: {
    large?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
  }
}

export interface StrapiPost {
  id: number
  documentId: string
  title: string
  shordDescription: string
  longDescription: string
  slug: string
  type: string
  distance: string
  lattitude: string
  londitude: string
  locale: string
  images: StrapiImage[]
}

export function imgUrl(url: string): string {
  if (url.startsWith("http")) return url
  return `${STRAPI_URL}${url}`
}

export async function getPosts(locale: string): Promise<StrapiPost[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/posts?populate=*&locale=${locale}&pagination[pageSize]=50`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return (data.data ?? []) as StrapiPost[]
}

export async function getPost(slug: string, locale: string): Promise<StrapiPost | null> {
  const res = await fetch(
    `${STRAPI_URL}/api/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*&locale=${locale}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  return (data.data?.[0] ?? null) as StrapiPost | null
}
