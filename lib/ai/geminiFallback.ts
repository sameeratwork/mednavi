/**
 * Gemini Fallback Classifier (Phase 3)
 *
 * Called ONLY when keyword matching returns no group.
 * Sends ONLY user's text (max 200 chars) + group IDs & short names.
 * Never includes chat history, never includes personal details.
 *
 * Environment variables:
 * - LLM_API_KEY
 * - LLM_BASE_URL
 * - LLM_MODEL
 *
 * Parameters:
 * - temperature: 0
 * - max output tokens: 60
 * - JSON response: {"groupId":"gNN","confidence":0-1}
 * - System rule: "Pick the closest group, never diagnose."
 * - Validates groupId against SYMPTOM_GROUPS.
 * - Confidence threshold: >= 0.6.
 * - On 429 or error: retries once after a wait, then returns null.
 */

import { SYMPTOM_GROUPS, SymptomGroup, getGroupById } from '../symptomGroups';

export interface GeminiFallbackResult {
  group: SymptomGroup;
  confidence: number;
}

export async function callGeminiGroupFallback(userText: string): Promise<GeminiFallbackResult | null> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
  const model = process.env.LLM_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    return null;
  }

  // Sliced to max 200 chars
  const sanitizedText = userText.trim().slice(0, 200);
  if (!sanitizedText) {
    return null;
  }

  // List of group IDs and short names only (no personal info, no extra context)
  const groupList = SYMPTOM_GROUPS.map((g) => `${g.id}: ${g.name.en}`).join('\n');

  const endpoint = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a medical intake router. Pick the closest group from the provided list for the user symptoms, never diagnose. Respond in JSON only: {"groupId":"gNN","confidence":0-1}.',
      },
      {
        role: 'user',
        content: `Groups:\n${groupList}\n\nSymptoms: ${sanitizedText}`,
      },
    ],
    temperature: 0,
    max_tokens: 512,
    response_format: { type: 'json_object' },
  };

  const makeApiCall = async () => {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  };

  try {
    let res = await makeApiCall();

    // On 429 (rate limited) or network error, wait once and retry
    if (res.status === 429 || res.status >= 500) {
      console.warn(`Gemini fallback received HTTP ${res.status}. Waiting 2s and retrying once...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      res = await makeApiCall();
    }

    if (!res.ok) {
      console.warn(`Gemini fallback API returned HTTP ${res.status}`);
      return null;
    }

    const data: any = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      return null;
    }

    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch {
      // Clean possible markdown code fence wrapper
      const cleaned = rawContent.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const { groupId, confidence } = parsed;

    if (typeof groupId !== 'string' || typeof confidence !== 'number') {
      return null;
    }

    // Validate ID against group list
    const matchedGroup = getGroupById(groupId);
    if (!matchedGroup) {
      return null;
    }

    // Validate confidence is at least 0.6
    if (confidence < 0.6) {
      return null;
    }

    return {
      group: matchedGroup,
      confidence,
    };
  } catch (error) {
    console.warn('Gemini fallback failed:', error);
    return null;
  }
}
