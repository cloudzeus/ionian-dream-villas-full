// Download location images from Strapi → convert to WebP → upload to Bunny CDN → update DB
import { PrismaClient } from "@prisma/client"
import sharp from "sharp"

const prisma = new PrismaClient()

const STORAGE_ZONE = "ioniandreamvillas"
const ACCESS_KEY = "e9d682bc-9c9c-494b-864becd2ea86-864a-4aa8"
const STORAGE_HOST = "storage.bunnycdn.com"
const CDN_URL = "https://ioniandreamvillas.b-cdn.net"

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}

async function toWebP(buffer) {
  return sharp(buffer).webp({ quality: 85 }).toBuffer()
}

async function uploadToBunny(buffer, remotePath) {
  const url = `https://${STORAGE_HOST}/${STORAGE_ZONE}/${remotePath}`
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: ACCESS_KEY,
      "Content-Type": "image/webp",
    },
    body: buffer,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed (${res.status}): ${text}`)
  }
  return `${CDN_URL}/${remotePath}`
}

function makeFilename(originalUrl, locationSlug, index) {
  const ts = Date.now()
  const base = `${ts}-${locationSlug}-${String(index).padStart(2, "0")}`
  return `locations/${locationSlug}/${base}.webp`
}

async function main() {
  const images = await prisma.locationImage.findMany({
    where: { url: { contains: "ionianback.wwa.gr" } },
    include: { location: { select: { slug: true } } },
    orderBy: [{ locationId: "asc" }, { sortOrder: "asc" }],
  })

  console.log(`Found ${images.length} images to migrate`)

  // Group by location so we can give sequential indices
  const byLocation = {}
  for (const img of images) {
    const slug = img.location.slug
    if (!byLocation[slug]) byLocation[slug] = []
    byLocation[slug].push(img)
  }

  for (const [slug, imgs] of Object.entries(byLocation)) {
    console.log(`\n→ ${slug} (${imgs.length} images)`)
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i]
      try {
        process.stdout.write(`  [${i + 1}/${imgs.length}] Downloading... `)
        const original = await downloadImage(img.url)

        process.stdout.write(`Converting... `)
        const webp = await toWebP(original)

        const remotePath = makeFilename(img.url, slug, i + 1)
        process.stdout.write(`Uploading (${Math.round(webp.length / 1024)}KB)... `)
        const newUrl = await uploadToBunny(webp, remotePath)

        await prisma.locationImage.update({
          where: { id: img.id },
          data: { url: newUrl },
        })

        console.log(`✓ ${newUrl}`)
      } catch (err) {
        console.error(`\n  ✗ ERROR: ${err.message}`)
      }
    }
  }

  console.log("\nDone.")
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
