import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import {
  checkEmergencyTrigger,
  checkSelfHarmTrigger,
  getCrisisSupportResources,
  evaluateUrgency,
  generateDoctorNotes,
  PatientIntakeData
} from '@/lib/ai/symptomChatbot';
import {
  findGroupByKeyword,
  getGroupById,
  SYMPTOM_GROUPS,
  SYMPTOM_CATEGORIES
} from '@/lib/symptomGroups';
import { getCanonicalDepartment } from '@/lib/departments';
import { callGeminiGroupFallback } from '@/lib/ai/geminiFallback';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting: 60 requests per minute
    const rateCheck = checkRateLimit(req, 60, 60 * 1000);
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
    const { action, text, intakeData } = body;

    // Action 1: Text check (emergency, self-harm, keyword match, Gemini fallback)
    if (action === 'check_text') {
      const trimmed = typeof text === 'string' ? text.trim().slice(0, 200) : '';

      // 1. Instant Emergency Check
      if (checkEmergencyTrigger(trimmed)) {
        return NextResponse.json({
          success: true,
          isEmergency: true,
          reason: 'Emergency symptoms detected requiring immediate attention.'
        });
      }

      // 2. Self-Harm / Crisis Check
      if (checkSelfHarmTrigger(trimmed)) {
        const support = getCrisisSupportResources();
        return NextResponse.json({
          success: true,
          isSelfHarm: true,
          support
        });
      }

      // 3. Keyword match to symptom group
      const matchedGroup = findGroupByKeyword(trimmed);
      if (matchedGroup) {
        return NextResponse.json({
          success: true,
          matchedGroup,
          method: 'keyword',
          enteredText: trimmed
        });
      }

      // 4. Gemini fallback: ONLY when keyword matching finds no group
      const geminiResult = await callGeminiGroupFallback(trimmed);
      if (geminiResult && geminiResult.group) {
        return NextResponse.json({
          success: true,
          matchedGroup: geminiResult.group,
          confidence: geminiResult.confidence,
          method: 'gemini',
          enteredText: trimmed
        });
      }

      // No match, confidence below 0.6, or error
      return NextResponse.json({
        success: true,
        matchedGroup: null,
        enteredText: trimmed,
        noMatchMessage: "I couldn't match that. Please pick the closest area."
      });
    }

    // Action 2: Generate final result (Department, Backup, Urgency, Trilingual Note)
    if (action === 'generate_result') {
      const data: PatientIntakeData = intakeData || {};
      const group = getGroupById(data.groupId);

      if (!group) {
        return NextResponse.json({ success: false, error: 'Invalid group ID' }, { status: 400 });
      }

      const primaryDept = getCanonicalDepartment(group.primaryDept);
      const backupDept = group.backupDept ? getCanonicalDepartment(group.backupDept) : undefined;
      const urgency = evaluateUrgency(data, group);
      const notes = generateDoctorNotes(data);

      return NextResponse.json({
        success: true,
        group,
        primaryDept: primaryDept || { ja: group.primaryDept, en: group.primaryDept, romaji: '', clinicCount: 0 },
        backupDept: backupDept || null,
        urgency,
        notes
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Symptom chatbot error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
