import { NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"

interface Motto { eyebrow: string; title: string; body: string }
interface MottoSet { motto0: Motto; motto1: Motto; motto2: Motto }

// Generates 3 mottos about Lefkada in EN, EL, DE simultaneously.
export async function POST() {
  try {
    const result = await deepseekJSON<{ en: MottoSet; el: MottoSet; de: MottoSet }>(
      `You are a copywriter for Ionian Dream Villas, a luxury villa rental brand on the island of Lefkada, Greece. Your tone is editorial, poetic, and understated — like a high-end travel magazine.`,
      `Generate 3 editorial mottos about Lefkada island for a luxury villa website. Each motto has:
- eyebrow: 3-7 words in "Greek phrase · English phrase" format (e.g. "Λευκάδα · Lefkada")
- title: one poetic, memorable sentence (max 10 words)
- body: 2-3 sentences of evocative travel writing (50-80 words)

Draw from these themes for the 3 mottos:
1. The island's unique geography — it's the only Ionian island connected to the Greek mainland by a floating drawbridge
2. The Ionian Sea and its mythological heritage — Homer's Odyssey, the colour of the water, the light
3. The culture, villages, olive groves, local life — slow travel, authentic Greece away from mass tourism

Return ONLY a valid JSON object with this exact structure:
{
  "en": {
    "motto0": { "eyebrow": "...", "title": "...", "body": "..." },
    "motto1": { "eyebrow": "...", "title": "...", "body": "..." },
    "motto2": { "eyebrow": "...", "title": "...", "body": "..." }
  },
  "el": { same structure in Greek },
  "de": { same structure in German }
}`,
      3000
    )
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
