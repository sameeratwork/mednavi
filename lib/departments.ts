/**
 * Validated Medical Departments from MedNavi MHLW Clinic Data
 * Exactly matches departments present in data/seeded_clinics_cache.json and Clinic.departments schema.
 */

export interface DepartmentInfo {
  ja: string;
  en: string;
  keywords: string[];
}

// Specific departments are listed first so specific symptoms (e.g. pediatric, ear, skin)
// match before general internal medicine.
export const VALID_DEPARTMENTS: DepartmentInfo[] = [
  {
    ja: '小児科',
    en: 'Pediatrics',
    keywords: ['pediatric', 'pediatrics', 'child', 'children', 'baby', 'infant', 'toddler', 'kid', 'kids', '小児科', '子供', '乳児']
  },
  {
    ja: '産婦人科',
    en: 'Obstetrics & Gynecology',
    keywords: ['gynecology', 'obstetrics', 'pregnancy', 'pregnant', 'menstrual', 'period', 'ovary', 'uterus', 'vaginal', '産婦人科', '婦人科', '妊娠', '生理']
  },
  {
    ja: '耳鼻いんこう科',
    en: 'Otolaryngology / ENT',
    keywords: ['ent', 'ear', 'nose', 'throat', 'sinus', 'tonsil', 'hearing', 'tinnitus', 'nasal', 'otolaryngology', '耳鼻', '咽喉', '鼻水', '耳鳴り']
  },
  {
    ja: '皮膚科',
    en: 'Dermatology',
    keywords: ['skin', 'rash', 'itch', 'itching', 'eczema', 'acne', 'hives', 'blister', 'dermatology', '皮膚', '発疹', 'かゆみ']
  },
  {
    ja: '眼科',
    en: 'Ophthalmology',
    keywords: ['eye', 'eyes', 'vision', 'sight', 'eyeball', 'red eye', 'itchy eye', 'conjunctivitis', 'ophthalmology', '眼科', '目の痛み', '充血']
  },
  {
    ja: '整形外科',
    en: 'Orthopedics',
    keywords: ['orthopedics', 'bone', 'joint', 'joints', 'muscle', 'sprain', 'fracture', 'back pain', 'knee', 'shoulder', 'spine', '整形外科', '関節', '骨折', '腰痛']
  },
  {
    ja: '消化器内科',
    en: 'Gastroenterology',
    keywords: ['gastroenterology', 'stomach', 'belly', 'abdomen', 'digestive', 'nausea', 'vomit', 'vomiting', 'diarrhea', 'bowel', 'gastric', 'cramp', '消化器', '胃腸', '下痢', '腹痛']
  },
  {
    ja: '呼吸器内科',
    en: 'Respiratory / Pulmonology',
    keywords: ['pulmonology', 'cough', 'coughing', 'wheezing', 'lung', 'lungs', 'bronchitis', 'phlegm', 'respiratory', '呼吸器', '咳', '痰']
  },
  {
    ja: '循環器内科',
    en: 'Cardiology',
    keywords: ['cardiology', 'heart', 'palpitation', 'palpitations', 'blood pressure', 'hypertension', 'arrhythmia', 'pulse', '循環器', '動悸', '高血圧']
  },
  {
    ja: '泌尿器科',
    en: 'Urology',
    keywords: ['urology', 'urinary', 'urine', 'bladder', 'kidney', 'urination', 'prostate', '泌尿器', '排尿', '血尿']
  },
  {
    ja: '心療内科',
    en: 'Psychosomatic Medicine',
    keywords: ['psychosomatic', 'stress', 'anxiety', 'insomnia', 'sleep', 'panic', 'mental', '心療内科', '不眠', 'ストレス']
  },
  {
    ja: '精神科',
    en: 'Psychiatry',
    keywords: ['psychiatry', 'depression', 'mood', 'mental health', 'hallucination', '精神科', 'うつ']
  },
  {
    ja: 'アレルギー科',
    en: 'Allergology',
    keywords: ['allergology', 'allergy', 'allergies', 'hay fever', 'pollen', 'allergic', 'food allergy', 'アレルギー', '花粉症']
  },
  {
    ja: '脳神経内科',
    en: 'Neurology',
    keywords: ['neurology', 'headache', 'migraine', 'dizziness', 'tremor', 'numbness', 'nerve', '神経内科', '脳神経内科', '頭痛', 'めまい', 'しびれ']
  },
  {
    ja: '脳神経外科',
    en: 'Neurosurgery',
    keywords: ['neurosurgery', 'head injury', 'trauma', 'concussion', 'brain', '脳神経外科']
  },
  {
    ja: '外科',
    en: 'General Surgery',
    keywords: ['surgery', 'wound', 'cut', 'burn', 'laceration', 'trauma', 'abscess', 'surgical', '外科', '外傷', '切り傷']
  },
  {
    ja: '形成外科',
    en: 'Plastic Surgery',
    keywords: ['plastic surgery', 'scar', 'skin wound', 'stitch', 'reconstructive', '形成外科']
  },
  {
    ja: '歯科',
    en: 'Dentistry',
    keywords: ['dentistry', 'tooth', 'teeth', 'dental', 'gum', 'gums', 'toothache', 'jaw', 'molar', 'cavity', '歯科', '歯痛', '虫歯']
  },
  {
    ja: '救急科',
    en: 'Emergency Medicine',
    keywords: ['emergency medicine', 'emergency', 'acute trauma', 'urgent care', '救急科', '救急医療']
  },
  {
    ja: '内科',
    en: 'Internal Medicine',
    keywords: ['internal medicine', 'general', 'fever', 'cold', 'flu', 'fatigue', 'infection', 'shivering', 'malaise', '内科', '発熱', '風邪']
  }
];

