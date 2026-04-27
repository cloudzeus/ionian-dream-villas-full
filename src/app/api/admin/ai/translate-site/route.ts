import { NextRequest, NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"

// Translates all site text fields from EN to a target locale.
// Body: { fields: Record<string, string>, targetLocale: "el" | "de" }
// Returns: Record<string, string>
export async function POST(req: NextRequest) {
  try {
    const { fields, targetLocale } = await req.json() as {
      fields: Record<string, string>
      targetLocale: "el" | "de"
    }
    const lang = targetLocale === "el" ? "Greek" : "German"
    const translated = await deepseekJSON<Record<string, string>>(
      `You are a professional translator for a luxury villa rental website in Lefkada, Greece. Translate the provided JSON key-value pairs from English to ${lang}. Return ONLY valid JSON with the exact same keys. Rules: headings/labels should be concise; mottos should be poetic; button labels should be short and actionable; legal/terms text should be formal; "closingGreek" stays as authentic Greek phrasing. Keys use dot-notation like "rates.termsDeposit" — preserve all keys exactly.`,
      `Translate these site text fields to ${lang}:\n${JSON.stringify(fields, null, 2)}\n\nReturn JSON with the exact same keys, only values translated.`,
      4000
    )
    return NextResponse.json(translated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
