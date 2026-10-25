import { callLlmChatDetailed, ChatMessage } from './client';
import { VALID_DEPARTMENTS, validateDepartment } from '../departments';

export interface ChatTurnMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SymptomChatResult {
  done: boolean;
  emergency: boolean;
  message?: string;
  step?: number;
  quickChips?: string[];
  department?: string;
  backupDepartment?: string;
  reason?: string;
  noteEn?: string;
  noteJa?: string;
  fallbackNotice?: string;
}

// Emergency red flag phrases that require immediate 119 ambulance triage
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'chest pressure',
  'tightness in chest',
  'heart attack',
  'cannot breathe',
  'difficulty breathing',
  'shortness of breath',
  'suffocating',
  'choking',
  'unconscious',
  'passed out',
  'fainted',
  'slurred speech',
  'face drooping',
  'sudden paralysis',
  'arm weakness',
  'coughing blood',
  'vomiting blood',
  'severe bleeding',
  'worst headache of my life',
  'anaphylaxis',
  'throat closing',
  'blue lips',
  'cyanosis'
];

/**
 * Checks for immediate emergency phrases in user messages
 */
export function checkEmergencyTrigger(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Fixed question sequence for the symptom checker (max 7-8 steps)
 * Asked directly without calling the AI to preserve strict rate limits.
 */
export const FIXED_QUESTIONS = [
  {
    step: 1,
    question:
      'Hello! I am your Japanese Healthcare Navigation Assistant. I will ask you a few brief questions to help determine which medical department in Japan you should visit, and prepare an authentic bilingual doctor note for clinic reception. To start, what is the main symptom or problem you are experiencing today?',
    quickChips: [
      'Fever & Chills',
      'Stomach Ache & Nausea',
      'Sore Throat & Cough',
      'Headache & Dizziness',
      'Skin Rash & Itch',
      'Joint or Muscle Pain'
    ]
  },
  {
    step: 2,
    question: 'When did these symptoms first start (e.g. today, 2-3 days ago, over a week)?',
    quickChips: ['Today', 'Yesterday', '2-3 days ago', 'About a week ago', 'More than 2 weeks']
  },
  {
    step: 3,
    question: 'On a scale from 1 (very mild) to 10 (unbearable), how severe is your pain or discomfort?',
    quickChips: ['1 (Very Mild)', '3 (Mild)', '5 (Moderate)', '7 (Severe)', '9 (Very Severe)']
  },
  {
    step: 4,
    question: 'Are you experiencing any other symptoms along with this (such as fever, nausea, fatigue, or cough)?',
    quickChips: ['Fatigue', 'Loss of appetite', 'Nausea', 'Body aches', 'None']
  },
  {
    step: 5,
    question: 'Could you share your approximate age group, and if applicable, whether you are currently pregnant?',
    quickChips: ['Adult (18-64)', 'Child / Infant', 'Senior (65+)', 'Currently Pregnant', 'Not Pregnant']
  },
  {
    step: 6,
    question: 'Have you taken any medications or remedies for this so far? (You can skip this if none)',
    quickChips: ['None / Skip', 'Paracetamol / Dolo', 'Painkillers', 'Antibiotics']
  },
  {
    step: 7,
    question: 'Do you have any known drug allergies or ongoing health conditions? (You can skip this if none)',
    quickChips: ['None / Skip', 'Penicillin', 'NSAIDs / Aspirin', 'Food allergies']
  }
];

export function getStepQuickChips(step: number): string[] {
  const item = FIXED_QUESTIONS.find((q) => q.step === step);
  return item ? item.quickChips : ['Ready for recommendation'];
}

// Common disease/diagnosis names to detect when user names a diagnosis instead of symptoms
const DIAGNOSIS_KEYWORDS = [
  'diabetes',
  'asthma',
  'hypertension',
  'high blood pressure',
  'cancer',
  'covid',
  'coronavirus',
  'pneumonia',
  'bronchitis',
  'appendicitis',
  'gastritis',
  'ulcer',
  'hernia',
  'glaucoma',
  'hepatitis',
  'depression',
  'adhd',
  'bipolar',
  'migraine',
  'arthritis',
  'eczema',
  'psoriasis',
  'tuberculosis',
  'flu',
  'influenza',
  'strep',
  'strep throat',
  'gout',
  'kidney stone',
  'gallstone',
  'anemia',
  'thyroid'
];

/**
 * Checks whether user response gave a diagnosis instead of symptoms, or is too vague/unclear
 */
function isDiagnosisOrUnclear(text: string, step: number): boolean {
  if (step !== 1 && step !== 4) return false;
  const t = text.trim().toLowerCase();

  // Very short or vague answers
  if (t.length < 3 || /^(idk|dont know|don't know|yes|no|\?+|\.+|help|sick)$/i.test(t)) {
    return true;
  }

  // Explicit diagnosis phrases
  if (/\b(i have|i've got|diagnosed with|i think i have|my disease is|my diagnosis is)\b/i.test(t)) {
    return true;
  }

  // Known disease names given without physical sensation keywords
  if (DIAGNOSIS_KEYWORDS.some((kw) => t.includes(kw))) {
    const symptomTerms = ['pain', 'fever', 'ache', 'hurts', 'cough', 'swollen', 'rash', 'bleed', 'vomit', 'dizzy', 'nausea', 'chill', 'sore'];
    const hasSymptom = symptomTerms.some((st) => t.includes(st));
    if (!hasSymptom) return true;
  }

  return false;
}

/**
 * Calls AI for a targeted clarifying follow-up when user answers with a diagnosis or unclear text
 */
async function generateClarificationFollowUp(userText: string): Promise<string> {
  const prompt = `The user was asked for their symptoms at a medical clinic intake in Japan, but they replied with: "${userText}".
This appears to be a named diagnosis/disease or an unclear response rather than physical symptoms.
In 1 to 2 friendly, polite sentences, ask them what specific physical symptoms or discomforts they are actually experiencing right now (for example: pain location, fever, swelling, cough, dizziness) so we can navigate them to the right Japanese clinic department.`;

  try {
    const res = await callLlmChatDetailed(
      [
        { role: 'system', content: 'You are a Japanese healthcare intake navigator. Ask the patient for their physical symptoms.' },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.3 }
    );

    if (res.content && res.content.trim()) {
      return res.content.trim();
    }
  } catch (e) {
    console.warn('AI clarification call failed:', e);
  }

  return `To help connect you to the right department, could you describe what specific physical symptoms or discomfort you are experiencing right now (such as fever, pain, cough, or nausea), rather than a diagnosis?`;
}

/**
 * Main function to process symptom chat turn
 */
export async function processSymptomChat(
  history: ChatTurnMessage[],
  currentStep: number
): Promise<SymptomChatResult> {
  const latestUserMessage = history
    .filter((m) => m.role === 'user')
    .slice(-1)[0]?.content || '';

  // 1. Immediate emergency check (no LLM needed)
  if (checkEmergencyTrigger(latestUserMessage)) {
    return {
      done: true,
      emergency: true,
      reason: 'Critical symptoms detected that require immediate emergency evaluation via 119.'
    };
  }

  // 2. Intercept unclear answers or named diagnoses (Calls AI only for follow-up if unclear)
  if (isDiagnosisOrUnclear(latestUserMessage, currentStep)) {
    const followUp = await generateClarificationFollowUp(latestUserMessage);
    return {
      done: false,
      emergency: false,
      message: followUp,
      step: currentStep, // keep on current question until clarified
      quickChips: getStepQuickChips(currentStep)
    };
  }

  // 3. Fixed question progression (NO AI calls during steps 1 through 6)
  if (currentStep < 7) {
    const nextStep = currentStep + 1;
    const fixedQ = FIXED_QUESTIONS.find((q) => q.step === nextStep) || FIXED_QUESTIONS[1];
    return {
      done: false,
      emergency: false,
      message: fixedQ.question,
      step: nextStep,
      quickChips: fixedQ.quickChips
    };
  }

  // 4. CONCLUSION STEP: All 7 questions answered. Call the LLM ONCE at the end.
  const deptListStr = VALID_DEPARTMENTS.map((d) => `${d.ja} (${d.en})`).join(', ');

  const systemPrompt = `
You are MedNavi's friendly, reassuring Japanese Healthcare Navigator.
You help foreign residents in Japan navigate the Japanese clinic system.

CRITICAL MEDICAL & SAFETY RULES:
1. NEVER DIAGNOSE. Never tell the patient what illness they have or might have (no "you might have appendicitis", "you have flu", etc.).
2. You ONLY assess symptom characteristics to recommend the appropriate Japanese medical department to visit.
3. If the user mentions emergency signs (chest pain, severe breathing difficulty, slurred speech, unconsciousness, severe sudden numbness), immediately set "emergency": true.
4. VALID CLINIC DEPARTMENTS: You MUST select the department and backupDepartment from this real Japanese medical department list:
   ${deptListStr}

RESPONSE FORMAT:
You must respond in valid JSON ONLY with this structure:
{
  "emergency": false,
  "department": "Exact department from list, e.g. 内科 (Internal Medicine)",
  "backupDepartment": "Exact backup department from list, e.g. 消化器内科 (Gastroenterology)",
  "reason": "Brief, patient-friendly explanation of why this department is suitable (NON-DIAGNOSTIC, e.g. 'To evaluate persistent high fever and throat inflammation...')",
  "noteEn": "Comprehensive English intake summary: main complaint, onset, severity, associated symptoms, meds, allergies.",
  "noteJa": "【問診票サマリー（外国人患者）】\\n■ 主訴：...\\n■ 現病歴・発症時期：...\\n■ 症状の強さ：10段階中【...】\\n■ 随伴症状：...\\n■ 服用中の薬：...\\n■ アレルギー：...\\n■ 配慮事項：日本語が不慣れなため、英語またはやさしい日本語での診療をお願い申し上げます。"
}
`;

  const messagesForLlm: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({
      role: h.role,
      content: h.content
    }))
  ];

  try {
    const llmCall = await callLlmChatDetailed(messagesForLlm, {
      jsonMode: true,
      temperature: 0.2
    });

    if (llmCall.isRateLimited) {
      console.warn('LLM 429 rate limit reached after retry. Falling back to clinical rules.');
      const fallback = executeRuleBasedFallback(history);
      return {
        ...fallback,
        fallbackNotice: 'AI is busy, showing a basic suggestion'
      };
    }

    if (llmCall.content) {
      const parsed = JSON.parse(llmCall.content);

      if (parsed.emergency === true) {
        return {
          done: true,
          emergency: true,
          reason: parsed.reason || 'Symptoms indicate urgent attention is required.'
        };
      }

      if (parsed.department) {
        const validatedDept = validateDepartment(parsed.department);
        const validatedBackup = validateDepartment(parsed.backupDepartment || '内科 (Internal Medicine)');

        return {
          done: true,
          emergency: false,
          department: validatedDept,
          backupDepartment: validatedBackup,
          reason: parsed.reason || 'Recommended based on your reported symptoms.',
          noteEn: parsed.noteEn || buildRuleBasedNoteEn(history),
          noteJa: parsed.noteJa || buildRuleBasedNoteJa(history)
        };
      }
    }
  } catch (err) {
    console.warn('LLM call failed or unparseable, executing clinical heuristic fallback:', err);
  }

  // 5. Robust Rule-Based Fallback Engine
  return executeRuleBasedFallback(history);
}

/**
 * High-quality deterministic clinical fallback engine
 */
function executeRuleBasedFallback(
  history: ChatTurnMessage[]
): SymptomChatResult {
  const userMessages = history.filter((m) => m.role === 'user').map((m) => m.content);
  const combinedUserText = userMessages.join(' ');

  // Emergency check on full history
  if (checkEmergencyTrigger(combinedUserText)) {
    return {
      done: true,
      emergency: true,
      reason: 'Critical symptoms detected that require immediate 119 emergency evaluation.'
    };
  }

  const primaryComplaint = userMessages[0] || '';
  const ageProfile = userMessages[4] || '';
  let validatedDept = validateDepartment(primaryComplaint);

  // If age profile explicitly mentions child/infant/pediatric, route to Pediatrics
  if (/child|baby|infant|pediatric|toddler|kid/i.test(ageProfile)) {
    validatedDept = '小児科 (Pediatrics)';
  } else if (validatedDept === '内科 (Internal Medicine)' && userMessages[3]) {
    // Check associated symptoms
    const associatedDept = validateDepartment(userMessages[3]);
    if (associatedDept !== '内科 (Internal Medicine)') {
      validatedDept = associatedDept;
    }
  }

  let backupDept = '内科 (Internal Medicine)';
  if (validatedDept.includes('小児科')) {
    backupDept = '耳鼻いんこう科 (Otolaryngology / ENT)';
  } else if (validatedDept.includes('消化器')) {
    backupDept = '内科 (Internal Medicine)';
  } else if (validatedDept.includes('皮膚科')) {
    backupDept = 'アレルギー科 (Allergology)';
  } else if (validatedDept.includes('耳鼻')) {
    backupDept = '呼吸器内科 (Respiratory / Pulmonology)';
  } else if (validatedDept.includes('内科')) {
    backupDept = '総合診療科 (General Practice)';
  }

  return {
    done: true,
    emergency: false,
    department: validatedDept,
    backupDepartment: backupDept,
    reason: `Based on your symptoms (${primaryComplaint || 'reported condition'}), visiting ${validatedDept} will allow appropriate medical examination.`,
    noteEn: buildRuleBasedNoteEn(history),
    noteJa: buildRuleBasedNoteJa(history)
  };
}

function buildRuleBasedNoteEn(history: ChatTurnMessage[]): string {
  const userMessages = history.filter((m) => m.role === 'user').map((m) => m.content);
  return `**Symptom Summary for Consultation:**
- **Primary Complaint:** ${userMessages[0] || 'Unspecified symptom'}
- **Onset / Duration:** ${userMessages[1] || 'Recently reported'}
- **Reported Severity:** ${userMessages[2] || 'Moderate'}
- **Associated Symptoms:** ${userMessages[3] || 'None reported'}
- **Age / Profile:** ${userMessages[4] || 'Adult'}
- **Medications Taken:** ${userMessages[5] || 'None reported'}
- **Known Allergies:** ${userMessages[6] || 'No known drug allergies reported'}

*Show this card or the Japanese note to clinic reception.*`;
}

function buildRuleBasedNoteJa(history: ChatTurnMessage[]): string {
  const userMessages = history.filter((m) => m.role === 'user').map((m) => m.content);
  return `【問診票サマリー（外国人患者）】
■ 主訴：${userMessages[0] || '体調不良'}
■ 発症時期：${userMessages[1] || '最近'}
■ 重症度（1〜10）：${userMessages[2] || '中等度'}
■ 随伴症状：${userMessages[3] || '特になし'}
■ 患者背景：${userMessages[4] || '成人'}
■ 服用中の薬：${userMessages[5] || '特になし'}
■ アレルギー：${userMessages[6] || '特記事項なし'}
■ 配慮事項：日本語が不慣れなため、英語またはやさしい日本語での診療対応をお願い申し上げます。`;
}
