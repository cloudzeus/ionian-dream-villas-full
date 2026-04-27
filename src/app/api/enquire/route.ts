import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

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

    // Optionally send email via Resend if API key set
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: "noreply@ionian-dream-villas.com",
          to: process.env.MAIL_TO || "stay@ionian-dream-villas.com",
          subject: `New ${body.kind} enquiry from ${body.name}`,
          text: JSON.stringify(body, null, 2),
        })
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
