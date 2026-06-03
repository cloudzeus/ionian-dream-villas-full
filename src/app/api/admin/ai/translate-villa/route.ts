import { NextRequest, NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"
import { requireAuth } from "@/lib/api-auth"

export async function POST(req: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied

  try {
    const { text, targetLocale } = await req.json() as {
      text: { name: string; nameLocal: string; region: string; blurb: string; description: string; view: string; pool: string }
      targetLocale: "el" | "de"
    }
    const lang = targetLocale === "el" ? "Greek" : "German"
    const translated = await deepseekJSON(
      `You are a senior luxury villa copywriter and native ${lang} speaker. You write for high-end villa rental audiences — discerning travellers who choose Lefkada for privacy, authenticity, and natural beauty.

You do NOT translate literally. You rewrite for ${lang}-speaking readers using the cadence and vocabulary they expect from premium travel writing.

Field-specific rules:
- "blurb" (1–2 sentences): the guest's first impression — sensory, seductive, immediate. Make them want to book.
- "description" (3–5 sentences): character of the villa — architecture, light, gardens, the feeling of being there. Avoid hollow superlatives like "stunning" or "paradise".
- "view": a poetic dot-separated list (e.g. "Meerblick · Olivenhain · Abendrot" or "Θέα θάλασσα · Κήπος ελιών · Ηλιοβασίλεμα").
- "pool": one evocative sentence about the pool experience — coolness, stillness, light on water.
- "region": localised area name, natural in ${lang} (e.g. "Agios Nikitas-Küste" or "ακτή Αγίου Νικήτα").
- "nameLocal": keep the original Greek name — never translate it.
- Return ONLY valid JSON. No explanations.`,
      `Adapt this villa content from English to ${lang}:
${JSON.stringify(text, null, 2)}

Return JSON with exactly these keys: name, nameLocal, region, blurb, description, view, pool`,
      3000
    )
    return NextResponse.json(translated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
