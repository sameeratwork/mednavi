/**
 * Symptom Chatbot Engine (No-AI Core)
 *
 * Handles:
 * - Instant multilingual emergency checks (EN / JA / HI)
 * - Immediate self-harm & mental crisis detection with TELL Lifeline & 119 resources
 * - Group keyword matching
 * - Code-based urgency evaluation (119 now / see doctor today / within a few days / routine)
 * - Multilingual doctor intake note generation with medicine/allergy normalization
 */

import { CANONICAL_DEPARTMENTS, matchesKeyword } from '../departments';
import {
  SYMPTOM_GROUPS,
  SymptomGroup,
  findGroupByKeyword,
  getGroupById
} from '../symptomGroups';
import { EMERGENCY_NUMBERS } from '../emergencyNumbers';

export interface PatientIntakeData {
  groupId: string;
  chiefComplaint?: string;
  duration?: string;
  severity?: number;
  ageGroup?: string;
  isPregnant?: string;
  medications?: string;
  allergies?: string;
  checkedRedFlags?: string[];
}

export type UrgencyLevel = '119_now' | 'see_doctor_today' | 'within_few_days' | 'routine';

export interface UrgencyInfo {
  level: UrgencyLevel;
  badge: {
    en: string;
    ja: string;
    hi: string;
  };
  description: {
    en: string;
    ja: string;
    hi: string;
  };
  color: string;
}

export interface GeneratedDoctorNote {
  noteJa: string;
  noteEn: string;
  noteHi: string;
}

// ── Emergency Words (Ambulance 119) ──────────────────────────────────────────
export const EMERGENCY_PHRASES = {
  en: [
    'chest pain', 'chest pressure', 'cannot breathe', 'difficulty breathing',
    'shortness of breath', 'suffocating', 'choking', 'unconscious', 'passed out',
    'fainted', 'slurred speech', 'face drooping', 'arm weakness', 'sudden paralysis',
    'coughing blood', 'vomiting blood', 'severe bleeding', 'worst headache of my life',
    'anaphylaxis', 'blue lips', 'cyanosis', 'heart attack', 'stroke'
  ],
  ja: [
    '胸の激痛', '胸が痛い', '呼吸困難', '息ができない', '意識不明', '気を失った',
    '倒れた', '大量出血', '激しい出血', '吐血', '喀血', '血を吐いた', '激しい頭痛',
    'ろれつが回らない', '半身麻痺', '顔が下がる', '窒息', 'アナフィラキシー'
  ],
  hi: [
    'सीने में तेज दर्द', 'सांस नहीं आ रही', 'सांस लेने में भारी तकलीफ', 'बेहोश',
    'खून की उल्टी', 'खांसी में खून', 'तेज खून बहना', 'चेहरा लटकना', 'लकवा', 'दम घुटना'
  ]
};

// ── Self-Harm / Crisis Words ────────────────────────────────────────────────
export const SELF_HARM_PHRASES = {
  en: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
    'cutting myself', 'hurting myself', 'take my own life'
  ],
  ja: [
    '死にたい', '自殺', '命を絶ちたい', '消えたい', '自傷', '自分を傷つけ'
  ],
  hi: [
    'आत्महत्या', 'खुद को मारना', 'जान देना', 'मरना चाहता', 'मरना चाहती', 'खुदकुशी'
  ]
};

/**
 * Checks for immediate emergency words
 */
export function checkEmergencyTrigger(text: string): boolean {
  if (!text) return false;
  const input = text.trim();

  for (const phrase of EMERGENCY_PHRASES.en) {
    if (matchesKeyword(input, phrase)) return true;
  }
  for (const phrase of EMERGENCY_PHRASES.ja) {
    if (input.includes(phrase)) return true;
  }
  for (const phrase of EMERGENCY_PHRASES.hi) {
    if (input.includes(phrase)) return true;
  }

  return false;
}

/**
 * Checks for self-harm or suicidal ideation
 */
export function checkSelfHarmTrigger(text: string): boolean {
  if (!text) return false;
  const input = text.trim();

  for (const phrase of SELF_HARM_PHRASES.en) {
    if (matchesKeyword(input, phrase)) return true;
  }
  for (const phrase of SELF_HARM_PHRASES.ja) {
    if (input.includes(phrase)) return true;
  }
  for (const phrase of SELF_HARM_PHRASES.hi) {
    if (input.includes(phrase)) return true;
  }

  return false;
}

