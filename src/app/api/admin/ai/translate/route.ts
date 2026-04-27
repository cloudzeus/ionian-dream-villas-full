import { NextRequest, NextResponse } from "next/server"

// POST body: { text: { name, nameLocal, kind, short, long }, targetLocale: "el" | "de" }
// Returns translated fields using DeepSeek chat API
export async function POST(req: NextRequest) {
  const { text, targetLocale } = await req.json() as {
    text: { name: string; nameLocal: string; kind: string; short: string; long: string }
    targetLocale: "el" | "de"
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY not configured" }, { status: 500 })
  }

  const languageMap: Record<string, string> = {
    el: "Greek",
    de: "German",
  }
  const targetLanguage = languageMap[targetLocale] || targetLocale

  const systemPrompt = `You are a professional translator for a luxury villa rental website in Lefkada, Greece. Translate the provided JSON fields from English to ${targetLanguage}. Return ONLY a valid JSON object with the same keys. Keep "nameLocal" as the Greek local name (transliterate or keep as-is if already in Greek). Keep formatting and tone consistent with travel/hospitality content.`

  const userPrompt = `Translate to ${targetLanguage}:\n${JSON.stringify(text, null, 2)}\n\nReturn JSON only with keys: name, nameLocal, kind, short, long`

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `DeepSeek API error: ${err}` }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ""

    // Strip markdown code fences if present
    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const translated = JSON.parse(jsonStr)

    return NextResponse.json(translated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
