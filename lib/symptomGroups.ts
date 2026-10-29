/**
 * Canonical 40 Symptom Groups for MedNavi Symptom Chatbot
 *
 * Rules:
 * - conditionsAndProblems are used ONLY as matching keywords, NEVER shown as a diagnosis.
 * - questions[] is kept empty for now (user supplied in later phase).
 * - reviewed: false
 * - Group 41 is the Gemini fallback in Phase 3.
 */

import { matchesKeyword } from './departments';
import { GROUP_QUESTIONS, GroupQuestion, QuestionOption, Ml } from './symptomQuestions';

export interface MultilingualText {
  en: string;
  ja: string;
  hi: string;
}

export interface SymptomCategory {
  id: string;
  name: MultilingualText;
  iconName: string;
  description: MultilingualText;
}

export interface SymptomGroup {
  id: string;
  category: string;
  name: MultilingualText;
  conditionsAndProblems: string[];
  keywords: {
    en: string[];
    ja: string[];
    hi: string[];
  };
  primaryDept: string;
  backupDept?: string;
  redFlags: string[];
  questions: GroupQuestion[];
  reviewed: false;
}

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'general',
    name: {
      en: 'General & Whole Body',
      ja: '全身・全身症状',
      hi: 'सामान्य एवं संपूर्ण शरीर'
    },
    iconName: 'Activity',
    description: {
      en: 'Fever, fatigue, wellness checkups, medical certificates',
      ja: '発熱、だるさ、健康診断、診断書作成',
      hi: 'बुखार, थकान, स्वास्थ्य जांच, मेडिकल सर्टिफिकेट'
    }
  },
  {
    id: 'respiratory',
    name: {
      en: 'Lungs & Breathing',
      ja: '呼吸器・肺・のど',
      hi: 'श्वसन एवं फेफड़े'
    },
    iconName: 'Wind',
    description: {
      en: 'Cough, wheezing, breathing difficulty, snoring, sleep apnea',
      ja: '咳、喘鳴、息苦しさ、いびき、無呼吸',
      hi: 'खांसी, सांस फूलना, खर्राटे, स्लीप एप्निया'
    }
  },
  {
    id: 'heart',
    name: {
      en: 'Heart & Blood Vessels',
      ja: '心臓・血管・血圧',
      hi: 'हृदय एवं रक्त वाहिकाएं'
    },
    iconName: 'HeartPulse',
    description: {
      en: 'Chest pressure, palpitations, high blood pressure, leg swelling, varicose veins',
      ja: '胸の圧迫感、動悸、高血圧、足のむくみ、静脈瘤',
      hi: 'सीने में दबाव, दिल की धड़कन, उच्च रक्तचाप, पैरों की सूजन'
    }
  },
  {
    id: 'digestive',
    name: {
      en: 'Stomach & Digestion',
      ja: '胃・お腹・おしり',
      hi: 'पेट एवं पाचन'
    },
    iconName: 'Utensils',
    description: {
      en: 'Stomach pain, nausea, diarrhea, acid reflux, piles, rectal issues',
      ja: '胃痛、腹痛、吐き気、下痢、胃もたれ、痔、肛門トラブル',
      hi: 'पेट दर्द, उल्टी, दस्त, एसिडिटी, बवासीर'
    }
  },
  {
    id: 'urinary',
    name: {
      en: 'Kidney & Bladder',
      ja: '腎臓・膀胱・おしっこ',
      hi: 'गुर्दे एवं मूत्राशय'
    },
    iconName: 'Droplet',
    description: {
      en: 'Painful urination, frequent urination, blood in urine, kidney swelling',
      ja: '排尿時の痛み、頻尿、血尿、腎機能、むくみ',
      hi: 'पेशाब में दर्द, बार-बार पेशाब, खून, किडनी समस्या'
    }
  },
  {
    id: 'reproductive',
    name: {
      en: 'Sexual & Reproductive Health',
      ja: '婦人科・産科・男性泌尿器・性感染症',
      hi: 'प्रजनन एवं यौन स्वास्थ्य'
    },
    iconName: 'Users',
    description: {
      en: 'Periods, pregnancy, contraception, STI testing, prostate, men’s health',
      ja: '月経、妊娠、避妊ピル、性病検査、前立腺、男性更年期',
      hi: 'मासिक धर्म, गर्भावस्था, गर्भनिरोधक, एसटीआई परीक्षण, पुरुषों का स्वास्थ्य'
    }
  },
  {
    id: 'children',
    name: {
      en: 'Babies & Children',
      ja: '小児・乳幼児',
      hi: 'शिशु एवं बाल स्वास्थ्य'
    },
    iconName: 'Baby',
    description: {
      en: 'Child illnesses, high fever in infants, vaccinations, infant milestones',
      ja: '子どもの病気、乳幼児の発熱、定期予防接種、乳幼児健診',
      hi: 'बच्चों की बीमारियां, शिशु बुखार, टीकाकरण, बाल विकास'
    }
  },
  {
    id: 'neurology_mental',
    name: {
      en: 'Brain, Nerves & Mental Well-being',
      ja: '頭・神経・こころ・睡眠',
      hi: 'मस्तिष्क, तंत्रिका एवं मानसिक स्वास्थ्य'
    },
    iconName: 'Brain',
    description: {
      en: 'Headache, dizziness, numbness, memory, depression, anxiety, addiction',
      ja: '頭痛、めまい、しびれ、物忘れ、うつ、不安、依存症相談',
      hi: 'सिरदर्द, चक्कर, सुन्न पड़ना, याददाश्त, तनाव, डिप्रेशन'
    }
  },
  {
    id: 'endocrine_blood',
    name: {
      en: 'Hormones, Blood & Immune',
      ja: '糖尿病・甲状腺・血液・がん',
      hi: 'हार्मोन, रक्त एवं प्रतिरक्षा'
    },
    iconName: 'Flame',
    description: {
      en: 'Diabetes, thyroid problems, anemia, unusual bruising, cancer care',
      ja: '糖尿病、甲状腺の異常、貧血、あざ、がん治療・セカンドオピニオン',
      hi: 'डायबिटीज, थायरॉयड, एनीमिया, नील पड़ना, कैंसर परामर्श'
    }
  },
  {
    id: 'skin_aesthetic',
    name: {
      en: 'Skin, Hair & Cosmetic',
      ja: '皮膚・髪・傷跡・乳房',
      hi: 'त्वचा, बाल एवं सौंदर्य'
    },
    iconName: 'Sparkles',
    description: {
      en: 'Rashes, itch, acne, hair loss, scars, moles, breast lumps or pain',
      ja: '湿疹、かゆみ、ニキビ、脱毛、傷跡、ほくろ、乳房のしこり・痛み',
      hi: 'दाने, खुजली, मुंहासे, बाल झड़ना, घाव के निशान, स्तन में गांठ'
    }
  },
  {
    id: 'musculoskeletal',
    name: {
      en: 'Bones, Joints & Physical Injuries',
      ja: '骨・関節・筋肉・ケガ・慢性痛',
      hi: 'हड्डियां, जोड़, चोट एवं दर्द'
    },
    iconName: 'Crosshair',
    description: {
      en: 'Back pain, sprains, fractures, cuts, burns, chronic pain, rehabilitation',
      ja: '腰痛、捻挫、骨折、切り傷、やけど、慢性的な痛み、リハビリ',
      hi: 'कमर दर्द, मोच, फ्रैक्चर, घाव, पुराना दर्द, फिजियोथेरेपी'
    }
  },
  {
    id: 'ent_eyes',
    name: {
      en: 'Eyes, Ears, Nose & Throat',
      ja: '目・耳・鼻・のど・アレルギー',
      hi: 'आंख, कान, नाक, गला एवं एलर्जी'
    },
    iconName: 'Eye',
    description: {
      en: 'Vision changes, red eyes, hearing, earache, sinusitis, hay fever',
      ja: '目の充血、視力低下、難聴、耳の痛み、副鼻腔炎、花粉症',
      hi: 'आंखों की समस्या, कान दर्द, साइनस, परागज ज्वर (हे फीवर)'
    }
  },
  {
    id: 'dental_preventive',
    name: {
      en: 'Teeth, Travel & Prescriptions',
      ja: '歯・渡航感染症・処方せん',
      hi: 'दांत, यात्रा एवं दवा पर्ची'
    },
    iconName: 'ShieldCheck',
    description: {
      en: 'Toothache, dental cleanings, travel vaccines, prescription renewals',
      ja: '虫歯、歯痛、定期検診、渡航前予防接種、処方せんの継続処方',
      hi: 'दांत दर्द, मसूड़े, यात्रा टीके, नियमित दवा पर्ची'
    }
  }
];