/**
 * Returns crisis support information (TELL Lifeline & 119)
 */
export function getCrisisSupportResources() {
  const tell = EMERGENCY_NUMBERS.find((n) => n.id === 'tell-lifeline');
  const ambulance = EMERGENCY_NUMBERS.find((n) => n.id === 'ambulance-119');
  return { tell, ambulance };
}

// ── Common Medicine & Allergy Normalization Lookups ──────────────────────────
export const MEDICINE_LOOKUP: Record<string, { ja: string; en: string }> = {
  paracetamol: { ja: 'アセトアミノフェン', en: 'Acetaminophen / Paracetamol' },
  dolo: { ja: 'アセトアミノフェン（Dolo）', en: 'Acetaminophen (Dolo)' },
  crocin: { ja: 'アセトアミノフェン（Crocin）', en: 'Acetaminophen (Crocin)' },
  calonal: { ja: 'カロナール（アセトアミノフェン）', en: 'Calonal (Acetaminophen)' },
  カロナール: { ja: 'カロナール（アセトアミノフェン）', en: 'Calonal (Acetaminophen)' },
  loxonin: { ja: 'ロキソニン（ロキソプロフェン）', en: 'Loxonin (Loxoprofen)' },
  ロキソニン: { ja: 'ロキソニン（ロキソプロフェン）', en: 'Loxonin (Loxoprofen)' },
  loxoprofen: { ja: 'ロキソプロフェン', en: 'Loxoprofen' },
  ibuprofen: { ja: 'イブプロフェン', en: 'Ibuprofen' },
  イブプロフェン: { ja: 'イブプロフェン', en: 'Ibuprofen' },
  advil: { ja: 'イブプロフェン（Advil）', en: 'Ibuprofen (Advil)' },
  motrin: { ja: 'イブプロフェン（Motrin）', en: 'Ibuprofen (Motrin)' },
  eve: { ja: 'イブプロフェン（EVE）', en: 'Ibuprofen (EVE)' }
};

export const ALLERGY_LOOKUP: Record<string, { ja: string; en: string }> = {
  penicillin: { ja: 'ペニシリン', en: 'Penicillin' },
  ペニシリン: { ja: 'ペニシリン', en: 'Penicillin' },
  aspirin: { ja: 'アスピリン', en: 'Aspirin' },
  アスピリン: { ja: 'アスピリン', en: 'Aspirin' },
  nsaids: { ja: '非ステロイド性抗炎症薬 (NSAIDs)', en: 'NSAIDs' },
  nsaid: { ja: '非ステロイド性抗炎症薬 (NSAIDs)', en: 'NSAIDs' },
  sulfa: { ja: 'サルファ剤', en: 'Sulfa antibiotics' },
  antibiotics: { ja: '抗生物質', en: 'Antibiotics' }
};

/**
 * Normalizes user-entered medicine strings with authentic Japanese medical names
 */
export function normalizeMedications(input?: string): { ja: string; en: string; hi: string } {
  if (!input || !input.trim() || /^(none|no|nil|なし|ない|नहीं|skip)$/i.test(input.trim())) {
    return { ja: '特になし', en: 'None reported', hi: 'कोई नहीं' };
  }

  const raw = input.trim();
  const lower = raw.toLowerCase();

  for (const [key, val] of Object.entries(MEDICINE_LOOKUP)) {
    if (lower.includes(key)) {
      return {
        ja: `${val.ja}（患者記載: ${raw}）`,
        en: `${val.en} (as reported: ${raw})`,
        hi: `${val.en} (${raw})`
      };
    }
  }

  // Free-text stays as typed
  return { ja: raw, en: raw, hi: raw };
}

/**
 * Normalizes user-entered allergy strings
 */
export function normalizeAllergies(input?: string): { ja: string; en: string; hi: string } {
  if (!input || !input.trim() || /^(none|no|nil|なし|ない|特になし|नहीं|skip)$/i.test(input.trim())) {
    return { ja: '特になし', en: 'None reported', hi: 'कोई नहीं' };
  }

  const raw = input.trim();
  const lower = raw.toLowerCase();

  for (const [key, val] of Object.entries(ALLERGY_LOOKUP)) {
    if (lower.includes(key)) {
      return {
        ja: `${val.ja}（患者記載: ${raw}）`,
        en: `${val.en} (as reported: ${raw})`,
        hi: `${val.en} (${raw})`
      };
    }
  }

  // Free-text stays as typed
  return { ja: raw, en: raw, hi: raw };
}