/**
 * Validates any department string against the clinic dataset's valid departments.
 * Returns a standardized formatted label: e.g. "内科 (Internal Medicine)"
 */
export function validateDepartment(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') {
    return '内科 (Internal Medicine)';
  }

  let clean = raw.trim().toLowerCase();

  // Strip negations so "not pregnant" doesn't falsely match Obstetrics
  clean = clean.replace(/\b(not|no|never|isn't|is not)\s+(pregnant|pregnancy)\b/g, 'not_pregnant');
  clean = clean.replace(/\b(no|not|none)\s+(allergies|allergy)\b/g, 'no_allergies');

  // 1. Direct exact or substring matches
  for (const dept of VALID_DEPARTMENTS) {
    const jaLower = dept.ja.toLowerCase();
    const enLower = dept.en.toLowerCase();
    if (
      clean === jaLower ||
      clean === enLower ||
      clean.includes(jaLower) ||
      clean.includes(enLower) ||
      enLower.split(/[\s,/()]+/).some((token) => token.length > 2 && token === clean)
    ) {
      return `${dept.ja} (${dept.en})`;
    }
  }

  // 2. Keyword matching with priority order
  for (const dept of VALID_DEPARTMENTS) {
    for (const kw of dept.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        return `${dept.ja} (${dept.en})`;
      }
    }
  }

  // Default fallback if no match found
  return '内科 (Internal Medicine)';
}

/**
 * Extracts the Japanese department name for DB querying
 * e.g. "内科 (Internal Medicine)" -> "内科"
 */
export function getJapaneseDepartmentName(dept: string): string {
  if (!dept) return '内科';
  const found = VALID_DEPARTMENTS.find(
    (d) => dept.includes(d.ja) || dept.toLowerCase().includes(d.en.toLowerCase())
  );
  if (found) return found.ja;
  return dept.split(/[\s(（]/)[0].trim() || '内科';
}

/**
 * Tokyo wards that exist in the clinic data
 */
export const TOKYO_WARDS = [
  { ja: 'all', en: 'All Tokyo Wards (東京都全域)' },
  { ja: '世田谷区', en: 'Setagaya (世田谷区)' },
  { ja: '港区', en: 'Minato (港区)' },
  { ja: '中央区', en: 'Chuo (中央区)' },
  { ja: '新宿区', en: 'Shinjuku (新宿区)' },
  { ja: '大田区', en: 'Ota (大田区)' },
  { ja: '渋谷区', en: 'Shibuya (渋谷区)' },
  { ja: '練馬区', en: 'Nerima (練馬区)' },
  { ja: '杉並区', en: 'Suginami (杉並区)' },
  { ja: '足立区', en: 'Adachi (足立区)' },
  { ja: '江戸川区', en: 'Edogawa (江戸川区)' },
  { ja: '千代田区', en: 'Chiyoda (千代田区)' },
  { ja: '豊島区', en: 'Toshima (豊島区)' },
  { ja: '品川区', en: 'Shinagawa (品川区)' },
  { ja: '江東区', en: 'Koto (江東区)' },
  { ja: '板橋区', en: 'Itabashi (板橋区)' },
  { ja: '目黒区', en: 'Meguro (目黒区)' },
  { ja: '葛飾区', en: 'Katsushika (葛飾区)' },
  { ja: '中野区', en: 'Nakano (中野区)' },
  { ja: '文京区', en: 'Bunkyo (文京区)' },
  { ja: '台東区', en: 'Taito (台東区)' },
  { ja: '北区', en: 'Kita (北区)' },
  { ja: '墨田区', en: 'Sumida (墨田区)' },
  { ja: '荒川区', en: 'Arakawa (荒川区)' },
];
