import { NextRequest, NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"
import { requireAuth } from "@/lib/api-auth"

// POST { label: string, body: string, targetLocale: "el" | "de" }
// Translates a single rate term (label + body) to the target language.
export async function POST(req: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied

  try {
    const { label, body, targetLocale } = await req.json() as {
      label: string
      body: string
      targetLocale: "el" | "de"
    }
    const lang = targetLocale === "el" ? "Greek" : "German"

    const result = await deepseekJSON<{ label: string; body: string }>(
      `You are a senior luxury hospitality copywriter and native ${lang} speaker. You adapt English rental terms and conditions for a high-end Greek island villa rental brand.

Rules:
- "label": short heading — crisp, clear, formal but approachable in ${lang}. Never a literal calque.
- "body": 1–3 sentences of plain, professional prose. Use the register a ${lang}-speaking hospitality lawyer or luxury concierge would use — formal but human, not bureaucratic.
- Return ONLY valid JSON. No explanations.`,
      `Adapt this booking term from English to ${lang}:

Label: ${label}
Body: ${body}

Return JSON: { "label": "...", "body": "..." }`,
      500
    )

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