/**
 * Normalizes age and pregnancy
 */
export function normalizeAgeAndPregnancy(
  ageGroup?: string,
  isPregnant?: string
): { ja: string; en: string; hi: string } {
  const age = ageGroup || '大人（18〜64歳） / Adult (18-64)';
  const pregnant = isPregnant && isPregnant !== 'not_pregnant' && isPregnant !== 'No'
    ? '【現在妊娠中 / Currently Pregnant】'
    : '';

  return {
    ja: `${age}${pregnant ? ` ${pregnant}` : ''}`,
    en: `${age}${pregnant ? ' (Currently pregnant)' : ''}`,
    hi: `${age}${pregnant ? ' (वर्तमान में गर्भवती)' : ''}`
  };
}

/**
 * Code-based Urgency Evaluation (Item 5)
 * - 119 now
 * - See a doctor today
 * - Within a few days
 * - Routine
 * Age 65+ or under 3 with fever raises it!
 */
export function evaluateUrgency(data: PatientIntakeData, group?: SymptomGroup): UrgencyInfo {
  // 1. Any checked red flags -> 119 now
  if (data.checkedRedFlags && data.checkedRedFlags.length > 0) {
    return {
      level: '119_now',
      badge: {
        en: 'Immediate 119 Call Needed',
        ja: '直ちに119番（救急要請）',
        hi: 'तत्काल 119 एम्बुलेंस कॉल आवश्यक'
      },
      description: {
        en: 'Dangerous red flag symptoms were reported. Please call 119 for an ambulance or go to an emergency room immediately.',
        ja: '危険な兆候（レッドフラッグ）が認められます。直ちに119番通報で救急車を呼ぶか、救急外来を受診してください。',
        hi: 'खतरनाक लक्षण पाए गए हैं। कृपया तुरंत 119 पर एम्बुलेंस बुलाएं या नजदीकी आपातकालीन कक्ष (ER) जाएं।'
      },
      color: 'red'
    };
  }

  const severity = typeof data.severity === 'number' ? data.severity : 5;
  const isFeverGroup = data.groupId === 'g01' || data.groupId === 'g14';
  const isInfant = data.ageGroup?.includes('under_3') || data.ageGroup?.includes('Infant') || data.ageGroup?.includes('乳幼児');
  const isSenior = data.ageGroup?.includes('65+') || data.ageGroup?.includes('Senior') || data.ageGroup?.includes('高齢者');

  // Rule: Age 65+ or under 3 with fever raises urgency to "See a doctor today"
  if (isFeverGroup && (isInfant || isSenior)) {
    return {
      level: 'see_doctor_today',
      badge: {
        en: 'See a Doctor Today (High Priority)',
        ja: '本日中に医療機関を受診（優先度高）',
        hi: 'आज ही डॉक्टर को दिखाएं (उच्च प्राथमिकता)'
      },
      description: {
        en: 'Fever in infants under 3 or seniors (65+) requires timely medical evaluation today to prevent sudden complications.',
        ja: '乳幼児や65歳以上の高齢者の発熱は急激に重症化しやすいため、本日中の速やかな受診をお勧めします。',
        hi: 'शिशुओं या 65 वर्ष से अधिक उम्र के बुजुर्गों में बुखार जटिलताओं से बचने के लिए आज ही डॉक्टर द्वारा देखा जाना चाहिए।'
      },
      color: 'amber'
    };
  }

  // 2. High severity (>= 8) or severe acute onset (>= 6 with today/yesterday)
  if (severity >= 8 || (severity >= 6 && (data.duration?.includes('today') || data.duration?.includes('hours')))) {
    return {
      level: 'see_doctor_today',
      badge: {
        en: 'See a Doctor Today',
        ja: '本日中に医療機関を受診',
        hi: 'आज ही डॉक्टर को दिखाएं'
      },
      description: {
        en: 'Your reported discomfort is severe. Visit a clinic or hospital consultation center today during opening hours.',
        ja: '強い症状が見られます。本日の診療時間内に医療機関を受診してください。',
        hi: 'आपके लक्षण गंभीर हैं। कृपया आज ही क्लिनिक या अस्पताल जाएं।'
      },
      color: 'amber'
    };
  }

  // 3. Routine groups
  const routineGroups = ['g37', 'g38', 'g40', 'g27', 'g21'];
  if (routineGroups.includes(data.groupId) && severity <= 3) {
    return {
      level: 'routine',
      badge: {
        en: 'Routine Clinic Visit',
        ja: '通常・定期的な受診',
        hi: 'नियमित क्लिनिक परामर्श'
      },
      description: {
        en: 'Schedule a routine visit at your convenience during regular clinic consultation hours.',
        ja: 'ご都合の良い日時に、通常の診療時間内に受診してください。',
        hi: 'अपनी सुविधानुसार क्लिनिक के नियमित समय में डॉक्टर से परामर्श लें।'
      },
      color: 'blue'
    };
  }

  // 4. Default: Within a few days
  return {
    level: 'within_few_days',
    badge: {
      en: 'See a Doctor Within a Few Days',
      ja: '数日以内に医療機関を受診',
      hi: 'कुछ दिनों के भीतर डॉक्टर को दिखाएं'
    },
    description: {
      en: 'Your symptoms should be checked by a physician within 2 to 3 days. Seek sooner care if symptoms worsen.',
      ja: '症状が続く場合は、2〜3日以内に医療機関を受診してください。悪化した場合は早めに受診してください。',
      hi: 'लक्षणों की जांच 2-3 दिनों में डॉक्टर से कराएं। यदि समस्या बढ़े तो जल्द जाएं।'
    },
    color: 'emerald'
  };
}

