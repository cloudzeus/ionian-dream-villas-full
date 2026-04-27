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
      `You are a professional translator for a luxury villa rental website in Lefkada, Greece. Translate JSON fields from English to ${lang}. Return ONLY valid JSON with the same keys. Keep "nameLocal" as the Greek local name (keep as-is if already Greek). Match travel/hospitality tone.`,
      `Translate to ${lang}:\n${JSON.stringify(text, null, 2)}\n\nReturn JSON only with keys: name, nameLocal, kind, short, long`,
      2000
    )
    return NextResponse.json(translated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
