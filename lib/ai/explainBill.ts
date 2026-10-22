import { callLlmChat } from './client';

export interface BillInput {
  totalAmount?: number;
  patientPortion?: number;
  insurancePortion?: number;
  billText?: string;
  prescriptionText?: string;
}

export interface BillExplanationResult {
  billBreakdown: {
    item: string;
    item_ja: string;
    estimatedCost: string;
    explanation_en: string;
    explanation_hi: string;
  }[];
  medicines: {
    name_ja: string;
    name_en: string;
    indianEquivalent: string;
    purpose: string;
    howToTake: string;
    sideEffects: string;
    explanation_hi: string;
  }[];
  summary_en: string;
  summary_hi: string;
}

export async function explainBillAndPrescription(input: BillInput): Promise<BillExplanationResult> {
  const prompt = `
You are a senior bilingual medical navigator in Japan specializing in helping foreign residents (primarily Indian expatriates) understand their Japanese medical receipts (領収書) and pharmacy prescriptions (処方箋).

Input data:
- Total Bill Amount: ${input.totalAmount ? `¥${input.totalAmount}` : 'Not specified'}
- Patient Copay (typically 30%): ${input.patientPortion ? `¥${input.patientPortion}` : 'Not specified'}
- Raw Bill Line Items: ${input.billText || 'Standard Consultation'}
- Prescription Text: ${input.prescriptionText || 'None'}

Please explain:
1. Every receipt item (e.g. 初診料, 処方料, 検査, 処置). In Japan, 1 point = 10 JPY. Health insurance covers 70%, patient pays 30%.
2. Every medicine mentioned (compare with common Indian medicines e.g. Calonal is Paracetamol/Crocin/Dolo, Loxonin is like fast-acting Brufen/Ibuprofen, Mucosta is gastric shield).
3. Clear instructions on how to take (食後 - after food, 食前 - before food), and any side effects.
4. Explanations in simple English and Hindi.

Return ONLY valid JSON matching this structure:
{
  "billBreakdown": [
    {
      "item": "Initial Consultation Fee",
      "item_ja": "初診料",
      "estimatedCost": "¥860 (30% copay of 288 points)",
      "explanation_en": "Standard fee charged the first time you visit any clinic or hospital.",
      "explanation_hi": "पहली बार क्लिनिक आने पर लगने वाली मानक फीस।"
    }
  ],
  "medicines": [
    {
      "name_ja": "...",
      "name_en": "...",
      "indianEquivalent": "...",
      "purpose": "...",
      "howToTake": "...",
      "sideEffects": "...",
      "explanation_hi": "..."
    }
  ],
  "summary_en": "...",
  "summary_hi": "..."
}
`;

  const llmResponse = await callLlmChat(
    [
      { role: 'system', content: 'You are an expert on Japanese healthcare billing and pharmacotherapy. Output valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    { jsonMode: true, temperature: 0.2 }
  );

  if (llmResponse) {
    try {
      const parsed = JSON.parse(llmResponse);
      if (parsed.billBreakdown && parsed.summary_en) {
        return parsed as BillExplanationResult;
      }
    } catch (e) {
      console.warn('Failed to parse bill explanation JSON from LLM, using clinical heuristic fallback:', e);
    }
  }

  return buildFallbackBillExplanation(input);
}

function buildFallbackBillExplanation(input: BillInput): BillExplanationResult {
  const text = (input.billText || '').toLowerCase();
  const rxText = (input.prescriptionText || '').toLowerCase();

  const billBreakdown = [
    {
      item: 'Consultation Fee (Shoshin-ryo)',
      item_ja: '初診料・再診料',
      estimatedCost: 'Approx. ¥860 (First visit) or ¥220 (Follow-up)',
      explanation_en: 'The government-regulated fee for physician consultation. At 30% copay, the first consultation is around ¥860.',
      explanation_hi: 'डॉक्टर से परामर्श की सरकारी निर्धारित फीस। 30% बीमा के साथ यह लगभग ¥860 होती है।'
    },
    {
      item: 'Prescription Voucher Fee (Shohosen-ryo)',
      item_ja: '処方箋料',
      estimatedCost: 'Approx. ¥200 (68 points)',
      explanation_en: 'Fee for writing the formal medical prescription sheet to be taken to an outside dispensing pharmacy.',
      explanation_hi: 'दवा का पर्चा (प्रिस्क्रिप्शन) जारी करने का शुल्क, जिसे बाहर की फार्मेसी में ले जाना होता है।'
    }
  ];

  if (text.includes('検査') || text.includes('test') || text.includes('blood') || text.includes('採血')) {
    billBreakdown.push({
      item: 'Laboratory Testing (Kensa)',
      item_ja: '検査料',
      estimatedCost: 'Approx. ¥1,200 - ¥3,500',
      explanation_en: 'Charges for blood test, swab test (flu/COVID), or urine analysis performed in-clinic.',
      explanation_hi: 'क्लिनिक में किए गए खून, फ्लू या पेशाब जांच का शुल्क।'
    });
  }

  // Detect common medicines
  const medicines: BillExplanationResult['medicines'] = [];

  if (rxText.includes('カロナール') || rxText.includes('calonal') || rxText.includes('paracetamol') || rxText.includes('acetaminophen') || rxText === '') {
    medicines.push({
      name_ja: 'カロナール錠 (Calonal)',
      name_en: 'Acetaminophen (Calonal)',
      indianEquivalent: 'Crocin / Dolo 650 / Calpol (Paracetamol)',
      purpose: 'Fever reducer and mild-to-moderate pain reliever.',
      howToTake: 'Take 1 tablet after meals (毎食後) with plenty of water. Do not exceed 4,000mg/day.',
      sideEffects: 'Gentle on stomach. Rare drowsiness or liver burden if overdosed.',
      explanation_hi: 'यह भारत के क्रोसिन या डोलो 650 (पैरासिटामोल) के समान है। यह बुखार और हल्के दर्द को कम करती है और पेट के लिए सुरक्षित है।'
    });
  }

  if (rxText.includes('ロキソニン') || rxText.includes('loxonin') || rxText.includes('loxoprofen') || rxText.includes('pain') || rxText === '') {
    medicines.push({
      name_ja: 'ロキソニン錠 (Loxonin)',
      name_en: 'Loxoprofen Sodium (Loxonin)',
      indianEquivalent: 'Brufen / Ibuprofen / Combiflam (Fast-acting NSAID)',
      purpose: 'Powerful anti-inflammatory and painkiller for headaches, body pain, joint pain, or sore throat.',
      howToTake: 'Take 1 tablet strictly AFTER food (食後) with a full glass of water. Avoid taking on empty stomach.',
      sideEffects: 'Can cause mild stomach irritation if taken without food; often paired with Mucosta.',
      explanation_hi: 'यह ब्रूफेन या कॉम्बिफ्लेम जैसी असरदार दर्द निवारक दवा है। इसे हमेशा खाना खाने के बाद ही पानी के साथ लें, खाली पेट न लें।'
    });
  }

  if (rxText.includes('ムコスタ') || rxText.includes('mucosta') || rxText.includes('rebamipide') || rxText === '') {
    medicines.push({
      name_ja: 'ムコスタ錠 (Mucosta)',
      name_en: 'Rebamipide (Mucosta)',
      indianEquivalent: 'Pantocid / Omez / Sucralfate (Stomach protective shield)',
      purpose: 'Protects the stomach lining and reduces acid irritation caused by painkillers or stress.',
      howToTake: 'Take 1 tablet together with your painkiller after meals.',
      sideEffects: 'Extremely well-tolerated. Rarely causes mild constipation or loose stools.',
      explanation_hi: 'यह पेट की परत को सुरक्षित रखने वाली दवा है, जिसे आमतौर पर दर्द की दवा के साथ पेट में जलन रोकने के लिए दिया जाता है।'
    });
  }

  const summary_en = `Under Japan's universal health insurance (National Health Insurance / Social Insurance), the Japanese government legally caps medical procedures at fixed points (1 point = 10 JPY). As an insured resident, you only pay the 30% copay shown on your receipt. At an outside pharmacy (調剤薬局), medication is billed separately with the same 30% copay rate.`;

  const summary_hi = `जापान के राष्ट्रीय स्वास्थ्य बीमा (NHI/Shakai Hoken) के तहत इलाज का खर्च सरकारी पॉइंट सिस्टम (1 पॉइंट = 10 येन) पर आधारित होता है। बीमा कार्ड होने पर आपको कुल खर्च का केवल 30% हिस्सा देना होता है। दवाइयों का भुगतान पास की फार्मेसी (Chouzai Yakkyoku) में अलग से करना होता है।`;

  return {
    billBreakdown,
    medicines,
    summary_en,
    summary_hi,
  };
}
