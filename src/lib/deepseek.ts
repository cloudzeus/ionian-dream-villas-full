export async function deepseekChat(systemPrompt: string, userPrompt: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured")

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek API error: ${res.status} ${await res.text()}`)

  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? ""
  // Strip markdown code fences if present
  return content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
}

export async function deepseekJSON<T>(systemPrompt: string, userPrompt: string, maxTokens = 2000): Promise<T> {
  const raw = await deepseekChat(systemPrompt, userPrompt, maxTokens)
  return JSON.parse(raw) as T
}
