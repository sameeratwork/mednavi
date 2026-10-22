/**
 * MedNavi Unified LLM Client
 * Connects to OpenAI, Groq, or compatible LLM APIs via environment variables.
 * Falls back gracefully to intelligent local medical heuristics if no key is configured.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callLlmChat(messages: ChatMessage[], options?: { temperature?: number; jsonMode?: boolean }): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return null; // Signals caller to use high-quality local clinical fallback
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`LLM API returned ${res.status}: ${errText}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.warn('Error connecting to LLM API:', error);
    return null;
  }
}
