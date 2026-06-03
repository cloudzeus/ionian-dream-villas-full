import { NextRequest, NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"
import { requireAuth } from "@/lib/api-auth"

// POST { label: string, note: string, targetLocale: "el" | "de" }
export async function POST(req: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied

  try {
    const { label, note, targetLocale } = await req.json() as {
      label: string
      note: string
      targetLocale: "el" | "de"
    }
    const lang = targetLocale === "el" ? "Greek" : "German"

    const result = await deepseekJSON<{ label: string; note: string }>(
      `You are a native ${lang}-speaking luxury hospitality professional. You adapt short fee descriptions for a high-end Greek island villa rental website.

Rules:
- "label": fee name — short, clear, professional in ${lang}. Use terms guests recognise.
- "note": 0–1 sentence clarification. Plain, factual, friendly. May be empty string if no note.
- Return ONLY valid JSON. No explanations.`,
      `Adapt this additional fee entry from English to ${lang}:

Label: ${label}
Note: ${note || "(none)"}

Return JSON: { "label": "...", "note": "..." }`,
      300
    )

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