export const SYMPTOM_GROUPS: SymptomGroup[] = [
  // 1 Fever, cold and flu -> 内科
  {
    id: 'g01',
    category: 'general',
    name: {
      en: 'Fever, cold and flu',
      ja: '発熱・かぜ・インフルエンザ',
      hi: 'बुखार, सर्दी और इन्फ्लूएंजा'
    },
    conditionsAndProblems: [
      'common cold', 'influenza', 'high fever', 'chills', 'viral syndrome',
      'body aches with fever', 'shivering', 'acute febrile illness', 'upper respiratory infection'
    ],
    keywords: {
      en: ['fever', 'feever', 'high temperature', 'cold', 'flu', 'influenza', 'chills', 'shivering', 'body ache', 'feverish'],
      ja: ['発熱', '熱', '高熱', '風邪', 'かぜ', 'インフルエンザ', 'インフル', '悪寒', '寒気', '熱っぽい'],
      hi: ['बुखार', 'तेज बुखार', 'सर्दी', 'जुकाम', 'कंपकंपी', 'फ्लू', 'ठंड लगना', 'बदन दर्द']
    },
    primaryDept: '内科',
    redFlags: [
      'Temperature above 40°C with severe confusion or lethargy',
      'Inability to drink fluids for over 24 hours',
      'Difficulty breathing or rapid shallow breaths',
      'Stiff neck accompanied by sensitivity to bright light'
    ],
    questions: [],
    reviewed: false
  },

  // 2 Cough and breathing -> 呼吸器内科 / 内科
  {
    id: 'g02',
    category: 'respiratory',
    name: {
      en: 'Cough and breathing',
      ja: '咳・息苦しさ・気管支の症状',
      hi: 'खांसी और सांस की तकलीफ'
    },
    conditionsAndProblems: [
      'bronchitis', 'asthma exacerbation', 'persistent cough', 'wheezing',
      'phlegm production', 'shortness of breath on exertion', 'post-infectious cough', 'reactive airway disease'
    ],
    keywords: {
      en: ['cough', 'coughing', 'caugh', 'wheezing', 'phlegm', 'sputum', 'bronchitis', 'asthma', 'breathing problem', 'short of breath'],
      ja: ['咳', 'せき', '痰', 'たん', '喘息', 'ぜんそく', 'ヒューヒュー', '息苦しい', '呼吸困難', '気管支炎'],
      hi: ['खांसी', 'कफ', 'बलगम', 'दमा', 'अस्थमा', 'सांस फूलना', 'घरघराहट']
    },
    primaryDept: '呼吸器内科',
    backupDept: '内科',
    redFlags: [
      'Struggling to speak in full sentences due to lack of air',
      'Blue or pale lips, tongue, or fingertips',
      'Coughing up fresh red blood or blood clots',
      'Sudden sharp chest pain on breathing in'
    ],
    questions: [],
    reviewed: false
  },

  // 3 Heart, chest and blood pressure -> 循環器内科
  {
    id: 'g03',
    category: 'heart',
    name: {
      en: 'Heart, chest and blood pressure',
      ja: '心臓・胸痛・動悸・血圧の異常',
      hi: 'दिल, सीने का दर्द और रक्तचाप'
    },
    conditionsAndProblems: [
      'hypertension', 'angina', 'arrhythmia', 'palpitations',
      'tachycardia', 'bradycardia', 'high blood pressure check', 'heart flutter'
    ],
    keywords: {
      en: ['heart', 'chest pain', 'palpitation', 'palpitations', 'arrhythmia', 'blood pressure', 'hypertension', 'fast pulse', 'fluttering'],
      ja: ['胸の痛み', '胸痛', '動悸', '不整脈', '高血圧', '血圧', '脈が飛ぶ', '脈が速い', '心臓'],
      hi: ['दिल', 'सीने में दर्द', 'धड़कन तेज होना', 'उच्च रक्तचाप', 'बीपी', 'अनियमित धड़कन']
    },
    primaryDept: '循環器内科',
    redFlags: [
      'Crushing central chest tightness radiating to the jaw, neck, or left arm',
      'Chest pain accompanied by cold sweating, nausea, or dizziness',
      'Sudden loss of consciousness or fainting spell',
      'Extremely high blood pressure reading accompanied by severe headache'
    ],
    questions: [],
    reviewed: false
  },

  // 4 Leg swelling, varicose veins, circulation -> 心臓血管外科 / 循環器内科
  {
    id: 'g04',
    category: 'heart',
    name: {
      en: 'Leg swelling, varicose veins, circulation',
      ja: '足のむくみ・下肢静脈瘤・血行不良',
      hi: 'पैरों में सूजन, वेरिकोज वेन्स और रक्त संचार'
    },
    conditionsAndProblems: [
      'varicose veins', 'peripheral vascular disease', 'chronic venous insufficiency',
      'leg edema', 'spider veins', 'deep vein thrombosis suspicion', 'cold extremities'
    ],
    keywords: {
      en: ['leg swelling', 'swollen ankles', 'varicose veins', 'spider veins', 'circulation', 'calf pain', 'heavy legs', 'venous'],
      ja: ['足のむくみ', '下肢静脈瘤', '静脈瘤', '足が重い', '足のだるさ', 'ふくらはぎの腫れ', '血行不良'],
      hi: ['पैरों में सूजन', 'टखने की सूजन', 'वेरिकोज वेन्स', 'पैरों में भारीपन', 'नसों का फूलना']
    },
    primaryDept: '心臓血管外科',
    backupDept: '循環器内科',
    redFlags: [
      'Sudden painful swelling in only one leg with warmth and redness',
      'Leg swelling combined with sudden shortness of breath or chest pain',
      'Open non-healing dark ulcers or blackening skin on the foot or toes'
    ],
    questions: [],
    reviewed: false
  },

  // 5 Stomach and digestion -> 消化器内科
  {
    id: 'g05',
    category: 'digestive',
    name: {
      en: 'Stomach and digestion',
      ja: '胃痛・腹痛・消化器・下痢・吐き気',
      hi: 'पेट, पाचन, उल्टी और दस्त'
    },
    conditionsAndProblems: [
      'gastritis', 'gastroenteritis', 'acid reflux', 'GERD', 'peptic ulcer',
      'irritable bowel syndrome', 'abdominal cramps', 'food poisoning', 'nausea and vomiting'
    ],
    keywords: {
      en: ['stomach', 'stomache', 'belly ache', 'abdominal pain', 'nausea', 'vomit', 'vomiting', 'diarrhea', 'diarrhoea', 'acid reflux', 'heartburn', 'cramps'],
      ja: ['胃痛', '腹痛', 'お腹が痛い', '吐き気', '嘔吐', '下痢', '胃もたれ', '逆流性食道炎', '胸焼け', '胃腸炎'],
      hi: ['पेट दर्द', 'उल्टी', 'मतली', 'दस्त', 'पेट में मरोड़', 'एसिडिटी', 'खट्टी डकार']
    },
    primaryDept: '消化器内科',
    redFlags: [
      'Vomiting blood or coffee-ground material',
      'Black tarry stools (melena) or large amounts of dark blood in stool',
      'Severe rigid, board-like abdominal tenderness unbearable to touch',
      'Severe pain migrating specifically to the lower right abdomen'
    ],
    questions: [],
    reviewed: false
  },

  // 6 Piles, anal and rectal problems -> 肛門外科 / 消化器内科
  {
    id: 'g06',
    category: 'digestive',
    name: {
      en: 'Piles, anal and rectal problems',
      ja: '痔・肛門の痛み・直腸の出血',
      hi: 'बवासीर, गुदा का दर्द और मलाशय की समस्याएं'
    },
    conditionsAndProblems: [
      'internal hemorrhoids', 'external hemorrhoids', 'anal fissure',
      'perianal abscess', 'proctalgia', 'rectal prolapse', 'anal itching'
    ],
    keywords: {
      en: ['piles', 'pile', 'hemorrhoids', 'haemorrhoids', 'anal pain', 'anus', 'rectum', 'rectal bleeding', 'anal itching', 'blood on toilet paper'],
      ja: ['痔', 'じ', 'いぼ痔', '切れ痔', '肛門の痛み', '肛門', 'お尻の痛み', '便器が血で染まる', '肛門出血'],
      hi: ['बवासीर', 'हेमोराइड्स', 'गुदा में दर्द', 'शौच के समय खून', 'गुदा में खुजली']
    },
    primaryDept: '肛門外科',
    backupDept: '消化器内科',
    redFlags: [
      'Unstoppable pulsing blood flow from the rectum',
      'Fever accompanied by intense throbbing pain and swelling around the anus',
      'Inability to pass stool or gas accompanied by severe abdominal distension'
    ],
    questions: [],
    reviewed: false
  },

  // 7 Kidney, swelling, dialysis -> 腎臓内科
  {
    id: 'g07',
    category: 'urinary',
    name: {
      en: 'Kidney, swelling, dialysis',
      ja: '腎臓病・全身のむくみ・蛋白尿・透析',
      hi: 'गुर्दा रोग, पूरे शरीर की सूजन और डायलिसिस'
    },
    conditionsAndProblems: [
      'chronic kidney disease', 'proteinuria', 'nephritis', 'renal insufficiency',
      'generalized edema', 'creatinine elevation', 'dialysis management'
    ],
    keywords: {
      en: ['kidney', 'kidneys', 'renal', 'protein in urine', 'creatinine', 'dialysis', 'facial swelling', 'foamy urine', 'generalized edema'],
      ja: ['腎臓', '腎臓内科', '蛋白尿', '尿蛋白', 'クレアチニン', '人工透析', '透析', '顔のむくみ', '泡立つ尿'],
      hi: ['गुर्दा', 'किडनी', 'डायलिसिस', 'पेशाब में झाग', 'चेहरे पर सूजन', 'नेफ्राइटिस']
    },
    primaryDept: '腎臓内科',
    redFlags: [
      'Complete cessation of urine output for more than 12 hours',
      'Severe generalized facial and leg swelling with sudden breathlessness',
      'Confusion and extreme nausea with known severe kidney disease'
    ],
    questions: [],
    reviewed: false
  },

  // 8 Urinary and bladder -> 泌尿器科
  {
    id: 'g08',
    category: 'urinary',
    name: {
      en: 'Urinary and bladder',
      ja: '膀胱炎・排尿痛・頻尿・血尿',
      hi: 'मूत्राशय, पेशाब में जलन और मूत्र संक्रमण'
    },
    conditionsAndProblems: [
      'cystitis', 'urinary tract infection', 'UTI', 'dysuria',
      'pollakiuria', 'hematuria', 'overactive bladder', 'urinary incontinence'
    ],
    keywords: {
      en: ['uti', 'cystitis', 'urinary', 'urine', 'bladder', 'burning urination', 'painful urination', 'pee hurts', 'frequent peeing', 'blood in urine'],
      ja: ['膀胱炎', '排尿痛', 'おしっこが痛い', '頻尿', '血尿', '残尿感', 'トイレが近い', '尿もれ'],
      hi: ['पेशाब में जलन', 'पेशाब में दर्द', 'बार-बार पेशाब आना', 'यूटीआई', 'पेशाब में खून', 'मूत्राशय']
    },
    primaryDept: '泌尿器科',
    redFlags: [
      'High spiking fever and severe chills with flank/lower back pain (kidney infection)',
      'Total inability to pass urine despite a painful, full bladder',
      'Visible thick red blood or dark clots passed in urine'
    ],
    questions: [],
    reviewed: false
  },

  // 9 Men's health -> 泌尿器科
  {
    id: 'g09',
    category: 'reproductive',
    name: {
      en: 'Men\'s health',
      ja: '男性の前立腺・精巣・男性更年期',
      hi: 'पुरुष स्वास्थ्य, प्रोस्टेट और वृषण'
    },
    conditionsAndProblems: [
      'benign prostatic hyperplasia', 'prostatitis', 'erectile dysfunction',
      'testicular pain', 'scrotal swelling', 'male hypogonadism', 'andropause'
    ],
    keywords: {
      en: ['mens health', 'prostate', 'testicle', 'testicular', 'scrotum', 'erectile', 'weak stream', 'bph', 'andropause'],
      ja: ['前立腺', '精巣', '睾丸', '陰嚢の腫れ', '勃起障害', '男性更年期', '尿の勢いが弱い', 'ED'],
      hi: ['पुरुष स्वास्थ्य', 'प्रोस्टेट', 'अंडकोष', 'वृषण में दर्द', 'पेशाब की धार कमजोर होना']
    },
    primaryDept: '泌尿器科',
    redFlags: [
      'Sudden, agonizing, sharp pain and swelling in one testicle (possible torsion)',
      'High fever with intense perineal pain and urinary retention'
    ],
    questions: [],
    reviewed: false
  },

  // 10 STI testing and sexual health -> 泌尿器科 / 婦人科 / 感染症内科
  {
    id: 'g10',
    category: 'reproductive',
    name: {
      en: 'STI testing and sexual health',
      ja: '性感染症（STI）検査・性器の症状',
      hi: 'यौन संचारित रोग (एसटीआई) जांच एवं लक्षण'
    },
    conditionsAndProblems: [
      'chlamydia', 'gonorrhea', 'syphilis', 'genital herpes',
      'condyloma', 'urethral discharge', 'genital ulcers', 'STI screening'
    ],
    keywords: {
      en: ['sti', 'std', 'chlamydia', 'gonorrhea', 'syphilis', 'herpes', 'genital discharge', 'penile discharge', 'genital sores', 'sexual health test'],
      ja: ['性病', '性感染症', 'クラミジア', '淋病', '梅毒', '性器ヘルペス', '尿道からの分泌物', '陰部の水ぶくれ', '性病検査'],
      hi: ['एसटीआई', 'एसटीडी', 'गुप्त रोग', 'यौन रोग जांच', 'सिफलिस', 'गोनोरिया', 'जननांग में छाले']
    },
    primaryDept: '泌尿器科',
    backupDept: '婦人科',
    redFlags: [
      'Sudden severe lower abdominal pain with fever after intercourse',
      'Painless ulcer followed by rapid whole-body rash and high fever'
    ],
    questions: [],
    reviewed: false
  },

  // 11 Pregnancy and childbirth -> 産科 (alias 産婦人科)
  {
    id: 'g11',
    category: 'reproductive',
    name: {
      en: 'Pregnancy and childbirth',
      ja: '妊娠・出産・つわり・産前産後ケア',
      hi: 'गर्भावस्था, प्रसव एवं मातृत्व'
    },
    conditionsAndProblems: [
      'pregnancy confirmation', 'hyperemesis gravidarum', 'morning sickness',
      'prenatal checkup', 'threatened miscarriage', 'postpartum care', 'fetal movement check'
    ],
    keywords: {
      en: ['pregnancy', 'pregnant', 'morning sickness', 'prenatal', 'expecting', 'labor pain', 'contractions', 'miscarriage concern', 'postpartum'],
      ja: ['妊娠', '妊婦', '妊娠検査', 'つわり', '悪阻', '陣痛', '切迫早産', '産科', '産前健診', '産後ケア'],
      hi: ['गर्भावस्था', 'गर्भवती', 'मॉर्निंग सिकनेस', 'प्रसव पूर्व जांच', 'प्रसव पीड़ा', 'डिलीवरी']
    },
    primaryDept: '産科',
    backupDept: '婦人科',
    redFlags: [
      'Bright red vaginal bleeding at any stage of pregnancy',
      'Sudden severe abdominal or shoulder-tip pain in early pregnancy',
      'Severe continuous headache, visual blurring, and sudden swelling (preeclampsia)',
      'Noticeable sudden reduction or cessation of baby movements in late pregnancy'
    ],
    questions: [],
    reviewed: false
  },

  // 12 Periods, menopause, contraception, fertility -> 婦人科 (alias 産婦人科)
  {
    id: 'g12',
    category: 'reproductive',
    name: {
      en: 'Periods, menopause, contraception, fertility',
      ja: '月経不順・生理痛・更年期・避妊・不妊相談',
      hi: 'मासिक धर्म, रजोनिवृत्ति, गर्भनिरोधक और प्रजनन'
    },
    conditionsAndProblems: [
      'dysmenorrhea', 'irregular menstruation', 'menopause syndrome', 'hot flashes',
      'contraceptive pill', 'morning-after pill', 'infertility counseling', 'endometriosis', 'uterine fibroids'
    ],
    keywords: {
      en: ['period pain', 'menstrual cramps', 'irregular periods', 'heavy bleeding', 'menopause', 'hot flushes', 'hot flashes', 'birth control', 'morning after pill', 'fertility'],
      ja: ['生理痛', '月経不順', '不正出血', '更年期障害', 'ホットフラッシュ', '低用量ピル', '緊急避妊薬', 'アフターピル', '不妊症', '子宮内膜症'],
      hi: ['मासिक धर्म दर्द', 'अनियमित पीरियड्स', 'रजोनिवृत्ति', 'गर्भनिरोधक गोली', 'प्रजनन परामर्श', 'भारी रक्तस्राव']
    },
    primaryDept: '婦人科',
    backupDept: '産科',
    redFlags: [
      'Extremely heavy bleeding soaking through multiple pads per hour with dizziness',
      'Sudden excruciating pelvic pain accompanied by vomiting or fainting'
    ],
    questions: [],
    reviewed: false
  },

  // 13 Breast lumps and pain -> 乳腺外科
  {
    id: 'g13',
    category: 'skin_aesthetic',
    name: {
      en: 'Breast lumps and pain',
      ja: '乳房のしこり・痛み・乳腺の症状',
      hi: 'स्तन में गांठ, स्तन दर्द और निप्पल स्राव'
    },
    conditionsAndProblems: [
      'breast lump', 'mastalgia', 'fibroadenoma', 'mastitis',
      'nipple discharge', 'breast cancer screening', 'mammography check'
    ],
    keywords: {
      en: ['breast lump', 'breast pain', 'lump in breast', 'nipple discharge', 'mastitis', 'breast check', 'mammogram'],
      ja: ['胸のしこり', '乳房のしこり', '乳腺', '胸の痛み', '乳房の痛み', '乳腺炎', '乳頭分泌', 'マンモグラフィ'],
      hi: ['स्तन में गांठ', 'स्तन में दर्द', 'स्तन जांच', 'निप्पल से स्राव', 'मैमोग्राफी']
    },
    primaryDept: '乳腺外科',
    redFlags: [
      'Rapidly enlarging hard immobile breast lump with dimpling skin (orange peel texture)',
      'Bloody discharge coming spontaneously from one nipple',
      'High fever with rapidly spreading red, fiery hot breast swelling'
    ],
    questions: [],
    reviewed: false
  },

  // 14 Child health -> 小児科
  {
    id: 'g14',
    category: 'children',
    name: {
      en: 'Child health',
      ja: '小児の病気・子どもの急な発熱・体調不良',
      hi: 'शिशु एवं बाल स्वास्थ्य, बच्चों की बीमारियां'
    },
    conditionsAndProblems: [
      'pediatric fever', 'RSV infection', 'hand foot and mouth disease', 'roseola',
      'pediatric gastroenteritis', 'febrile seizure history', 'lethargy in child'
    ],
    keywords: {
      en: ['child sick', 'pediatric fever', 'baby fever', 'toddler sick', 'child vomiting', 'baby crying', 'infant rash'],
      ja: ['子供の熱', '子どもの病気', '赤ちゃんの発熱', '小児科', 'ぐったり', '突発性発疹', '手足口病', '小児嘔吐'],
      hi: ['बच्चे को बुखार', 'शिशु रोग', 'बच्चा बीमार', 'शिशु में उल्टी', 'बाल रोग']
    },
    primaryDept: '小児科',
    redFlags: [
      'Infant under 3 months with a rectal temperature of 38.0°C or higher',
      'Child is limp, unusually unresponsive, or cannot be woken easily',
      'Child has sunken fontanelle, no tears when crying, and no wet diapers in 8+ hours',
      'Child has seizure, stiff neck, or non-blanching purple rash spots'
    ],
    questions: [],
    reviewed: false
  },

  // 15 Child vaccinations and baby checkups -> 小児科
  {
    id: 'g15',
    category: 'children',
    name: {
      en: 'Child vaccinations and baby checkups',
      ja: '乳幼児健診・小児の定期予防接種',
      hi: 'बच्चों का टीकाकरण और शिशु स्वास्थ्य जांच'
    },
    conditionsAndProblems: [
      'routine infant vaccination', 'BCG vaccine', 'MR vaccine', 'DPT-IPV vaccine',
      '1-month baby check', '3-month baby check', '1-year child health examination'
    ],
    keywords: {
      en: ['child vaccination', 'baby vaccine', 'baby checkup', 'infant milestone', 'immunization child', 'pediatric vaccine'],
      ja: ['予防接種', '定期接種', '乳幼児健診', '3ヶ月健診', '1歳半健診', 'BCG', 'MRワクチン', '母子手帳'],
      hi: ['बच्चों का टीका', 'शिशु टीकाकरण', 'टीकाकरण कार्ड', 'शिशु स्वास्थ्य जांच']
    },
    primaryDept: '小児科',
    redFlags: [
      'Anaphylactic reaction or severe facial swelling immediately after injection',
      'Persistent high fever above 39.5°C or continuous high-pitched crying after shot'
    ],
    questions: [],
    reviewed: false
  },

  // 16 Headache, numbness, nerves -> 脳神経内科 / 脳神経外科
  {
    id: 'g16',
    category: 'neurology_mental',
    name: {
      en: 'Headache, numbness, nerves',
      ja: '頭痛・手足のしびれ・神経の異常',
      hi: 'सिरदर्द, सुन्न पड़ना और तंत्रिका समस्याएं'
    },
    conditionsAndProblems: [
      'migraine', 'tension headache', 'peripheral neuropathy', 'carpal tunnel syndrome',
      'cervical radiculopathy', 'trigeminal neuralgia', 'facial nerve palsy', 'tremor'
    ],
    keywords: {
      en: ['headache', 'head ache', 'hedache', 'migraine', 'numbness', 'tingling', 'pins and needles', 'nerve pain', 'facial paralysis', 'hand numbness'],
      ja: ['頭痛', '偏頭痛', 'ズキズキ', 'しびれ', '手足のしびれ', '神経痛', '顔の麻痺', '顔面神経麻痺', 'ふるえ'],
      hi: ['सिरदर्द', 'माइग्रेन', 'सुन्न पड़ना', 'झुनझुनी', 'नसों का दर्द', 'चेहरे का लकवा']
    },
    primaryDept: '脳神経内科',
    backupDept: '脳神経外科',
    redFlags: [
      'Sudden "thunderclap" headache reaching maximum agonizing intensity within seconds',
      'Facial droop, unilateral arm or leg weakness, or slurred speech (FAST stroke signs)',
      'Headache following a head impact with vomiting or drowsiness'
    ],
    questions: [],
    reviewed: false
  },

  // 17 Dizziness, fainting, balance -> 脳神経内科 / 耳鼻いんこう科
  {
    id: 'g17',
    category: 'neurology_mental',
    name: {
      en: 'Dizziness, fainting, balance',
      ja: 'めまい・立ちくらみ・ふらつき・失神',
      hi: 'चक्कर आना, बेहोशी और संतुलन बिगड़ना'
    },
    conditionsAndProblems: [
      'benign paroxysmal positional vertigo', 'Meniere disease', 'orthostatic hypotension',
      'vestibular neuritis', 'presyncope', 'vasovagal syncope', 'unsteady gait'
    ],
    keywords: {
      en: ['dizziness', 'dizzy', 'dizzines', 'vertigo', 'room spinning', 'fainting', 'passed out', 'lightheaded', 'unsteady', 'loss of balance'],
      ja: ['めまい', '眩暈', '目が回る', '立ちくらみ', 'ふらふら', '気が遠くなる', '失神', 'ふらつき'],
      hi: ['चक्कर आना', 'सिर घूमना', 'बेहोशी', 'संतुलन खोना', 'आंखों के आगे अंधेरा छाना']
    },
    primaryDept: '脳神経内科',
    backupDept: '耳鼻いんこう科',
    redFlags: [
      'Dizziness accompanied by double vision, slurred speech, or difficulty swallowing',
      'Sudden collapse without any warning or pulse irregularity',
      'Complete inability to stand or walk with sudden loss of coordination'
    ],
    questions: [],
    reviewed: false
  },

  // 18 Memory, ageing, falls -> 脳神経内科
  {
    id: 'g18',
    category: 'neurology_mental',
    name: {
      en: 'Memory, ageing, falls',
      ja: '物忘れ・認知機能・高齢者の転倒',
      hi: 'याददाश्त में कमी, बुढ़ापा और गिरने की समस्या'
    },
    conditionsAndProblems: [
      'mild cognitive impairment', 'Alzheimer disease', 'vascular dementia',
      'frequent falls in elderly', 'Parkinson disease suspicion', 'senile disorientation'
    ],
    keywords: {
      en: ['memory loss', 'forgetfulness', 'dementia', 'alzheimer', 'elderly falls', 'getting lost', 'confusion in senior', 'shuffling walk'],
      ja: ['物忘れ', 'もの忘れ', '認知症', 'アルツハイマー', '高齢者の転倒', '道に迷う', '見当識障害', 'すり足歩行'],
      hi: ['याददाश्त कमजोर होना', 'भूलने की बीमारी', 'डिमेंशिया', 'बुजुर्गों का गिरना', 'भटक जाना']
    },
    primaryDept: '脳神経内科',
    redFlags: [
      'Acute sudden confusion developing over hours to days (delirium)',
      'Fall resulting in severe hip pain or inability to bear weight',
      'Head trauma on anticoagulant medications with drowsiness'
    ],
    questions: [],
    reviewed: false
  },

  // 19 Mental health -> 精神科 / 心療内科
  {
    id: 'g19',
    category: 'neurology_mental',
    name: {
      en: 'Mental health',
      ja: 'こころの健康・うつ・不安・パニック',
      hi: 'मानसिक स्वास्थ्य, अवसाद और घबराहट'
    },
    conditionsAndProblems: [
      'major depressive episode', 'generalized anxiety disorder', 'panic disorder',
      'adjustment disorder', 'burnout syndrome', 'obsessive compulsive symptoms', 'social anxiety'
    ],
    keywords: {
      en: ['depression', 'depressed', 'anxiety', 'anxious', 'panic attack', 'burnout', 'hopeless', 'overwhelmed', 'mental health', 'crying spells'],
      ja: ['うつ', '鬱', '抑うつ', '気分が落ち込む', '不安', 'パニック', 'やる気が出ない', '適応障害', 'ストレス限界', 'メンタル'],
      hi: ['अवसाद', 'डिप्रेशन', 'घबराहट', 'चिंता', 'पैनिक अटैक', 'मानसिक तनाव', 'उदासी']
    },
    primaryDept: '精神科',
    backupDept: '心療内科',
    redFlags: [
      'Active thoughts or intent to harm oneself or end one\'s life',
      'Hearing voices or seeing things that others cannot perceive',
      'Extreme agitation or inability to maintain basic physical safety'
    ],
    questions: [],
    reviewed: false
  },

  // 20 Sleep problems and snoring -> 睡眠外来 / 呼吸器内科 / 精神科
  {
    id: 'g20',
    category: 'respiratory',
    name: {
      en: 'Sleep problems and snoring',
      ja: '不眠症・いびき・睡眠時無呼吸症候群',
      hi: 'नींद की समस्या, खर्राटे और स्लीप एप्निया'
    },
    conditionsAndProblems: [
      'insomnia', 'obstructive sleep apnea', 'severe snoring',
      'restless legs syndrome', 'daytime somnolence', 'circadian rhythm disruption'
    ],
    keywords: {
      en: ['insomnia', 'cannot sleep', 'waking up early', 'snoring', 'sleep apnea', 'gasping during sleep', 'daytime sleepiness', 'sleep problem'],
      ja: ['不眠', '眠れない', '途中で起きる', 'いびき', '睡眠時無呼吸症候群', 'SAS', '日中の強い眠気', '睡眠障害'],
      hi: ['नींद न आना', 'अनिद्रा', 'खर्राटे', 'स्लीप एप्निया', 'दिन में नींद आना']
    },
    primaryDept: '睡眠外来',
    backupDept: '呼吸器内科',
    redFlags: [
      'Falling asleep involuntarily while driving or operating machinery',
      'Waking up gasping for air with severe chest tightness and blue lips'
    ],
    questions: [],
    reviewed: false
  },

  // 21 Smoking, alcohol, addiction -> 内科 / 精神科
  {
    id: 'g21',
    category: 'neurology_mental',
    name: {
      en: 'Smoking, alcohol, addiction',
      ja: '禁煙外来・アルコール相談・依存症',
      hi: 'धूम्रपान, शराब और लत मुक्ति परामर्श'
    },
    conditionsAndProblems: [
      'nicotine dependence', 'smoking cessation outpatient', 'alcohol use disorder',
      'substance abuse counseling', 'withdrawal prevention', 'liver check from alcohol'
    ],
    keywords: {
      en: ['quit smoking', 'smoking cessation', 'nicotine', 'alcohol addiction', 'stop drinking', 'hangover severe', 'substance dependency'],
      ja: ['禁煙外来', 'タバコをやめたい', 'アルコール依存症', 'お酒をやめたい', '禁酒', '依存症相談'],
      hi: ['धूम्रपान छोड़ना', 'सिगरेट छोड़ना', 'शराब की लत', 'नशा मुक्ति']
    },
    primaryDept: '内科',
    backupDept: '精神科',
    redFlags: [
      'Severe alcohol withdrawal tremors, hallucinations, or seizures (delirium tremens)',
      'Vomiting blood following an episode of heavy drinking'
    ],
    questions: [],
    reviewed: false
  },

  // 22 Diabetes, thyroid, hormones -> 糖尿病・内分泌内科
  {
    id: 'g22',
    category: 'endocrine_blood',
    name: {
      en: 'Diabetes, thyroid, hormones',
      ja: '糖尿病・甲状腺疾患・ホルモン代謝異常',
      hi: 'मधुमेह, थायरॉयड और हार्मोनल समस्याएं'
    },
    conditionsAndProblems: [
      'type 2 diabetes', 'type 1 diabetes', 'hyperthyroidism', 'hypothyroidism',
      'Hashimoto thyroiditis', 'Graves disease', 'high blood glucose', 'HbA1c elevation', 'polydipsia'
    ],
    keywords: {
      en: ['diabetes', 'blood sugar', 'hba1c', 'thyroid', 'hyperthyroid', 'hypothyroid', 'excessive thirst', 'frequent peeing thirst', 'goiter'],
      ja: ['糖尿病', '血糖値', 'ヘモグロビンA1c', '甲状腺', 'バセドウ病', '橋本病', '喉の渇き', '多尿', 'ホルモン'],
      hi: ['डायबिटीज', 'मधुमेह', 'थायरॉयड', 'ब्लड शुगर', 'ज्यादा प्यास लगना', 'थायरॉयड ग्रंथि']
    },
    primaryDept: '糖尿病・内分泌内科',
    redFlags: [
      'Extremely high blood sugar with sweet-smelling breath, deep rapid breathing, and confusion (DKA)',
      'Severe hypoglycemia (confusion, sweating, loss of consciousness)'
    ],
    questions: [],
    reviewed: false
  },

  // 23 Blood and immune (anemia, bruising, rheumatism) -> 血液内科 / リウマチ科
  {
    id: 'g23',
    category: 'endocrine_blood',
    name: {
      en: 'Blood and immune (anemia, bruising, rheumatism)',
      ja: '貧血・あざ・リウマチ・自己免疫疾患',
      hi: 'खून और प्रतिरक्षा (एनीमिया, नील पड़ना, गठिया)'
    },
    conditionsAndProblems: [
      'iron deficiency anemia', 'unexplained bruising', 'thrombocytopenia',
      'rheumatoid arthritis', 'morning stiffness', 'autoimmune connective tissue disease', 'petechiae'
    ],
    keywords: {
      en: ['anemia', 'bruise easily', 'unexplained bruises', 'pale skin', 'rheumatism', 'rheumatoid', 'morning joint stiffness', 'low platelets', 'purpura'],
      ja: ['貧血', '立ちくらみ', 'あざ', '青あざ', '紫斑', '血小板', 'リウマチ', '朝のこわばり', '自己免疫疾患'],
      hi: ['एनीमिया', 'खून की कमी', 'आसानी से नील पड़ना', 'गठिया', 'जोड़ों में अकड़न', 'प्लेटलेट्स की कमी']
    },
    primaryDept: '血液内科',
    backupDept: 'リウマチ科',
    redFlags: [
      'Sudden rapid outbreak of tiny red/purple blood spots across legs with bleeding gums',
      'Extreme pallor with heart palpitations and dizziness even at rest'
    ],
    questions: [],
    reviewed: false
  },

  // 24 Cancer concerns and ongoing treatment -> 血液・腫瘍内科 / 内科
  {
    id: 'g24',
    category: 'endocrine_blood',
    name: {
      en: 'Cancer concerns and ongoing treatment',
      ja: 'がん相談・腫瘍内科・抗がん剤副作用',
      hi: 'कैंसर संबंधी चिंताएं एवं ऑन्कोलॉजी परामर्श'
    },
    conditionsAndProblems: [
      'cancer second opinion', 'chemotherapy side effects', 'post-operative oncology followup',
      'unintentional rapid weight loss', 'palliative symptom control', 'tumor marker check'
    ],
    keywords: {
      en: ['cancer', 'tumor', 'tumour', 'chemotherapy', 'oncology', 'unexplained weight loss', 'malignancy', 'second opinion cancer'],
      ja: ['がん', '悪性腫瘍', '抗がん剤', '化学療法', '腫瘍内科', '原因不明の体重減少', 'セカンドオピニオン'],
      hi: ['कैंसर', 'ट्यूमर', 'कीमोथेरेपी', 'ऑन्कोलॉजी', 'बिना कारण वजन कम होना', 'कैंसर परामर्श']
    },
    primaryDept: '血液・腫瘍内科',
    backupDept: '内科',
    redFlags: [
      'High fever above 38°C in a patient currently undergoing active chemotherapy (febrile neutropenia)',
      'Intractable severe vomiting or dehydration during oncology treatment'
    ],
    questions: [],
    reviewed: false
  },

  // 25 Allergies and hay fever -> アレルギー科 / 耳鼻いんこう科
  {
    id: 'g25',
    category: 'ent_eyes',
    name: {
      en: 'Allergies and hay fever',
      ja: '花粉症・アレルギー鼻炎・アトピー',
      hi: 'एलर्जी और परागज ज्वर (हे फीवर)'
    },
    conditionsAndProblems: [
      'cedar pollinosis', 'allergic rhinitis', 'allergic conjunctivitis',
      'food allergy reaction', 'atopic dermatitis flare', 'hives', 'urticaria'
    ],
    keywords: {
      en: ['allergy', 'allergies', 'alergy', 'hay fever', 'pollen', 'cedar pollen', 'itchy nose', 'sneezing attack', 'runny nose allergy', 'hives'],
      ja: ['花粉症', 'アレルギー', 'アレルギー性鼻炎', 'くしゃみ', '鼻水', '杉花粉', '蕁麻疹', 'じんましん', 'アトピー'],
      hi: ['एलर्जी', 'हे फीवर', 'परागज ज्वर', 'छींकें आना', 'नाक बहना', 'पित्ती']
    },
    primaryDept: 'アレルギー科',
    backupDept: '耳鼻いんこう科',
    redFlags: [
      'Throat tightness, hoarseness, swollen tongue, or wheezing after eating (anaphylaxis)',
      'Widespread sudden hives accompanied by dizziness or falling blood pressure'
    ],
    questions: [],
    reviewed: false
  },

  // 26 Skin, hair, nails -> 皮膚科
  {
    id: 'g26',
    category: 'skin_aesthetic',
    name: {
      en: 'Skin, hair, nails',
      ja: '皮膚の湿疹・かゆみ・ニキビ・脱毛・爪',
      hi: 'त्वचा, बाल और नाखून की समस्याएं'
    },
    conditionsAndProblems: [
      'eczema', 'contact dermatitis', 'acne vulgaris', 'shingles',
      'alopecia areata', 'ingrown toenail', 'athlete foot', 'ringworm', 'psoriasis'
    ],
    keywords: {
      en: ['skin rash', 'itchy skin', 'eczema', 'acne', 'pimple', 'shingles', 'hair loss', 'bald spots', 'ingrown nail', 'ringworm'],
      ja: ['皮膚', '湿疹', 'かゆみ', '肌荒れ', 'ニキビ', '帯状疱疹', '抜け毛', '円形脱毛症', '巻き爪', '水虫'],
      hi: ['त्वचा पर दाने', 'खुजली', 'एक्जिमा', 'मुंहासे', 'बाल झड़ना', 'दाद', 'नाखून की समस्या']
    },
    primaryDept: '皮膚科',
    redFlags: [
      'Painful blistering rash erupting near or on the eyelid/eye (danger to vision)',
      'Rapidly spreading hot, red, extremely swollen skin on the face or leg (cellulitis) with fever'
    ],
    questions: [],
    reviewed: false
  },

  // 27 Scars, moles, cosmetic concerns -> 形成外科 / 美容外科
  {
    id: 'g27',
    category: 'skin_aesthetic',
    name: {
      en: 'Scars, moles, cosmetic concerns',
      ja: '傷跡・ほくろ切除・ケロイド・美容相談',
      hi: 'घाव के निशान, तिल हटाना और कॉस्मेटिक चिंताएं'
    },
    conditionsAndProblems: [
      'hypertrophic scar', 'keloid', 'mole excision', 'skin tag removal',
      'birthmark treatment', 'eyelid ptosis surgery', 'aesthetic consultation'
    ],
    keywords: {
      en: ['scar', 'keloid', 'mole removal', 'birthmark', 'skin tag', 'cosmetic', 'double eyelid', 'botox', 'wrinkle'],
      ja: ['傷跡', 'ケロイド', 'ほくろ除去', 'ほくろ切除', 'あざ治療', 'いぼ取り', '眼瞼下垂', '美容外科', '二重整形'],
      hi: ['घाव का निशान', 'तिल हटाना', 'केलोइड', 'मस्सा', 'प्लास्टिक सर्जरी परामर्श']
    },
    primaryDept: '形成外科',
    backupDept: '美容外科',
    redFlags: [
      'Mole that has rapidly changed shape, developed irregular ragged borders, or started bleeding (melanoma alert)'
    ],
    questions: [],
    reviewed: false
  },

  // 28 Bones, joints, muscles -> 整形外科
  {
    id: 'g28',
    category: 'musculoskeletal',
    name: {
      en: 'Bones, joints, muscles',
      ja: '腰痛・関節痛・膝痛・肩こり・骨折',
      hi: 'हड्डियां, जोड़, कमर दर्द और मांसपेशियां'
    },
    conditionsAndProblems: [
      'acute lumbago', 'lumbar disc herniation', 'knee osteoarthritis', 'frozen shoulder',
      'sprained ankle', 'muscle strain', 'tennis elbow', 'bone fracture evaluation'
    ],
    keywords: {
      en: [
        'back pain', 'lower back pain', 'knee pain', 'shoulder pain', 'joint pain', 'sprain', 'bone fracture', 'stiff neck', 'sciatica',
        'joint', 'joints', 'muscle', 'muscles', 'bone', 'bones', 'ligament', 'ligaments', 'tendon', 'tendons',
        'bicep', 'biceps', 'tricep', 'tear', 'torn', 'strain', 'strained', 'pulled muscle', 'cramp',
        'back', 'knee', 'shoulder', 'neck', 'elbow', 'wrist', 'ankle', 'hip',
        'foot', 'feet', 'toe', 'heel'
      ],
      ja: [
        '腰痛', 'ぎっくり腰', 'ひざの痛み', '肩の痛み', '五十肩', '関節痛', '捻挫', '骨折', '腱鞘炎', '坐骨神経痛',
        '関節', '筋肉', '骨', '靭帯', '腱', '肉離れ', '腰', '膝', '肩', '首', '肘', '手首', '足首',
        '足', 'かかと'
      ],
      hi: [
        'कमर दर्द', 'घुटने का दर्द', 'कंधे में दर्द', 'जोड़ों का दर्द', 'मोच', 'हड्डी में चोट', 'साइटिका',
        'जोड़', 'मांसपेशी', 'हड्डी', 'लिगामेंट', 'कंधा', 'घुटना',
        'पैर'
      ]
    },
    primaryDept: '整形外科',
    redFlags: [
      'Severe back pain accompanied by sudden loss of bladder or bowel sensation (cauda equina)',
      'Visible bone deformity or inability to bear any weight after a twist/fall'
    ],
    questions: [],
    reviewed: false
  },

  // 29 Injuries, burns, accidents -> 外科 / 整形外科
  {
    id: 'g29',
    category: 'musculoskeletal',
    name: {
      en: 'Injuries, burns, accidents',
      ja: '切り傷・外傷・熱傷（やけど）・打撲',
      hi: 'चोट, घाव, जलना और दुर्घटना'
    },
    conditionsAndProblems: [
      'laceration requiring stitches', 'deep skin cut', 'second degree burn',
      'blunt trauma', 'road accident minor injuries', 'puncture wound', 'tetanus risk'
    ],
    keywords: {
      en: [
        'cut', 'deep wound', 'bleeding wound', 'stitches', 'burn', 'scald', 'accident injury', 'bruised rib', 'fall injury',
        'injury', 'injured', 'sprain', 'twisted', 'fall', 'fell', 'accident'
      ],
      ja: [
        '切り傷', '傷口', '縫合', 'やけど', '火傷', '外傷', '打撲', 'ケガ', '事故のケガ',
        '怪我', 'けが', '捻挫', '転倒'
      ],
      hi: [
        'कट लगना', 'गहरा घाव', 'टांके लगना', 'जलना', 'चोट लगना', 'दुर्घटना में चोट',
        'चोट', 'मोच'
      ]
    },
    primaryDept: '外科',
    backupDept: '整形外科',
    redFlags: [
      'Arterial spurting blood that cannot be stopped after 10 minutes of direct pressure',
      'Large area burns involving blistering across hands, face, or groin',
      'Penetrating deep puncture wounds from rusted metal with unknown tetanus history'
    ],
    questions: [],
    reviewed: false
  },

  // 30 Chronic pain -> ペインクリニック(麻酔科)
  {
    id: 'g30',
    category: 'musculoskeletal',
    name: {
      en: 'Chronic pain',
      ja: '慢性疼痛・神経ブロック・頑固な痛み',
      hi: 'क्रोनिक पुराना दर्द और नर्व ब्लॉक'
    },
    conditionsAndProblems: [
      'post-herpetic neuralgia', 'complex regional pain syndrome', 'chronic intractable back pain',
      'failed back surgery syndrome', 'nerve block consultation', 'fibromyalgia pain'
    ],
    keywords: {
      en: ['chronic pain', 'pain clinic', 'nerve block', 'intractable pain', 'burning nerve pain', 'long term pain', 'severe sciatica'],
      ja: ['ペインクリニック', '神経ブロック', '慢性疼痛', '帯状疱疹後神経痛', '何ヶ月も続く痛み', '頑固な痛み'],
      hi: ['पुराना दर्द', 'क्रोनिक पेन', 'दर्द निवारण क्लिनिक', 'नर्व ब्लॉक', 'लगातार रहने वाला दर्द']
    },
    primaryDept: 'ペインクリニック(麻酔科)',
    redFlags: [
      'Sudden progressive muscle paralysis or loss of bowel/bladder control'
    ],
    questions: [],
    reviewed: false
  },

  // 31 Rehabilitation after injury or stroke -> リハビリテーション科
  {
    id: 'g31',
    category: 'musculoskeletal',
    name: {
      en: 'Rehabilitation after injury or stroke',
      ja: 'リハビリテーション・脳卒中後遺症・機能回復',
      hi: 'चोट या स्ट्रोक के बाद पुनर्वास (रिहैबिलिटेशन)'
    },
    conditionsAndProblems: [
      'post-stroke rehabilitation', 'orthopedic surgery recovery', 'mobility training',
      'physiotherapy assessment', 'occupational therapy', 'speech therapy', 'dysphagia rehabilitation'
    ],
    keywords: {
      en: ['rehabilitation', 'rehab', 'physiotherapy', 'physical therapy', 'stroke recovery', 'walking training', 'speech therapy', 'occupational therapy'],
      ja: ['リハビリテーション', 'リハビリ', '理学療法', '作業療法', '言語聴覚療法', '脳梗塞後リハビリ', '歩行訓練', '機能回復'],
      hi: ['पुनर्वास', 'फिजियोथेरेपी', 'स्ट्रोक के बाद सुधार', 'चलने का अभ्यास', 'रिहैबिलिटेशन']
    },
    primaryDept: 'リハビリテーション科',
    redFlags: [
      'Sudden new neurological deficit or new acute weakness during therapy session'
    ],
    questions: [],
    reviewed: false
  },

  // 32 Lumps, hernia, abscess -> 外科
  {
    id: 'g32',
    category: 'musculoskeletal',
    name: {
      en: 'Lumps, hernia, abscess',
      ja: '皮膚のしこり・脱腸（ヘルニア）・膿瘍',
      hi: 'गांठ, हर्निया और फोड़ा (एब्सेस)'
    },
    conditionsAndProblems: [
      'inguinal hernia', 'epidermal cyst', 'lipoma', 'subcutaneous abscess',
      'furuncle', 'umbilical hernia', 'infected cyst drainage'
    ],
    keywords: {
      en: ['lump under skin', 'groin bulge', 'hernia', 'abscess', 'boil', 'cyst', 'pus collection', 'swollen lymph node groin'],
      ja: ['しこり', '粉瘤', 'アテローム', '脱腸', '鼠径ヘルニア', '膿瘍', 'できもの', 'ウミが溜まる', '腫れ'],
      hi: ['त्वचा में गांठ', 'हर्निया', 'फोड़ा', 'मवाद', 'सूजन']
    },
    primaryDept: '外科',
    redFlags: [
      'Groin hernia that becomes excruciatingly painful, hard, and cannot be pushed back in (strangulation risk)',
      'Rapidly expanding hot red abscess with high spiking fever'
    ],
    questions: [],
    reviewed: false
  },

  // 33 Eyes -> 眼科
  {
    id: 'g33',
    category: 'ent_eyes',
    name: {
      en: 'Eyes',
      ja: '目の痛み・充血・かすみ目・ものもらい',
      hi: 'आंखें, आंखों में लाली, दृष्टि और दर्द'
    },
    conditionsAndProblems: [
      'conjunctivitis', 'stye', 'chalazion', 'dry eye syndrome',
      'corneal abrasion', 'glaucoma screening', 'cataract assessment', 'blurred vision'
    ],
    keywords: {
      en: ['eye pain', 'red eye', 'pink eye', 'conjunctivitis', 'stye', 'blurry vision', 'blurred vision', 'itchy eye', 'contact lens infection'],
      ja: ['眼科', '目の痛み', '充血', 'ものもらい', '目やに', 'かすみ目', '視力低下', '結膜炎', '目が痒い'],
      hi: ['आंख में दर्द', 'आंख लाल होना', 'आंख आना', 'धुंधला दिखना', 'गुहेरी', 'आंख में खुजली']
    },
    primaryDept: '眼科',
    redFlags: [
      'Sudden total or partial loss of vision in one eye',
      'Severe intense eye pain accompanied by colored halos around lights and nausea (acute glaucoma)',
      'Chemical splash into the eye (rinse immediately and seek emergency medical care)'
    ],
    questions: [],
    reviewed: false
  },

  // 34 Ear, nose, throat -> 耳鼻いんこう科
  {
    id: 'g34',
    category: 'ent_eyes',
    name: {
      en: 'Ear, nose, throat',
      ja: '耳鼻咽喉・耳の痛み・難聴・鼻血・咽頭炎',
      hi: 'कान, नाक और गला'
    },
    conditionsAndProblems: [
      'otitis media', 'otitis externa', 'sinusitis', 'tonsillitis',
      'sudden sensorineural hearing loss', 'tinnitus', 'loss of smell', 'epistaxis'
    ],
    keywords: {
      en: ['earache', 'ear pain', 'ear infection', 'hearing loss', 'ringing in ear', 'tinnitus', 'sinus infection', 'sore throat severe', 'loss of smell'],
      ja: ['耳の痛み', '中耳炎', '耳鳴り', '難聴', '聞こえにくい', '鼻づまり', '副鼻腔炎', 'のどの激痛', '扁桃炎', '嗅覚障害'],
      hi: ['कान दर्द', 'कान बहना', 'कान में सीटी बजना', 'कम सुनाई देना', 'गले में दर्द', 'साइनस', 'सूंघने की क्षमता कम होना']
    },
    primaryDept: '耳鼻いんこう科',
    redFlags: [
      'Sudden loss of hearing in one ear developing over less than 24-48 hours (needs urgent steroids)',
      'Inability to swallow saliva or open mouth widely due to severe throat abscess',
      'Heavy nosebleed that will not stop after 20 minutes of continuous direct pressure'
    ],
    questions: [],
    reviewed: false
  },

  // 35 Teeth and mouth -> 歯科
  {
    id: 'g35',
    category: 'dental_preventive',
    name: {
      en: 'Teeth and mouth',
      ja: '虫歯・歯痛・歯周病・親知らず・顎関節症',
      hi: 'दांत और मुंह की समस्याएं'
    },
    conditionsAndProblems: [
      'dental caries', 'acute pulpitis', 'gingivitis', 'periodontitis',
      'impacted wisdom tooth', 'canker sore', 'temporomandibular joint disorder', 'chipped tooth'
    ],
    keywords: {
      en: ['toothache', 'tooth ache', 'teeth pain', 'cavity', 'wisdom tooth', 'bleeding gums', 'jaw click', 'broken tooth', 'dentist checkup'],
      ja: ['歯痛', '歯が痛い', '虫歯', '歯周病', '歯ぐきの出血', '親知らず', '顎関節症', '口内炎', '歯が欠けた', '歯科'],
      hi: ['दांत दर्द', 'दांत में कीड़ा', 'मसूड़ों से खून आना', 'अक्ल दाढ़', 'दांत टूटना', 'मुंह के छाले']
    },
    primaryDept: '歯科',
    redFlags: [
      'Severe dental infection causing facial or neck swelling that begins to compromise breathing',
      'High fever with jaw trismus (inability to open mouth)'
    ],
    questions: [],
    reviewed: false
  },

  // 36 Infections, travel, adult vaccinations -> 感染症内科
  {
    id: 'g36',
    category: 'dental_preventive',
    name: {
      en: 'Infections, travel, adult vaccinations',
      ja: '渡航前ワクチン・熱帯病・成人の感染症',
      hi: 'संक्रामक रोग, यात्रा परामर्श और वयस्क टीकाकरण'
    },
    conditionsAndProblems: [
      'travel vaccination', 'yellow fever vaccination', 'malaria prophylaxis',
      'dengue fever after travel', 'tuberculosis assessment', 'rabies post-exposure consultation'
    ],
    keywords: {
      en: ['travel clinic', 'travel vaccine', 'yellow fever', 'malaria pills', 'tropical disease fever after travel', 'rabies shot', 'adult immunization'],
      ja: ['トラベルクリニック', '渡航前ワクチン', '黄熱病ワクチン', 'マラリア予防薬', '海外旅行後の熱', '狂犬病ワクチン', '感染症外来'],
      hi: ['ट्रैवल क्लिनिक', 'यात्रा टीका', 'मलेरिया बचाव', 'विदेश यात्रा के बाद बुखार', 'रेबीज टीका']
    },
    primaryDept: '感染症内科',
    redFlags: [
      'High spiking fever returning from tropical countries (malaria emergency)',
      'Animal bite from suspected rabid mammal abroad without completed vaccination'
    ],
    questions: [],
    reviewed: false
  },

  // 37 Checkups and screening -> 内科
  {
    id: 'g37',
    category: 'general',
    name: {
      en: 'Checkups and screening',
      ja: '定期健康診断・雇入時健診・特定健診',
      hi: 'स्वास्थ्य जांच और नियमित स्क्रीनिंग'
    },
    conditionsAndProblems: [
      'annual general health check', 'employment physical exam', 'periodic company checkup',
      'metabolic syndrome screening', 'electrocardiogram and blood test checkup'
    ],
    keywords: {
      en: ['health checkup', 'medical checkup', 'employment health check', 'annual check', 'general screening', 'blood test routine'],
      ja: ['健康診断', '健診', '雇入時健診', '定期健診', '特定健診', '血液検査希望', '人間ドック'],
      hi: ['स्वास्थ्य जांच', 'हेल्थ चेकअप', 'मेडिकल टेस्ट', 'नौकरी के लिए मेडिकल जांच', 'नियमित जांच']
    },
    primaryDept: '内科',
    redFlags: [],
    questions: [],
    reviewed: false
  },

  // 38 Medicines and prescription refills -> 内科
  {
    id: 'g38',
    category: 'dental_preventive',
    name: {
      en: 'Medicines and prescription refills',
      ja: '定期薬の処方・処方せん継続・持参薬相談',
      hi: 'दवाओं का नियमित नुस्खा एवं रिफिल'
    },
    conditionsAndProblems: [
      'maintenance medication refill', 'blood pressure medication renewal',
      'cholesterol medicine continuation', 'switching foreign prescription to Japanese prescription'
    ],
    keywords: {
      en: ['prescription refill', 'medicine running out', 'repeat prescription', 'regular medicine', 'foreign prescription transfer'],
      ja: ['処方せん', '定期薬の継続', '薬が切れた', 'いつもの薬', '海外の処方薬の切り替え'],
      hi: ['दवा की पर्ची', 'दवा खत्म होना', 'नियमित दवा', 'प्रिस्क्रिप्शन रिन्यूअल']
    },
    primaryDept: '内科',
    redFlags: [
      'Abrupt discontinuation of vital cardiac, anti-epileptic, or steroid medications causing acute withdrawal symptoms'
    ],
    questions: [],
    reviewed: false
  },

  // 39 Tiredness, weight, "just unwell" -> 総合診療科 / 内科
  {
    id: 'g39',
    category: 'general',
    name: {
      en: 'Tiredness, weight, "just unwell"',
      ja: '慢性疲労・体重変化・なんとなく体調が悪い',
      hi: 'थकान, वजन में बदलाव और सामान्य अस्वस्थता'
    },
    conditionsAndProblems: [
      'chronic fatigue', 'unexplained malaise', 'loss of appetite', 'night sweats',
      'unintentional weight change', 'general weakness', 'undiagnosed feeling unwell'
    ],
    keywords: {
      en: [
        'tiredness', 'always tired', 'chronic fatigue', 'fatigued', 'feeling unwell', 'unexplained weight change', 'loss of appetite', 'malaise', 'run down',
        'fat', 'weight gain', 'weight loss', 'obesity', 'overweight'
      ],
      ja: [
        'だるい', '倦怠感', '疲れが取れない', '体調不良', '食欲不振', '体重減少', '原因がわからない不調', '総合診療',
        '体重', '肥満'
      ],
      hi: [
        'लगातार थकान', 'कमजोरी', 'अस्वस्थ महसूस होना', 'भूख न लगना', 'वजन घटना',
        'वजन', 'मोटापा'
      ]
    },
    primaryDept: '総合診療科',
    backupDept: '内科',
    redFlags: [
      'Severe drenching night sweats with rapidly growing enlarged lymph nodes',
      'Unexplained weight loss exceeding 10% of body mass over 3 months'
    ],
    questions: [],
    reviewed: false
  },

  // 40 Certificates and paperwork -> 内科
  {
    id: 'g40',
    category: 'general',
    name: {
      en: 'Certificates and paperwork',
      ja: '診断書作成・医療証明書・休職復職書類',
      hi: 'मेडिकल सर्टिफिकेट और दस्तावेज'
    },
    conditionsAndProblems: [
      'medical certificate for work or school', 'fit to work letter',
      'travel clearance certificate', 'sick leave certificate', 'insurance reimbursement paperwork'
    ],
    keywords: {
      en: ['medical certificate', 'doctors note', 'sick leave letter', 'fitness certificate', 'insurance form', 'work clearance'],
      ja: ['診断書', '証明書', '休職届の診断書', '治癒証明書', '海外渡航用診断書', '保険請求書類'],
      hi: ['मेडिकल सर्टिफिकेट', 'डॉक्टर का प्रमाण पत्र', 'बीमारी की छुट्टी का पत्र']
    },
    primaryDept: '内科',
    redFlags: [],
    questions: [],
    reviewed: false
  }
];

