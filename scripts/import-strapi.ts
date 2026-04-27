import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import sharp from "sharp"
import path from "path"

const prisma = new PrismaClient()
const STRAPI_BASE = "https://ionianback.wwa.gr"
const BUNNY_ZONE = process.env.BUNNY_STORAGE_ZONE!
const BUNNY_KEY = process.env.BUNNY_ACCESS_KEY!
const BUNNY_HOST = process.env.BUNNY_STORAGE_HOST!
const CDN_URL = process.env.BUNNY_CDN_URL!

async function fetchStrapi(apiPath: string) {
  const res = await fetch(`${STRAPI_BASE}${apiPath}`)
  if (!res.ok) throw new Error(`Strapi fetch failed: ${apiPath} → ${res.status}`)
  return res.json()
}

async function downloadAndUpload(
  imageUrl: string,
  folder: string,
  _altText: string = ""
): Promise<{ bunnyUrl: string; width?: number; height?: number; size: number }> {
  const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${STRAPI_BASE}${imageUrl}`

  const response = await fetch(fullUrl)
  if (!response.ok) throw new Error(`Download failed: ${fullUrl} → ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())

  let webpBuffer: Buffer
  let width: number | undefined
  let height: number | undefined
  try {
    const sharpInstance = sharp(buffer)
    const metadata = await sharpInstance.metadata()
    width = metadata.width
    height = metadata.height
    webpBuffer = await sharpInstance.webp({ quality: 85 }).toBuffer()
  } catch {
    webpBuffer = buffer
  }

  const baseName = path
    .basename(imageUrl)
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .slice(0, 50)
  const fileName = `${folder}/${Date.now()}-${baseName}.webp`

  const uploadRes = await fetch(`https://${BUNNY_HOST}/${BUNNY_ZONE}/${fileName}`, {
    method: "PUT",
    headers: { AccessKey: BUNNY_KEY, "Content-Type": "image/webp" },
    body: webpBuffer as unknown as BodyInit,
  })
  if (!uploadRes.ok) throw new Error(`BunnyCDN upload failed: ${uploadRes.status}`)

  return {
    bunnyUrl: `${CDN_URL}/${fileName}`,
    width,
    height,
    size: webpBuffer.length,
  }
}

