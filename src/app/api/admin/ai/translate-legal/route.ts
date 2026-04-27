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

  const prompt = `Translate the following legal page content from English to ${lang}.
Return a JSON object with "title" and "content" fields.
The content may contain HTML — preserve all HTML tags exactly, only translate the visible text inside them.
Do not add any explanations, only return valid JSON.

Title: ${title}

Content:
${content}`

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
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
