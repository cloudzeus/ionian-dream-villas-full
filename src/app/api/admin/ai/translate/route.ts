import { NextRequest, NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"

export async function POST(req: NextRequest) {
  try {
    const { text, targetLocale } = await req.json() as {
      text: { name: string; nameLocal: string; kind: string; short: string; long: string }
      targetLocale: "el" | "de"
    }
    const lang = targetLocale === "el" ? "Greek" : "German"
    const translated = await deepseekJSON(
      `You are a senior luxury travel copywriter and native ${lang} speaker with deep knowledge of the Greek islands. You do NOT translate literally — you rewrite for a ${lang}-speaking audience using the vocabulary and rhythm a sophisticated native speaker would use.

Rules:
- Write as a native speaker, not a translator. Avoid awkward calques or anglicisms.
- Match the evocative, understated editorial tone of the English source (think Condé Nast Traveller, not a brochure).
- "short" (2–3 sentences) must be atmospheric and entice the reader — use sensory detail.
- "long" (3–5 sentences) deepens the sense of place — geography, light, texture, feeling. No hollow marketing superlatives.
- "kind" is a compact label (e.g. "Strand · Westküste" or "Παραλία · δυτική ακτή") — keep it crisp.
- "nameLocal" must stay as the original Greek name — never translate it.
- Return ONLY valid JSON. No explanations.`,
      `Adapt this location content from English to ${lang}:
${JSON.stringify(text, null, 2)}

Return JSON with exactly these keys: name, nameLocal, kind, short, long`,
      2000
    )
    return NextResponse.json(translated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
