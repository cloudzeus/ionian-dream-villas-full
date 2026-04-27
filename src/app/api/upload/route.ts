import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadToBunny } from "@/lib/bunny"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string) || "uploads"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToBunny(buffer, file.name, folder)

  return NextResponse.json({ url })
}
