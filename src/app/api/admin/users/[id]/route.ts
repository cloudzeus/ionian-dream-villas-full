import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const patchSchema = z.object({
  name: z.string().max(120).nullable().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(["ADMIN", "EDITOR"]).optional(),
})

async function requireAdmin() {
  const session = await auth()
  const user = session?.user as { id?: string; role?: string } | undefined
  if (!session || user?.role !== "ADMIN") return null
  return session
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }
  const data = parsed.data

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Guard: don't allow demoting the last remaining ADMIN.
  if (data.role && data.role !== "ADMIN" && target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot demote the last administrator" }, { status: 400 })
    }
  }

  // Guard: email uniqueness when changing email.
  if (data.email && data.email !== target.email) {
    const clash = await prisma.user.findUnique({ where: { email: data.email } })
    if (clash) return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 })
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name || null
  if (data.email !== undefined) updateData.email = data.email
  if (data.role !== undefined) updateData.role = data.role
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const currentUserId = (session.user as { id?: string }).id

  // Guard: can't delete yourself.
  if (id === currentUserId) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Guard: don't delete the last remaining ADMIN.
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last administrator" }, { status: 400 })
    }
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
