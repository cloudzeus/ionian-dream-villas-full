import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { testSmtpConnection, type SmtpConfig } from "@/lib/mailer"

// All keys managed by this route
const CONTACT_INFO_KEYS = [
  // Addresses (up to 2)
  "ci:addr1_label", "ci:addr1_value",
  "ci:addr2_label", "ci:addr2_value",
  // Phones (up to 2)
  "ci:phone1_label", "ci:phone1_value",
  "ci:phone2_label", "ci:phone2_value",
  // Emails & response
  "ci:email_main", "ci:email_booking", "ci:response_time",
  // Social
  "social:facebook", "social:instagram", "social:twitter",
  "social:youtube", "social:tripadvisor",
  // Brand
  "brand:icon_svg",
  // SMTP
  "smtp:host", "smtp:port", "smtp:secure",
  "smtp:user", "smtp:pass",
  "smtp:from_name", "smtp:from_email", "smtp:to_email",
  // Thank-you email
  "thankyou:subject", "thankyou:body_html",
]

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await prisma.siteSetting.findMany({ where: { key: { in: CONTACT_INFO_KEYS } } })
  const data = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body: Record<string, string> = await req.json()

  // Only allow known keys
  const entries = Object.entries(body).filter(([k]) => CONTACT_INFO_KEYS.includes(k))

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  )

  return NextResponse.json({ ok: true })
}

// DELETE a specific key (for clearing optional fields)
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key } = await req.json()
  if (!CONTACT_INFO_KEYS.includes(key)) {
    return NextResponse.json({ error: "Unknown key" }, { status: 400 })
  }

  await prisma.siteSetting.deleteMany({ where: { key } })
  return NextResponse.json({ ok: true })
}

// PATCH — special actions (e.g. test SMTP)
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action, ...payload } = await req.json()

  if (action === "test-smtp") {
    const result = await testSmtpConnection(payload as SmtpConfig)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