// Merge group-specific questions into symptom groups
for (const g of SYMPTOM_GROUPS) {
  if (GROUP_QUESTIONS[g.id]) {
    g.questions = GROUP_QUESTIONS[g.id];
  }
}

// Dev-only check to verify GROUP_QUESTIONS consistency
function verifyGroupQuestionsDev(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const validGroupIds = new Set(SYMPTOM_GROUPS.map((g) => g.id));
    for (const [gid, questions] of Object.entries(GROUP_QUESTIONS)) {
      if (!validGroupIds.has(gid)) {
        console.warn(`[GROUP_QUESTIONS] Invalid group id: "${gid}"`);
      }
      if (questions.length > 4) {
        console.warn(`[GROUP_QUESTIONS] Group "${gid}" exceeds maximum 4 questions (${questions.length})`);
      }
      for (const q of questions) {
        if (!q.text?.en || !q.text?.ja || !q.text?.hi) {
          console.warn(`[GROUP_QUESTIONS] Question "${q.id}" in group "${gid}" missing multilingual text`);
        }
        const optionIds = new Set<string>();
        for (const opt of q.options) {
          if (optionIds.has(opt.id)) {
            console.warn(`[GROUP_QUESTIONS] Duplicate option id "${opt.id}" in question "${q.id}" (${gid})`);
          }
          optionIds.add(opt.id);
          if (!opt.label?.en || !opt.label?.ja || !opt.label?.hi) {
            console.warn(`[GROUP_QUESTIONS] Option "${opt.id}" in question "${q.id}" (${gid}) missing multilingual label`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[GROUP_QUESTIONS] Dev check failed:', err);
  }
}
verifyGroupQuestionsDev();

/**
 * Matches input text against symptom groups using keyword ranking
 */
export function findGroupByKeyword(text: string): SymptomGroup | undefined {
  if (!text || !text.trim()) return undefined;
  const input = text.trim();

  let bestMatch: SymptomGroup | undefined = undefined;
  let highestScore = 0;

  for (const group of SYMPTOM_GROUPS) {
    let score = 0;

    // Check multilingual keywords
    for (const kw of group.keywords.en) {
      if (matchesKeyword(input, kw)) score += 3;
    }
    for (const kw of group.keywords.ja) {
      if (matchesKeyword(input, kw)) score += 3;
    }
    for (const kw of group.keywords.hi) {
      if (matchesKeyword(input, kw)) score += 3;
    }

    // Check conditionsAndProblems keywords (matching only)
    for (const cond of group.conditionsAndProblems) {
      if (matchesKeyword(input, cond)) score += 2;
    }

    // Check group name itself
    if (matchesKeyword(input, group.name.en) || matchesKeyword(input, group.name.ja) || matchesKeyword(input, group.name.hi)) {
      score += 4;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = group;
    }
  }

  // Require minimum match threshold
  if (highestScore >= 2) {
    return bestMatch;
  }

  return undefined;
}

/**
 * Returns group by ID (e.g. 'g01' to 'g40')
 */
export function getGroupById(id: string): SymptomGroup | undefined {
  return SYMPTOM_GROUPS.find((g) => g.id.toLowerCase() === id.toLowerCase());
}

/**
 * Returns groups for a given category
 */
export function getGroupsByCategory(categoryId: string): SymptomGroup[] {
  return SYMPTOM_GROUPS.filter((g) => g.category.toLowerCase() === categoryId.toLowerCase());
}

