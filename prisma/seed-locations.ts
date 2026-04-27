/**
 * One-time migration: import Strapi locations into the DB.
 * Run: npx tsx prisma/seed-locations.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const STRAPI = "https://ionianback.wwa.gr"

async function fetchStrapiPosts(locale: string) {
  const res = await fetch(`${STRAPI}/api/posts?populate=*&locale=${locale}&pagination[pageSize]=50`)
  const data = await res.json()
  return data.data as any[]
}

// Map Strapi slugs → DB slug
const SLUG_MAP: Record<string, string> = {
  "the-serenity-of-porto-katsiki-beach": "porto-katsiki",
  "the-hidden-gem-of-egremni-beach": "egremni",
  "the-tranquil-beauty-of-kalamitsi-beach": "kalamitsi",
  "the-splendor-of-nidri-waterfalls": "nidri-waterfalls",
  "exploring-lefkada-s-historic-castle-of-agia-mavra": "agia-mavra",
  "the-charm-of-agios-nikitas-village": "agios-nikitas",
}

// Simple name for each Strapi slug (used for new DB locations)
const SIMPLE_NAME: Record<string, { en: string; el: string; de: string; nameLocal: string; kind: string }> = {
  "kalamitsi": { en: "Kalamitsi Beach", el: "Παραλία Καλαμίτσι", de: "Kalamitsi Beach", nameLocal: "Καλαμίτσι", kind: "Beach · south" },
  "nidri-waterfalls": { en: "Nidri Waterfalls", el: "Καταρράκτες Νυδριού", de: "Nidri-Wasserfälle", nameLocal: "Νυδρί", kind: "Nature · east coast" },
  "agia-mavra": { en: "Castle of Agia Mavra", el: "Κάστρο Αγίας Μαύρας", de: "Burg Agia Mavra", nameLocal: "Αγία Μαύρα", kind: "Historical · north" },
  "agios-nikitas": { en: "Agios Nikitas Village", el: "Χωριό Αγίου Νικήτα", de: "Dorf Agios Nikitas", nameLocal: "Άγιος Νικήτας", kind: "Village · west coast" },
}

function imgUrl(url: string) {
  return url.startsWith("http") ? url : `${STRAPI}${url}`
}

async function run() {
  // Fetch EN posts (master for slug/image info)
  const enPosts = await fetchStrapiPosts("en")
  const elPosts = await fetchStrapiPosts("el")
  const dePosts = await fetchStrapiPosts("de")

  const elBySlug = Object.fromEntries(elPosts.map((p: any) => [p.slug, p]))
  const deBySlug = Object.fromEntries(dePosts.map((p: any) => [p.slug, p]))

  for (const post of enPosts) {
    const dbSlug = SLUG_MAP[post.slug]
    if (!dbSlug) {
      console.log(`No mapping for ${post.slug}, skipping`)
      continue
    }

    // Find or create location in DB
    let location = await prisma.location.findUnique({ where: { slug: dbSlug } })

    if (!location) {
      // New location — create it
      const meta = SIMPLE_NAME[dbSlug]
      console.log(`Creating new location: ${dbSlug}`)
      location = await prisma.location.create({
        data: {
          slug: dbSlug,
          sortOrder: Object.keys(SLUG_MAP).indexOf(post.slug),
          published: true,
          tone: "sea",
        },
      })

      // Translations from Strapi
      const elPost = elBySlug[post.slug] || post
      const dePost = deBySlug[post.slug] || post

      await prisma.locationTranslation.createMany({
        data: [
          {
            locationId: location.id,
            locale: "en",
            name: meta?.en || post.title,
            nameLocal: meta?.nameLocal || "",
            kind: meta?.kind || post.type || "",
            short: post.shordDescription || "",
            long: post.longDescription || "",
          },
          {
            locationId: location.id,
            locale: "el",
            name: meta?.el || (elPost.title || post.title),
            nameLocal: meta?.nameLocal || "",
            kind: meta?.kind || elPost.type || post.type || "",
            short: elPost.shordDescription || post.shordDescription || "",
            long: elPost.longDescription || post.longDescription || "",
          },
          {
            locationId: location.id,
            locale: "de",
            name: meta?.de || (dePost.title || post.title),
            nameLocal: meta?.nameLocal || "",
            kind: meta?.kind || dePost.type || post.type || "",
            short: dePost.shordDescription || post.shordDescription || "",
            long: dePost.longDescription || post.longDescription || "",
          },
        ],
        skipDuplicates: true,
      })

      // Facts: distance
      if (post.distance) {
        const fact = await prisma.locationFact.create({
          data: { locationId: location.id, sortOrder: 0 },
        })
        await prisma.locationFactTranslation.createMany({
          data: [
            { factId: fact.id, locale: "en", label: "Distance from villas", value: post.distance },
            { factId: fact.id, locale: "el", label: "Απόσταση από τις βίλες", value: elBySlug[post.slug]?.distance || post.distance },
            { factId: fact.id, locale: "de", label: "Entfernung von den Villen", value: deBySlug[post.slug]?.distance || post.distance },
          ],
          skipDuplicates: true,
        })
      }
    } else {
      console.log(`Found existing location: ${dbSlug}`)
    }

    // Import images (delete existing first to avoid dupes)
    const existingImages = await prisma.locationImage.count({ where: { locationId: location.id } })
    if (existingImages === 0 && post.images?.length > 0) {
      console.log(`  Importing ${post.images.length} images`)
      const imgData = post.images.map((img: any, i: number) => ({
        locationId: location!.id,
        url: imgUrl(img.formats?.large?.url ?? img.url),
        altEn: img.alternativeText || "",
        sortOrder: i,
        isCover: i === 0,
      }))
      await prisma.locationImage.createMany({ data: imgData })
    } else {
      console.log(`  Images already exist or none in Strapi (${existingImages} in DB, ${post.images?.length || 0} in Strapi)`)
    }
  }

  console.log("\nDone!")
  await prisma.$disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })
