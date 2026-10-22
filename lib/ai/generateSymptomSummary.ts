import { callLlmChat } from './client';

export interface SymptomInput {
  mainSymptom: string;
  duration: string;
  severity: number;
  associatedSymptoms: string[];
  currentMedications?: string;
  allergies?: string;
  pastConditions?: string;
  specialRequests?: string;
}

export interface SymptomSummaryResult {
  summary_ja: string;
  summary_en: string;
  summary_hi: string;
  suggestedDepartment: string;
  urgencyLevel: 'routine' | 'soon' | 'urgent';
  questionsForDoctor: { en: string; ja: string; hi: string }[];
}

export async function generateSymptomSummary(input: SymptomInput): Promise<SymptomSummaryResult> {
  const prompt = `
You are an expert bilingual medical assistant in Japan helping foreign residents (primarily Indian expats) visit Japanese clinics.
Given the patient's symptom form, generate:
1. "summary_ja": A formal, concise Japanese medical questionnaire intake summary (問診票サマリー) ready for a Japanese receptionist or doctor to read directly on a smartphone screen. Include sections: 【主訴】, 【現病歴・重症度】, 【随伴症状】, 【現在服用中の薬】, 【アレルギー】, 【既往歴】, 【要望・備考】.
2. "summary_en": A clear patient explanation in English, including how to describe their pain, what tests to expect in Japan, and general precautions.
3. "summary_hi": A natural, reassuring Hindi summary (हिन्दी में सारांश) explaining the condition simply and what to say at the clinic.
4. "suggestedDepartment": Suggested medical specialty in Japan (e.g., 内科 (Internal Medicine), 耳鼻咽喉科 (ENT), 小児科 (Pediatrics), 皮膚科 (Dermatology)).
5. "urgencyLevel": "routine", "soon", or "urgent".
6. "questionsForDoctor": Array of 3 questions to ask the doctor, each with "en", "ja", and "hi".

Patient Details:
- Main Symptom: ${input.mainSymptom}
- Duration / Onset: ${input.duration}
- Severity (1-10): ${input.severity} / 10
- Associated Symptoms: ${input.associatedSymptoms.join(', ') || 'None reported'}
- Current Medications: ${input.currentMedications || 'None'}
- Allergies: ${input.allergies || 'No known drug allergies (なし)'}
- Past Medical History: ${input.pastConditions || 'None'}
- Special Requests: ${input.specialRequests || 'English or simple Japanese explanation requested'}

Respond ONLY with valid JSON in this exact structure:
{
  "summary_ja": "...",
  "summary_en": "...",
  "summary_hi": "...",
  "suggestedDepartment": "...",
  "urgencyLevel": "...",
  "questionsForDoctor": [{"en": "...", "ja": "...", "hi": "..."}]
}
`;

  const llmResponse = await callLlmChat(
    [
      { role: 'system', content: 'You are a Japanese healthcare intake specialist and medical translator. Output valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    { jsonMode: true, temperature: 0.2 }
  );

  if (llmResponse) {
    try {
      const parsed = JSON.parse(llmResponse);
      if (parsed.summary_ja && parsed.summary_en && parsed.summary_hi) {
        return parsed as SymptomSummaryResult;
      }
    } catch (e) {
      console.warn('Failed to parse LLM response JSON, utilizing high-grade heuristic fallback:', e);
    }
  }

  // Clinical Heuristic Engine (High-quality deterministic fallback)
  return buildClinicalFallbackSummary(input);
}

function buildClinicalFallbackSummary(input: SymptomInput): SymptomSummaryResult {
  const urgency = input.severity >= 8 ? 'urgent' : input.severity >= 5 ? 'soon' : 'routine';
  
  // Department mapping heuristic
  let department = '一般内科 (General Internal Medicine)';
  const symptomLower = input.mainSymptom.toLowerCase();
  if (symptomLower.includes('ear') || symptomLower.includes('throat') || symptomLower.includes('nose') || symptomLower.includes('sinus')) {
    department = '耳鼻咽喉科 (Otolaryngology / ENT)';
  } else if (symptomLower.includes('skin') || symptomLower.includes('rash') || symptomLower.includes('itch')) {
    department = '皮膚科 (Dermatology)';
  } else if (symptomLower.includes('stomach') || symptomLower.includes('belly') || symptomLower.includes('digest')) {
    department = '消化器内科 (Gastroenterology)';
  } else if (symptomLower.includes('child') || symptomLower.includes('baby') || symptomLower.includes('infant')) {
    department = '小児科 (Pediatrics)';
  } else if (symptomLower.includes('eye') || symptomLower.includes('vision')) {
    department = '眼科 (Ophthalmology)';
  } else if (symptomLower.includes('bone') || symptomLower.includes('joint') || symptomLower.includes('back')) {
    department = '整形外科 (Orthopedics)';
  }

  const jaMeds = input.currentMedications && input.currentMedications.trim() !== '' 
    ? input.currentMedications 
    : '特になし (None)';

  const jaAllergies = input.allergies && input.allergies.trim() !== '' 
    ? input.allergies 
    : '既知のアレルギーなし (No known drug allergies)';

  const jaPast = input.pastConditions && input.pastConditions.trim() !== '' 
    ? input.pastConditions 
    : '特記事項なし (None)';

  const summary_ja = `【問診票サマリー（外国人患者）】
■ 主訴：${input.mainSymptom}
■ 現病歴・発症：${input.duration}頃から発症。症状の強さは10段階中【${input.severity}】。
■ 随伴症状：${input.associatedSymptoms.length > 0 ? input.associatedSymptoms.join('、') : '特になし'}
■ 現在服用中の薬：${jaMeds}
■ アレルギー：${jaAllergies}
■ 既往歴：${jaPast}
■ 配慮事項・要望：日本語が不慣れなため、英語またはやさしい日本語でのご対応をお願い申し上げます。${input.specialRequests ? `（特記事項：${input.specialRequests}）` : ''}`;

  const summary_en = `**Your Symptom Summary:**
You are experiencing **${input.mainSymptom}** (Severity: ${input.severity}/10) starting around **${input.duration}**. 
Associated symptoms noted: ${input.associatedSymptoms.join(', ') || 'None'}.

**What to expect at the clinic:**
1. Show the Japanese card on your phone to the receptionist when you submit your Health Insurance Card (健康保険証 / My Number).
2. The physician will likely perform a physical check and may check your throat, chest, or temperature.
3. Bring your medication wrapper if you have taken ${input.currentMedications || 'any medicines'}.`;

  const summary_hi = `**आपके लक्षणों का सारांश (हिन्दी में):**
आपको **${input.mainSymptom}** की समस्या है (तीव्रता: ${input.severity}/10), जो **${input.duration}** से शुरू हुई है।
साथ में महसूस होने वाले लक्षण: ${input.associatedSymptoms.join(', ') || 'कुछ विशेष नहीं'}।

**जापान के क्लिनिक में क्या करें:**
1. काउंटर पर अपना हेल्थ इंश्योरेंस कार्ड (Hokensho) देते समय इस ऐप का 'जापानी डॉक्टर नोट' दिखाएं।
2. डॉक्टर जांच करेंगे। यदि आपने ${input.currentMedications || 'कोई दवा'} ली है, तो उसका नाम या पैकेट साथ रखें।
3. घबराएं नहीं, अधिकांश जापानी डॉक्टर आपकी सहायता के लिए अनुवाद ऐप या सरल अंग्रेजी का उपयोग करते हैं।`;

  const questionsForDoctor = [
    {
      en: 'What is the most likely cause of these symptoms?',
      ja: 'この症状の主な原因は何が考えられますか？',
      hi: 'इन लक्षणों का मुख्य कारण क्या हो सकता है?'
    },
    {
      en: 'Are there any dietary or activity restrictions I should follow?',
      ja: '食事や日常生活で控えるべきことはありますか？',
      hi: 'क्या मुझे खान-पान या काम में कोई परहेज रखना चाहिए?'
    },
    {
      en: 'If symptoms do not improve within 3 days, should I return?',
      ja: '3日ほど経っても改善しない場合、再受診すべきでしょうか？',
      hi: 'अगर 3 दिन में आराम न मिले, तो क्या दोबारा आना चाहिए?'
    }
  ];

  return {
    summary_ja,
    summary_en,
    summary_hi,
    suggestedDepartment: department,
    urgencyLevel: urgency,
    questionsForDoctor,
  };
}
