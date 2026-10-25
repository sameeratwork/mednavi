import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { processSymptomChat, ChatTurnMessage } from '@/lib/ai/symptomChatbot';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting: 30 requests per minute
    const rateCheck = checkRateLimit(req, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please wait ${rateCheck.resetAfterSeconds} seconds before trying again.`,
          rateLimited: true,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetAfterSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const { history, step } = body;

    if (!Array.isArray(history)) {
      return NextResponse.json(
        { success: false, error: 'Invalid history parameter provided.' },
        { status: 400 }
      );
    }

    // 2. Message length limit: max 500 characters per message
    const validatedHistory: ChatTurnMessage[] = history.map((m: any) => {
      const content = typeof m.content === 'string' ? m.content.trim() : '';
      return {
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: content.slice(0, 500),
      };
    });

    const currentStep = typeof step === 'number' ? Math.max(1, Math.min(step, 8)) : 1;

    // 3. Process chatbot turn
    const result = await processSymptomChat(validatedHistory, currentStep);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error in symptom-chat API route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
