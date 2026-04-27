import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendEnquiryNotification, sendThankYouEmail } from "@/lib/mailer"

const schema = z.object({
  kind: z.enum(["booking", "contact"]),
  name: z.string().min(1),
  email: z.string().email(),
  villa: z.string().optional(),
  arrival: z.string().optional(),
  nights: z.number().optional(),
  guests: z.number().optional(),
  message: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())

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

    // Fire emails in parallel, silently ignore failures
    await Promise.allSettled([
      // Notify admin
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
      // Thank-you email to guest
      sendThankYouEmail(body.email, {
        name: body.name,
        villa: body.villa || "",
        arrival: body.arrival || "",
        nights: String(body.nights || ""),
        guests: String(body.guests || ""),
        message: body.message,
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
