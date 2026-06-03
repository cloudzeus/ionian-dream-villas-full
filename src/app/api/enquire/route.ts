import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendEnquiryNotification, sendThankYouEmail } from "@/lib/mailer"
import {
  HONEYPOT_FIELD,
  TIMESTAMP_FIELD,
  checkContentSignals,
  checkRateLimit,
  getClientIp,
} from "@/lib/antispam"

const schema = z.object({
  kind: z.enum(["booking", "contact"]),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  villa: z.string().max(120).optional(),
  arrival: z.string().max(40).optional(),
  nights: z.number().optional(),
  guests: z.number().optional(),
  message: z.string().min(1).max(5000),
  // Anti-spam signals (optional in schema; validated separately)
  [HONEYPOT_FIELD]: z.string().optional(),
  [TIMESTAMP_FIELD]: z.union([z.string(), z.number()]).optional(),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Per-IP rate limit
    const ip = getClientIp(req.headers)
    const rl = checkRateLimit(ip)
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 600) } },
      )
    }

    const body = schema.parse(await req.json())

    // 2. Honeypot + time-trap. Return a success-looking response so bots get
    //    no signal, but skip persistence and email entirely.
    const signals = checkContentSignals({
      honeypot: body[HONEYPOT_FIELD],
      loadedAt: body[TIMESTAMP_FIELD],
    })
    if (signals.spam) {
      console.warn(`[enquire] spam blocked (${signals.reason}) from ${ip}`)
      return NextResponse.json({ ok: true })
    }

    await prisma.enquiry.create({
      data: {
        kind: body.kind === "booking" ? "BOOKING" : "CONTACT",
        name: body.name,
        email: body.email,
        villa: body.villa,
        arrival: body.arrival,
        nights: body.nights,
        guests: body.guests,
        message: body.message,
      },
    })

    // Fire emails in parallel; log (don't fail the request on) delivery errors
    const results = await Promise.allSettled([
      sendEnquiryNotification({
        kind: body.kind,
        name: body.name,
        email: body.email,
        villa: body.villa,
        arrival: body.arrival,
        nights: body.nights,
        guests: body.guests,
        message: body.message,
      }),
      sendThankYouEmail(body.email, {
        name: body.name,
        villa: body.villa || "",
        arrival: body.arrival || "",
        nights: String(body.nights || ""),
        guests: String(body.guests || ""),
        message: body.message,
      }),
    ])
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[enquire] email ${i === 0 ? "notification" : "thank-you"} failed:`, r.reason)
      }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
