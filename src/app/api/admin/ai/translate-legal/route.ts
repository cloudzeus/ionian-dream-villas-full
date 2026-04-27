import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, targetLocale } = await req.json()

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return NextResponse.json({ error: "DEEPSEEK_API_KEY not set" }, { status: 500 })

  const langMap: Record<string, string> = { el: "Greek", de: "German", en: "English" }
  const lang = langMap[targetLocale] || targetLocale

  const systemPrompt = `You are a professional legal translator and native ${lang} speaker specialising in hospitality and travel law. You do NOT translate mechanically — you write fluent, natural ${lang} that reads as if originally authored by a ${lang}-speaking lawyer familiar with European (GDPR) and Greek law.

Rules:
- Preserve the legal accuracy and formal register of the source.
- Use the natural legal vocabulary a ${lang}-speaking professional would use — not word-for-word calques.
- Headings (inside <h2> tags) should be sharp and clear.
- Paragraph text should flow naturally for a ${lang} reader.
- Preserve ALL HTML tags exactly as they are — only translate text nodes.
- Return ONLY valid JSON with keys "title" and "content". No explanations.`

  const prompt = `Adapt this legal page from English to ${lang} for a luxury Greek island villa rental company.

Title: ${title}

Content:
${content}

Return JSON: { "title": "...", "content": "..." }`

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `DeepSeek error: ${err}` }, { status: 500 })
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content
  try {
    const parsed = JSON.parse(raw)
    return NextResponse.json({ data: parsed })
  } catch {
    return NextResponse.json({ error: "Failed to parse DeepSeek response", raw }, { status: 500 })
  }
}
