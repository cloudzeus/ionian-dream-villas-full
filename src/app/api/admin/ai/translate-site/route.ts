import { NextRequest, NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"
import { requireAuth } from "@/lib/api-auth"

// Translates all site text fields from EN to a target locale.
// Body: { fields: Record<string, string>, targetLocale: "el" | "de" }
// Returns: Record<string, string>
export async function POST(req: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied

  try {
    const { fields, targetLocale } = await req.json() as {
      fields: Record<string, string>
      targetLocale: "el" | "de"
    }
    const lang = targetLocale === "el" ? "Greek" : "German"
    const translated = await deepseekJSON<Record<string, string>>(
      `You are a senior luxury travel copywriter AND native ${lang} speaker. You adapt English website copy for a high-end Greek island villa rental brand targeting discerning ${lang}-speaking travellers. You do NOT translate literally — you rewrite with the voice and idiom a sophisticated native speaker expects.

Rules by content type (infer from the key name):
- Headings & subheadings: crisp, evocative — the rhythm matters as much as the meaning.
- Mottos (home.mottos.*): poetic, unhurried prose — think literary travel essay, not brochure. Adapt cultural references naturally.
- Button labels / CTAs: concise, active, natural in ${lang} — avoid direct calques.
- Terms / legal text (rates.terms*): formal but readable, not legalistic jargon.
- UI labels (gallery, details, etc.): plain ${lang} equivalents a native speaker would use.
- "closingGreek" (home.closingGreek): keep the original Greek phrase unchanged.
- Keys use dot-notation — preserve all keys exactly, only rewrite the values.
- Return ONLY valid JSON. No explanations.`,
      `Adapt these site text fields from English to ${lang}:
${JSON.stringify(fields, null, 2)}

Return JSON with the exact same keys, values adapted for ${lang}-speaking audience.`,
      4000
    )
    return NextResponse.json(translated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
