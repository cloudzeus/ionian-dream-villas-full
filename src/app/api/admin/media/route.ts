import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToBunny } from "@/lib/bunny"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const search = searchParams.get("search") || ""
  const folder = searchParams.get("folder") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "48")

  const where: any = {}
  if (search) {
    where.OR = [
      { filename: { contains: search } },
      { altEn: { contains: search } },
      { usedBy: { contains: search } },
    ]
  }
  if (folder) where.folder = folder

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mediaItem.count({ where }),
  ])

  return NextResponse.json({ items, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const files = formData.getAll("files") as File[]
  const folder = (formData.get("folder") as string) || "uploads"

  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 })

  const results = []
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const bunnyUrl = await uploadToBunny(buffer, file.name, folder)

    const item = await prisma.mediaItem.create({
      data: {
        filename: file.name,
        originalUrl: "",
        bunnyUrl,
        mimeType: file.type || "image/webp",
        folder,
      },
    })
    results.push(item)
  }

  return NextResponse.json({ items: results })
}