/**
 * Builds Trilingual Doctor Intake Notes from pre-translated templates (No-AI)
 * Formatted exactly as required:
 * 【問診票サマリー（外国人患者）】
 * 主訴: ...
 * 発症時期: ...
 * 重症度: ...
 * 年齢層: ...
 * 服用中の薬: ...
 * アレルギー・持病: ...
 */
export function generateDoctorNotes(data: PatientIntakeData): GeneratedDoctorNote {
  const group = getGroupById(data.groupId);
  const complaintJa = group ? group.name.ja : (data.chiefComplaint || '体調不良');
  const complaintEn = group ? group.name.en : (data.chiefComplaint || 'Unspecified illness');
  const complaintHi = group ? group.name.hi : (data.chiefComplaint || 'अस्वस्थता');

  const durationJa = data.duration || '数日前から';
  const durationEn = data.duration || 'Started a few days ago';
  const durationHi = data.duration || 'कुछ दिन पहले से';

  const severityJa = `${data.severity || 5} / 10`;
  const severityEn = `${data.severity || 5} / 10`;
  const severityHi = `${data.severity || 5} / 10`;

  const ageData = normalizeAgeAndPregnancy(data.ageGroup, data.isPregnant);
  const medData = normalizeMedications(data.medications);
  const allergyData = normalizeAllergies(data.allergies);

  const noteJa = `【問診票サマリー（外国人患者）】
主訴: ${complaintJa}${data.chiefComplaint && data.chiefComplaint !== complaintJa ? `（患者自由記述: ${data.chiefComplaint}）` : ''}
発症時期: ${durationJa}
重症度: ${severityJa}
年齢層: ${ageData.ja}
服用中の薬: ${medData.ja}
アレルギー・持病: ${allergyData.ja}`;

  const noteEn = `【Medical Intake Summary (International Patient)】
Chief Complaint: ${complaintEn}${data.chiefComplaint && data.chiefComplaint !== complaintEn ? ` (Note: "${data.chiefComplaint}")` : ''}
Onset & Duration: ${durationEn}
Severity Level: ${severityEn}
Patient Profile: ${ageData.en}
Current Medications: ${medData.en}
Allergies & Conditions: ${allergyData.en}`;

  const noteHi = `【चिकित्सा परामर्श सारांश (विदेशी मरीज)】
मुख्य समस्या: ${complaintHi}
प्रारंभ: ${durationHi}
गंभीरता: ${severityHi}
आयु वर्ग: ${ageData.hi}
वर्तमान दवाएं: ${medData.hi}
एलर्जी व पुरानी बीमारियां: ${allergyData.hi}`;

  return { noteJa, noteEn, noteHi };
}
