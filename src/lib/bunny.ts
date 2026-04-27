import sharp from "sharp"

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY!
const STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com"
const CDN_URL = process.env.BUNNY_CDN_URL!

export async function uploadToBunny(
  file: Buffer | Uint8Array,
  originalName: string,
  folder: string = "uploads"
): Promise<string> {
  // Convert to webp, preserving transparency
  const webpBuffer = await sharp(Buffer.from(file))
    .webp({ quality: 85, lossless: false })
    .toBuffer()

  const fileName = `${folder}/${Date.now()}-${slugify(originalName)}.webp`

  const response = await fetch(
    `https://${STORAGE_HOST}/${STORAGE_ZONE}/${fileName}`,
    {
      method: "PUT",
      headers: {
        AccessKey: ACCESS_KEY,
        "Content-Type": "image/webp",
      },
      body: webpBuffer as unknown as BodyInit,
    }
  )

  if (!response.ok) {
    throw new Error(`BunnyCDN upload failed: ${response.status} ${response.statusText}`)
  }

  return `${CDN_URL}/${fileName}`
}

export async function deleteFromBunny(url: string): Promise<void> {
  const path = url.replace(CDN_URL + "/", "")
  await fetch(`https://${STORAGE_HOST}/${STORAGE_ZONE}/${path}`, {
    method: "DELETE",
    headers: { AccessKey: ACCESS_KEY },
  })
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}
