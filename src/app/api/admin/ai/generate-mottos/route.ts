import { NextResponse } from "next/server"
import { deepseekJSON } from "@/lib/deepseek"

interface Motto { eyebrow: string; title: string; body: string }
interface MottoSet { motto0: Motto; motto1: Motto; motto2: Motto }

// Generates 3 mottos about Lefkada in EN, EL, DE simultaneously.
export async function POST() {
  try {
    const result = await deepseekJSON<{ en: MottoSet; el: MottoSet; de: MottoSet }>(
      `You are an award-winning luxury travel copywriter who has written for Condé Nast Traveller, Monocle, and Kinfolk. You craft intimate, literary travel prose that makes readers feel they are already there — never clichéd, never overwrought, never promotional.

For the Greek version you write as a native Greek author who loves their island. For the German version you write with the elegance of a Feuilleton journalist. Each language version should feel original, not translated.`,
      `Write 3 editorial mottos about Lefkada island for the homepage of a luxury private villa rental website. Each has:
- eyebrow: 3–6 words, "Greek · English" (or "Greek · German"), a quiet geographic or poetic label
- title: one lapidary sentence, 6–10 words — poetic, curious, memorable
- body: 2–3 sentences, 45–70 words — literary travel writing. Sensory, specific, unhurried. No superlatives. No "paradise", "stunning", "breathtaking".

Three themes (one each):
1. The island's peculiar geography — a single causeway connects it to the mainland; pine ridges; the west-coast cliffs
2. The Ionian Sea — colour, light, mythological depth, the Odyssey
3. Village life, olive groves, the pace of authentic Greece, slow travel

Return ONLY valid JSON:
{
  "en": { "motto0": { "eyebrow": "...", "title": "...", "body": "..." }, "motto1": {...}, "motto2": {...} },
  "el": { "motto0": { "eyebrow": "...", "title": "...", "body": "..." }, "motto1": {...}, "motto2": {...} },
  "de": { "motto0": { "eyebrow": "...", "title": "...", "body": "..." }, "motto1": {...}, "motto2": {...} }
}`,
      3500
    )
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
