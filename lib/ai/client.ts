/**
 * MedNavi Unified LLM Client
 * Connects to OpenAI, Groq, or compatible LLM APIs via environment variables.
 * Falls back gracefully to intelligent local medical heuristics if no key is configured.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmChatResult {
  content: string | null;
  isRateLimited?: boolean;
  status?: number;
}

export async function callLlmChatDetailed(
  messages: ChatMessage[],
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<LlmChatResult> {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return { content: null }; // Signals caller to use local clinical fallback
  }

  const executeCall = async () => {
    return fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });
  };

  try {
    let res = await executeCall();

    // If 429 rate limit hit, wait 2.5 seconds and retry once
    if (res.status === 429) {
      console.warn('LLM API returned 429 (rate limited). Waiting 2.5s and retrying once...');
      await new Promise((resolve) => setTimeout(resolve, 2500));
      res = await executeCall();
      if (res.status === 429) {
        console.warn('LLM API retry also returned 429.');
        return { content: null, isRateLimited: true, status: 429 };
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`LLM API returned ${res.status}: ${errText}`);
      return { content: null, isRateLimited: res.status === 429, status: res.status };
    }

    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || null,
      status: 200,
    };
  } catch (error) {
    console.warn('Error connecting to LLM API:', error);
    return { content: null };
  }
}

export async function callLlmChat(
  messages: ChatMessage[],
  options?: { temperature?: number; jsonMode?: boolean }
): Promise<string | null> {
  const res = await callLlmChatDetailed(messages, options);
  return res.content;
}