async function main() {
  console.log("=== Strapi → BunnyCDN Import ===\n")

  // ─── Step 1: Full media library ──────────────────────────────────────────────
  console.log("Step 1: Fetching Strapi media library...")
  let allFiles: any[] = []
  try {
    const filesRes = await fetchStrapi(
      "/api/upload/files?pagination[limit]=200&pagination[start]=0"
    )
    if (Array.isArray(filesRes)) allFiles = filesRes
    else if (filesRes.data) allFiles = filesRes.data
    console.log(`Found ${allFiles.length} files in Strapi media library`)
  } catch (e) {
    console.log("Could not fetch upload files:", e)
  }

  const mediaMap: Record<string, string> = {}
  let mediaImported = 0
  let mediaSkipped = 0
  let mediaFailed = 0

  for (const file of allFiles) {
    // Strapi v5 upload/files returns flat objects (no attributes wrapper)
    const url = file.url
    if (!url) continue

    const mime = file.mime || ""
    if (!mime.startsWith("image/") && !url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i))
      continue

    try {
      const existing = await prisma.mediaItem.findFirst({
        where: { originalUrl: { contains: path.basename(url) } },
      })
      if (existing) {
        mediaMap[String(file.id)] = existing.bunnyUrl
        mediaSkipped++
        process.stdout.write(".")
        continue
      }

      const { bunnyUrl, width, height, size } = await downloadAndUpload(
        url,
        "strapi-import/media",
        file.alternativeText || ""
      )

      await prisma.mediaItem.create({
        data: {
          filename: file.name || path.basename(url),
          originalUrl: url.startsWith("http") ? url : `${STRAPI_BASE}${url}`,
          bunnyUrl,
          mimeType: "image/webp",
          width,
          height,
          size,
          folder: "strapi-import/media",
          altEn: file.alternativeText || file.name || "",
        },
      })
      mediaMap[String(file.id)] = bunnyUrl
      mediaImported++
      process.stdout.write("✓")
    } catch (e) {
      mediaFailed++
      process.stdout.write("✗")
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  console.log(
    `\n  Media library: ${mediaImported} imported, ${mediaSkipped} skipped, ${mediaFailed} failed\n`
  )

  // ─── Step 2: Villas ──────────────────────────────────────────────────────────
  // Strapi v5 flat format — fields directly on the object, no attributes wrapper
  // Strapi slugs: "castro-villa-1", "jira-villa", "milos-villa"
  // DB slugs: "castro", "jira", "milos" — match by first hyphen-segment
  console.log("Step 2: Fetching villas from Strapi...")
  let strapiVillas: any[] = []
  try {
    // Use URL-encoded bracket syntax for populate to avoid 400 errors
    const vRes = await fetchStrapi(
      "/api/villas?populate%5B0%5D=images&pagination%5Blimit%5D=100"
    )
    strapiVillas = vRes.data || []
    console.log(`Found ${strapiVillas.length} villas in Strapi`)
  } catch (e) {
    console.log("Could not fetch villas:", e)
  }

  let villaImageCount = 0

  for (const sv of strapiVillas) {
    const strapiSlug: string = sv.slug || sv.title || ""
    // Map Strapi slug first word → DB slug
    const dbSlug = strapiSlug.toLowerCase().split(/[-\s]/)[0]

    const villa = await prisma.villa.findUnique({ where: { slug: dbSlug } })
    if (!villa) {
      console.log(`  Villa not found in DB: "${dbSlug}" (Strapi: "${strapiSlug}")`)
      continue
    }
    console.log(`  Processing villa: ${villa.slug} (Strapi: ${strapiSlug})`)

    // Images is a flat array in Strapi v5
    const imgArray: any[] = Array.isArray(sv.images) ? sv.images : []
    let sortOrder = 0

    for (const img of imgArray) {
      if (!img) continue
      const imgUrl: string = img.url
      if (!imgUrl) continue

      // First image becomes the cover
      const isCover = sortOrder === 0

      try {
        if (isCover) {
          const existingCover = await prisma.villaImage.findFirst({
            where: { villaId: villa.id, isCover: true },
          })
          if (existingCover) {
            process.stdout.write(".")
            sortOrder++
            continue
          }
        }

        const { bunnyUrl, width, height, size } = await downloadAndUpload(
          imgUrl,
          `strapi-import/villas/${villa.slug}`,
          img.alternativeText || `${villa.slug} photo ${sortOrder}`
        )

        await prisma.villaImage.create({
          data: {
            villaId: villa.id,
            url: bunnyUrl,
            altEn: img.alternativeText || `${villa.slug} photo ${sortOrder}`,
            isCover,
            sortOrder,
          },
        })

        await prisma.mediaItem.create({
          data: {
            filename: img.name || `${villa.slug}-${sortOrder}.webp`,
            originalUrl: imgUrl.startsWith("http") ? imgUrl : `${STRAPI_BASE}${imgUrl}`,
            bunnyUrl,
            mimeType: "image/webp",
            width,
            height,
            size,
            folder: `strapi-import/villas/${villa.slug}`,
            altEn: img.alternativeText || `${villa.slug} photo`,
            usedBy: `villa:${villa.slug}`,
          },
        })
        villaImageCount++
        sortOrder++
        process.stdout.write("✓")
      } catch (e) {
        process.stdout.write("✗")
      }
      await new Promise((r) => setTimeout(r, 150))
    }
    console.log(`\n    → ${villa.slug}: ${sortOrder} images processed`)
  }
  console.log(`  Villas: ${villaImageCount} images imported\n`)

  // ─── Step 3: Locations ───────────────────────────────────────────────────────
  // /api/locations returns 404 in this Strapi instance — content type not published
  console.log("Step 3: Locations — /api/locations returns 404 in Strapi, skipping.")

  // ─── Summary ─────────────────────────────────────────────────────────────────
  const totalMediaItems = await prisma.mediaItem.count()
  const totalVillaImages = await prisma.villaImage.count()
  const totalLocationImages = await prisma.locationImage.count()

  console.log("\n=== Import Complete ===")
  console.log(`MediaItem records total: ${totalMediaItems}`)
  console.log(`VillaImage records total: ${totalVillaImages}`)
  console.log(`LocationImage records total: ${totalLocationImages}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
