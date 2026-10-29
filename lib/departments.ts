/**
 * Canonical Medical Departments Table for MedNavi
 * Mapped directly from Tokyo MHLW Clinic Data (21,691 facilities, 528 distinct dept strings).
 *
 * Provides canonical department codes, official Japanese names, English, Romaji,
 * aliases (historical & variant clinic names), multilingual keywords, and exact clinic counts.
 */

export interface CanonicalDepartment {
  code: string;
  ja: string;
  en: string;
  romaji: string;
  aliases: string[];
  keywords: {
    en: string[];
    ja: string[];
    hi: string[];
  };
  clinicCount: number;
}

// Legacy-compatible interface for existing components
export interface DepartmentInfo {
  ja: string;
  en: string;
  keywords: string[];
}

export const CANONICAL_DEPARTMENTS: CanonicalDepartment[] = [
  {
    code: 'naika',
    ja: '内科',
    en: 'Internal Medicine',
    romaji: 'Naika',
    aliases: ['一般内科', '内科全般', '漢方内科', '老年内科'],
    keywords: {
      en: ['internal medicine', 'general medicine', 'physician', 'cold', 'fever', 'chills', 'flu', 'fatigue', 'malaise', 'weakness'],
      ja: ['内科', '一般内科', '発熱', '風邪', 'かぜ', '悪寒', 'だるさ', '倦怠感'],
      hi: ['आंतरिक चिकित्सा', 'बुखार', 'सर्दी', 'जुकाम', 'कमजोरी', 'थकान']
    },
    clinicCount: 7319
  },
  {
    code: 'sogo-shinryo',
    ja: '総合診療科',
    en: 'General Internal Medicine / Family Medicine',
    romaji: 'Sogo Shinryoka',
    aliases: ['総合内科', '家庭医療科', '総合診療'],
    keywords: {
      en: ['general practice', 'family medicine', 'general consultation', 'primary care', 'unwell', 'unexplained symptom'],
      ja: ['総合診療科', '総合診療', '総合内科', '家庭医療', '原因不明', '体調不良'],
      hi: ['सामान्य चिकित्सा', 'पारिवारिक चिकित्सा', 'अस्वस्थता']
    },
    clinicCount: 2
  },
  {
    code: 'kokyuki-naika',
    ja: '呼吸器内科',
    en: 'Respiratory Medicine / Pulmonology',
    romaji: 'Kokyuki Naika',
    aliases: ['呼吸器科', '呼吸器'],
    keywords: {
      en: ['pulmonology', 'respiratory', 'cough', 'coughing', 'wheezing', 'phlegm', 'sputum', 'bronchitis', 'asthma', 'lungs', 'breath'],
      ja: ['呼吸器内科', '呼吸器科', '咳', 'せき', '痰', '喘息', 'ぜんそく', '息苦しい', '気管支炎'],
      hi: ['श्वसन रोग', 'खांसी', 'कफ', 'सांस फूलना', 'अस्थमा', 'दमा']
    },
    clinicCount: 1064
  },
  {
    code: 'junkanki-naika',
    ja: '循環器内科',
    en: 'Cardiology',
    romaji: 'Junkanki Naika',
    aliases: ['循環器科', '循環器', '心臓内科'],
    keywords: {
      en: ['cardiology', 'heart', 'palpitation', 'palpitations', 'arrhythmia', 'hypertension', 'blood pressure', 'tachycardia', 'pulse'],
      ja: ['循環器内科', '循環器科', '心臓', '動悸', '不整脈', '高血圧', '血圧', '脈拍'],
      hi: ['हृदय रोग', 'दिल', 'धड़कन', 'उच्च रक्तचाप', 'बीपी']
    },
    clinicCount: 1766
  },
  {
    code: 'shinzo-kekkan-geka',
    ja: '心臓血管外科',
    en: 'Cardiovascular Surgery',
    romaji: 'Shinzo Kekkan Geka',
    aliases: ['血管外科', '心臓外科'],
    keywords: {
      en: ['cardiovascular surgery', 'vascular', 'varicose veins', 'circulation', 'leg swelling', 'aneurysm', 'artery', 'vein'],
      ja: ['心臓血管外科', '血管外科', '下肢静脈瘤', '足のむくみ', '静脈瘤', '血管'],
      hi: ['हृदय वाहिका शल्य', 'नसें', 'पैरों की सूजन', 'वेरिकोज वेन्स']
    },
    clinicCount: 138
  },
  {
    code: 'shokaki-naika',
    ja: '消化器内科',
    en: 'Gastroenterology',
    romaji: 'Shokaki Naika',
    aliases: ['胃腸内科', '胃腸科', '消化器科', '内視鏡内科', '肝臓内科', '消化器内視鏡科', '消化器内視鏡内科'],
    keywords: {
      en: ['gastroenterology', 'stomach', 'abdomen', 'abdominal', 'belly', 'digestion', 'nausea', 'vomiting', 'diarrhea', 'acid reflux', 'heartburn', 'gastric', 'cramps'],
      ja: ['消化器内科', '胃腸内科', '胃腸科', '胃痛', '腹痛', '吐き気', '嘔吐', '下痢', '胃もたれ', '逆流性食道炎'],
      hi: ['पेट रोग', 'गैस्ट्रोएंटरोलॉजी', 'पेट दर्द', 'उल्टी', 'दस्त', 'एसिडिटी']
    },
    clinicCount: 1779
  },
  {
    code: 'komon-geka',
    ja: '肛門外科',
    en: 'Proctology / Colorectal Surgery',
    romaji: 'Komon Geka',
    aliases: ['肛門科', '肛門内科', '大腸・肛門外科'],
    keywords: {
      en: ['proctology', 'piles', 'hemorrhoids', 'anal', 'rectum', 'rectal', 'anus', 'anal bleeding', 'anal pain'],
      ja: ['肛門外科', '肛門科', '痔', 'いぼ痔', '切れ痔', '肛門の痛み', '肛門出血', '血便'],
      hi: ['बवासीर', 'गुदा रोग', 'हेमोराइड्स', 'मलाशय']
    },
    clinicCount: 341
  },
  {
    code: 'jinzo-naika',
    ja: '腎臓内科',
    en: 'Nephrology',
    romaji: 'Jinzo Naika',
    aliases: ['腎臓科', '人工透析内科'],
    keywords: {
      en: ['nephrology', 'kidney', 'renal', 'proteinuria', 'dialysis', 'creatinine', 'generalized swelling', 'edema'],
      ja: ['腎臓内科', '腎臓科', '腎臓', '蛋白尿', '人工透析', 'むくみ', 'クレアチニン'],
      hi: ['गुर्दा रोग', 'नेफ्रोलॉजी', 'किडनी', 'डायलिसिस', 'सूजन']
    },
    clinicCount: 368
  },
  {
    code: 'hinyokika',
    ja: '泌尿器科',
    en: 'Urology',
    romaji: 'Hinyokika',
    aliases: ['泌尿器', '男性泌尿器科', '腎臓・泌尿器科'],
    keywords: {
      en: ['urology', 'urinary', 'bladder', 'urine', 'urination', 'painful urination', 'blood in urine', 'frequent urination', 'prostate', 'incontinence'],
      ja: ['泌尿器科', '膀胱炎', '排尿痛', '頻尿', '血尿', '前立腺', '残尿感', 'おしっこ'],
      hi: ['मूत्र रोग', 'यूरोलॉजी', 'पेशाब में दर्द', 'पेशाब में जलन', 'मूत्राशय']
    },
    clinicCount: 766
  },
  {
    code: 'sanka',
    ja: '産科',
    en: 'Obstetrics',
    romaji: 'Sanka',
    aliases: ['産婦人科'],
    keywords: {
      en: ['obstetrics', 'pregnancy', 'pregnant', 'prenatal', 'childbirth', 'morning sickness', 'baby delivery', 'fetal'],
      ja: ['産科', '産婦人科', '妊娠', '妊婦', 'つわり', '出産', '分娩', '胎児'],
      hi: ['प्रसूति विज्ञान', 'गर्भावस्था', 'गर्भवती', 'प्रसव', 'डिलीवरी']
    },
    clinicCount: 146
  },
  {
    code: 'fujinka',
    ja: '婦人科',
    en: 'Gynecology',
    romaji: 'Fujinka',
    aliases: ['産婦人科', '女性科', '女性内科'],
    keywords: {
      en: ['gynecology', 'period', 'menstrual', 'menstruation', 'menopause', 'cramps', 'contraception', 'fertility', 'ovary', 'uterus', 'vaginal'],
      ja: ['婦人科', '産婦人科', '生理痛', '月経', '更年期', 'ピル', '子宮', '卵巣', 'おりもの', '不妊'],
      hi: ['स्त्री रोग', 'गाइनेकोलॉजी', 'मासिक धर्म', 'पीरियड्स', 'रजोनिवृत्ति']
    },
    clinicCount: 562
  },
  {
    code: 'nyusen-geka',
    ja: '乳腺外科',
    en: 'Breast Surgery',
    romaji: 'Nyusen Geka',
    aliases: ['乳腺内科', '乳腺科', '乳腺・内分泌外科'],
    keywords: {
      en: ['breast', 'breast lump', 'breast pain', 'mammogram', 'mastitis', 'nipple discharge'],
      ja: ['乳腺外科', '乳腺科', '胸のしこり', '乳房', '乳腺', 'マンモグラフィ', '乳腺炎', '乳首'],
      hi: ['स्तन रोग', 'स्तन में गांठ', 'स्तन दर्द', 'मैमोग्राम']
    },
    clinicCount: 234
  },
  {
    code: 'shonika',
    ja: '小児科',
    en: 'Pediatrics',
    romaji: 'Shonika',
    aliases: ['小児内科'],
    keywords: {
      en: ['pediatrics', 'pediatric', 'child', 'children', 'infant', 'baby', 'toddler', 'newborn', 'kids'],
      ja: ['小児科', '子ども', '子供', '小児', '乳児', '幼児', '赤ちゃん', '小児発熱'],
      hi: ['बाल रोग', 'पीडियाट्रिक्स', 'बच्चा', 'शिशु', 'बाल चिकित्सा']
    },
    clinicCount: 2292
  },
  {
    code: 'noshinkei-naika',
    ja: '脳神経内科',
    en: 'Neurology',
    romaji: 'Noshinkei Naika',
    aliases: ['神経内科', '神経科'],
    keywords: {
      en: ['neurology', 'headache', 'migraine', 'numbness', 'tingling', 'tremor', 'nerve', 'seizure', 'epilepsy', 'facial palsy'],
      ja: ['脳神経内科', '神経内科', '頭痛', '偏頭痛', 'しびれ', '麻痺', 'ふるえ', 'けいれん', '顔面神経麻痺'],
      hi: ['न्यूरोलॉजी', 'सिरदर्द', 'माइग्रेन', 'सुन्न पड़ना', 'तंत्रिका']
    },
    clinicCount: 220
  },
  {
    code: 'noshinkei-geka',
    ja: '脳神経外科',
    en: 'Neurosurgery',
    romaji: 'Noshinkei Geka',
    aliases: ['脳外科'],
    keywords: {
      en: ['neurosurgery', 'head injury', 'concussion', 'brain trauma', 'brain hemorrhage', 'stroke', 'aneurysm'],
      ja: ['脳神経外科', '脳外科', '頭部打撲', '頭のケガ', '脳梗塞', 'くも膜下出血', '脳卒中'],
      hi: ['न्यूरोसर्जरी', 'सिर की चोट', 'ब्रेन स्ट्रोक', 'मस्तिष्क आघात']
    },
    clinicCount: 445
  },
  {
    code: 'seishinka',
    ja: '精神科',
    en: 'Psychiatry',
    romaji: 'Seishinka',
    aliases: ['精神神経科', '児童精神科', '老年精神科', '神経精神科'],
    keywords: {
      en: ['psychiatry', 'depression', 'bipolar', 'hallucination', 'delusion', 'psychosis', 'schizophrenia', 'suicidal'],
      ja: ['精神科', '精神神経科', 'うつ病', '双極性障害', '幻覚', '妄想', '統合失調症'],
      hi: ['मनोचिकित्सा', 'डिप्रेशन', 'मानसिक तनाव', 'साइकाइट्री']
    },
    clinicCount: 1502
  },
  {
    code: 'shinryo-naika',
    ja: '心療内科',
    en: 'Psychosomatic Medicine',
    romaji: 'Shinryo Naika',
    aliases: ['心身医療科'],
    keywords: {
      en: ['psychosomatic', 'anxiety', 'panic', 'stress', 'insomnia', 'burnout', 'autonomic', 'palpitation from stress'],
      ja: ['心療内科', 'パニック障害', '不安障害', '自律神経失調症', '不眠', 'ストレス', '適応障害'],
      hi: ['मनोदैहिक चिकित्सा', 'चिंता', 'घबराहट', 'तनाव', 'अनिद्रा']
    },
    clinicCount: 1015
  },
  {
    code: 'suimin-gairai',
    ja: '睡眠外来',
    en: 'Sleep Medicine / Sleep Clinic',
    romaji: 'Suimin Gairai',
    aliases: ['睡眠医療科', '睡眠センター', '睡眠時無呼吸外来'],
    keywords: {
      en: ['sleep clinic', 'sleep apnea', 'snoring', 'insomnia', 'narcolepsy', 'daytime sleepiness'],
      ja: ['睡眠外来', '睡眠時無呼吸症候群', 'いびき', '睡眠障害', '不眠外来', '睡眠センター'],
      hi: ['नींद क्लिनिक', 'स्लीप एप्निया', 'खर्राटे', 'अनिद्रा']
    },
    clinicCount: 2
  },
  {
    code: 'tonyobyo-naibunpi-naika',
    ja: '糖尿病・内分泌内科',
    en: 'Diabetology & Endocrinology',
    romaji: 'Tonyobyo Naibunpi Naika',
    aliases: ['糖尿病内科', '内分泌内科', '代謝内科', '糖尿病・代謝内科', '代謝・内分泌内科', '脂質代謝内科', '内分泌代謝内科'],
    keywords: {
      en: ['diabetes', 'endocrinology', 'thyroid', 'blood sugar', 'hormone', 'hba1c', 'hyperthyroidism', 'hypothyroidism'],
      ja: ['糖尿病・内分泌内科', '糖尿病内科', '内分泌内科', '血糖値', '甲状腺', 'ホルモン', 'バセドウ病', '橋本病'],
      hi: ['मधुमेह', 'डायबिटीज', 'थायरॉयड', 'हार्मोन', 'ब्लड शुगर']
    },
    clinicCount: 229
  },
  {
    code: 'ketsueki-naika',
    ja: '血液内科',
    en: 'Hematology',
    romaji: 'Ketsueki Naika',
    aliases: ['血液科'],
    keywords: {
      en: ['hematology', 'anemia', 'bruising', 'low platelets', 'leukemia', 'abnormal bleeding', 'lymph node swelling'],
      ja: ['血液内科', '貧血', 'あざ', '血小板', '白血病', 'リンパ節の腫れ', '紫斑'],
      hi: ['रक्त रोग विज्ञान', 'हेमेटोलॉजी', 'एनीमिया', 'खून की कमी', 'नील पड़ना']
    },
    clinicCount: 134
  },
  {
    code: 'ketsueki-shuyo-naika',
    ja: '血液・腫瘍内科',
    en: 'Medical Oncology & Hematology',
    romaji: 'Ketsueki Shuyo Naika',
    aliases: ['腫瘍内科', 'がん内科', '臨床腫瘍科'],
    keywords: {
      en: ['oncology', 'cancer', 'chemotherapy', 'tumor', 'malignancy', 'carcinoma'],
      ja: ['血液・腫瘍内科', '腫瘍内科', 'がん', '悪性腫瘍', '抗がん剤', '化学療法'],
      hi: ['कैंसर विज्ञान', 'ऑन्कोलॉजी', 'ट्यूमर', 'कीमोथेरेपी']
    },
    clinicCount: 19
  },
  {
    code: 'riumachi-ka',
    ja: 'リウマチ科',
    en: 'Rheumatology',
    romaji: 'Riumachika',
    aliases: ['リウマチ膠原病科', '膠原病内科'],
    keywords: {
      en: ['rheumatology', 'rheumatism', 'rheumatoid arthritis', 'autoimmune', 'stiff fingers', 'collagen disease', 'lupus'],
      ja: ['リウマチ科', '関節リウマチ', '膠原病', '自己免疫疾患', '朝のこわばり', '手指の腫れ'],
      hi: ['गठिया रोग', 'रुमेटोलॉजी', 'संधिशोथ', 'जोड़ों में अकड़न']
    },
    clinicCount: 547
  },
  {
    code: 'arerugi-ka',
    ja: 'アレルギー科',
    en: 'Allergology',
    romaji: 'Arerugika',
    aliases: ['アレルギー疾患内科'],
    keywords: {
      en: ['allergology', 'allergy', 'hay fever', 'pollen', 'cedar allergy', 'food allergy', 'hives', 'urticaria'],
      ja: ['アレルギー科', '花粉症', 'アレルギー', '蕁麻疹', '食物アレルギー', 'アトピー'],
      hi: ['एलर्जी', 'परागज ज्वर', 'हे फीवर', 'पित्ती']
    },
    clinicCount: 1267
  },
  {
    code: 'hifuka',
    ja: '皮膚科',
    en: 'Dermatology',
    romaji: 'Hifuka',
    aliases: ['皮膚科全般', '小児皮膚科'],
    keywords: {
      en: ['dermatology', 'skin', 'rash', 'itch', 'itching', 'eczema', 'acne', 'pimple', 'blister', 'shingles', 'ringworm'],
      ja: ['皮膚科', '肌', '発疹', 'かゆみ', '湿疹', 'ニキビ', '水ぶくれ', '帯状疱疹', '水虫'],
      hi: ['त्वचा रोग', 'डर्मेटोलॉजी', 'खुजली', 'दाने', 'मुंहासे', 'एक्जिमा']
    },
    clinicCount: 2455
  },
  {
    code: 'keisei-geka',
    ja: '形成外科',
    en: 'Plastic & Reconstructive Surgery',
    romaji: 'Keisei Geka',
    aliases: ['形成外科・再建外科'],
    keywords: {
      en: ['plastic surgery', 'reconstructive surgery', 'scar', 'keloid', 'skin wound', 'laceration suture', 'birthmark', 'mole removal'],
      ja: ['形成外科', '傷跡', 'ケロイド', '切り傷の縫合', 'あざ', 'ほくろ切除', '巻き爪'],
      hi: ['प्लास्टिक सर्जरी', 'घाव के निशान', 'टांके', 'त्वचा पुनर्निर्माण']
    },
    clinicCount: 651
  },
  {
    code: 'biyo-geka',
    ja: '美容外科',
    en: 'Cosmetic Surgery / Aesthetic Surgery',
    romaji: 'Biyo Geka',
    aliases: ['美容形成外科', '美容皮膚科'],
    keywords: {
      en: ['cosmetic surgery', 'aesthetic surgery', 'aesthetic', 'double eyelid', 'liposuction', 'rhinoplasty', 'botox', 'filler'],
      ja: ['美容外科', '美容形成外科', '二重整形', 'ボトックス', 'ヒアルロン酸', 'リフトアップ'],
      hi: ['कॉस्मेटिक सर्जरी', 'सौंदर्य शल्य चिकित्सा']
    },
    clinicCount: 502
  },
  {
    code: 'seikei-geka',
    ja: '整形外科',
    en: 'Orthopedics / Orthopedic Surgery',
    romaji: 'Seikei Geka',
    aliases: ['整形外科・骨折'],
    keywords: {
      en: ['orthopedics', 'orthopedic', 'bone', 'joint', 'fracture', 'sprain', 'back pain', 'lumbar', 'knee pain', 'shoulder', 'neck pain'],
      ja: ['整形外科', '骨折', '捻挫', '腰痛', 'ぎっくり腰', 'ひざの痛み', '肩こり', '五十肩', '関節痛'],
      hi: ['अस्थि रोग', 'हड्डी रोग', 'ऑर्थोपेडिक्स', 'कमर दर्द', 'मोच', 'हड्डी टूटना']
    },
    clinicCount: 1688
  },
  {
    code: 'geka',
    ja: '外科',
    en: 'General Surgery',
    romaji: 'Geka',
    aliases: ['一般外科'],
    keywords: {
      en: ['general surgery', 'surgery', 'cut', 'deep wound', 'burn', 'trauma', 'lump', 'abscess', 'hernia'],
      ja: ['外科', '外傷', '切り傷', 'やけど', '創傷', 'しこり', '膿瘍', 'ヘルニア'],
      hi: ['सामान्य शल्य चिकित्सा', 'सर्जरी', 'घाव', 'जलना', 'चोट']
    },
    clinicCount: 1330
  },
  {
    code: 'pain-clinic-masuika',
    ja: 'ペインクリニック(麻酔科)',
    en: 'Pain Clinic (Anesthesiology)',
    romaji: 'Pein Kurinikku (Masuika)',
    aliases: ['麻酔科', 'ペインクリニック', 'ペインクリニック内科', 'ペインクリニック外科'],
    keywords: {
      en: ['pain clinic', 'chronic pain', 'anesthesiology', 'nerve block', 'sciatica', 'post-herpetic neuralgia', 'intractable pain'],
      ja: ['ペインクリニック', '麻酔科', '神経ブロック', '慢性疼痛', '坐骨神経痛', '帯状疱疹後神経痛', '頑固な痛み'],
      hi: ['दर्द निवारण क्लिनिक', 'क्रोनिक दर्द', 'नर्व ब्लॉक', 'पुराना दर्द']
    },
    clinicCount: 360
  },
  {
    code: 'rihabiriteshon-ka',
    ja: 'リハビリテーション科',
    en: 'Rehabilitation Medicine',
    romaji: 'Rihabiriteshon-ka',
    aliases: ['リハビリ科', 'リハビリテーション'],
    keywords: {
      en: ['rehabilitation', 'physical therapy', 'physiotherapy', 'occupational therapy', 'stroke recovery', 'mobility training'],
      ja: ['リハビリテーション科', 'リハビリ科', '理学療法', '作業療法', '歩行訓練', '脳卒中後リハビリ'],
      hi: ['पुनर्वास चिकित्सा', 'फिजियोथेरेपी', 'व्यायाम चिकित्सा']
    },
    clinicCount: 1296
  },
  {
    code: 'ganka',
    ja: '眼科',
    en: 'Ophthalmology',
    romaji: 'Ganka',
    aliases: ['眼科一般'],
    keywords: {
      en: ['ophthalmology', 'eye', 'eyes', 'vision', 'blurred vision', 'red eye', 'itchy eye', 'conjunctivitis', 'glaucoma', 'cataract', 'eyeball'],
      ja: ['眼科', '目', '目の痛み', '充血', 'かすみ目', '視力低下', '結膜炎', 'ものもらい', '白内障', '緑内障'],
      hi: ['नेत्र रोग', 'आंखें', 'दृष्टि', 'आंखों में लाली', 'मोतियाबिंद']
    },
    clinicCount: 1264
  },
  {
    code: 'jibiinkoka',
    ja: '耳鼻いんこう科',
    en: 'Otolaryngology / ENT',
    romaji: 'Jibiinkoka',
    aliases: ['耳鼻咽喉科', '耳鼻科', '耳鼻いんこう', '頭頸部・耳鼻いんこう科', '小児耳鼻いんこう科'],
    keywords: {
      en: ['ent', 'ear', 'nose', 'throat', 'otolaryngology', 'hearing', 'tinnitus', 'earache', 'sinus', 'sinusitis', 'tonsil', 'loss of smell'],
      ja: ['耳鼻いんこう科', '耳鼻咽喉科', '耳鼻科', '耳鳴り', '難聴', '耳の痛み', '鼻水', '鼻づまり', '副鼻腔炎', 'のどの痛み', '咽頭痛'],
      hi: ['कान नाक गला रोग', 'ईएनटी', 'कान दर्द', 'गले में खराश', 'साइनस']
    },
    clinicCount: 949
  },
  {
    code: 'shika',
    ja: '歯科',
    en: 'Dentistry',
    romaji: 'Shika',
    aliases: ['歯科口腔外科', '小児歯科', '矯正歯科'],
    keywords: {
      en: ['dentistry', 'dental', 'dentist', 'tooth', 'teeth', 'toothache', 'gum', 'gums', 'cavity', 'jaw pain', 'wisdom tooth'],
      ja: ['歯科', '歯医者', '虫歯', '歯痛', '歯周病', '歯ぐき', '親知らず', '顎関節症'],
      hi: ['दंत चिकित्सा', 'दांत दर्द', 'मसूड़े', 'दांत', 'डेंटिस्ट']
    },
    clinicCount: 8325
  },
  {
    code: 'kansensho-naika',
    ja: '感染症内科',
    en: 'Infectious Diseases',
    romaji: 'Kansensho Naika',
    aliases: ['感染症科', '性感染症内科'],
    keywords: {
      en: ['infectious diseases', 'tropical disease', 'travel clinic', 'malaria', 'dengue', 'tuberculosis', 'adult vaccination', 'travel medicine'],
      ja: ['感染症内科', '感染症科', '渡航者外来', 'トラベルクリニック', '予防接種', 'マラリア', '結核'],
      hi: ['संक्रामक रोग', 'इन्फेक्शियस डिजीज', 'टीकाकरण', 'ट्रैवल क्लिनिक']
    },
    clinicCount: 100
  },
  {
    code: 'kyukyuka',
    ja: '救急科',
    en: 'Emergency Medicine',
    romaji: 'Kyukyuka',
    aliases: ['救命救急科', '救急外来'],
    keywords: {
      en: ['emergency medicine', 'emergency room', 'acute trauma', 'urgent triage', 'resuscitation'],
      ja: ['救急科', '救急外来', '救命救急', 'ER', '急性外傷'],
      hi: ['आपातकालीन चिकित्सा', 'इमरजेंसी मेडिसिन', 'ईआर']
    },
    clinicCount: 129
  }
];

// Compatibility alias for existing code
export const VALID_DEPARTMENTS: DepartmentInfo[] = CANONICAL_DEPARTMENTS.map((d) => ({
  ja: d.ja,
  en: d.en,
  keywords: [...d.keywords.en, ...d.keywords.ja, ...d.keywords.hi, ...d.aliases]
}));

// Precomputed total clinic counts for canonical name + aliases based on departments_found.txt
export const DEPARTMENT_TOTAL_CLINIC_COUNTS: Record<string, number> = {
  内科: 7638,
  総合診療科: 3,
  呼吸器内科: 1064,
  循環器内科: 1807,
  心臓血管外科: 212,
  消化器内科: 2776,
  肛門外科: 380,
  腎臓内科: 594,
  泌尿器科: 843,
  産科: 562,
  婦人科: 1025,
  乳腺外科: 266,
  小児科: 2293,
  脳神経内科: 737,
  脳神経外科: 458,
  精神科: 1659,
  心療内科: 1015,
  睡眠外来: 4,
  '糖尿病・内分泌内科': 1475,
  血液内科: 134,
  '血液・腫瘍内科': 82,
  リウマチ科: 549,
  アレルギー科: 1430,
  皮膚科: 2649,
  形成外科: 651,
  美容外科: 1446,
  整形外科: 1688,
  外科: 1330,
  'ペインクリニック(麻酔科)': 466,
  リハビリテーション科: 1296,
  眼科: 1264,
  耳鼻いんこう科: 1174,
  歯科: 22950,
  感染症内科: 173,
  救急科: 129
};

/**
 * Returns sum of clinicCount for canonical name and all its aliases
 */
export function getTotalDepartmentClinicCount(deptNameOrCode: string): number {
  const dept = getCanonicalDepartment(deptNameOrCode);
  if (!dept) return 0;
  return DEPARTMENT_TOTAL_CLINIC_COUNTS[dept.ja] ?? dept.clinicCount;
}

/**
 * Checks whether text matches a keyword.
 * Uses WHOLE-WORD regex matching for Latin keywords to prevent false positives
 * (e.g. preventing 'ear' matching 'heart' or 'kid' matching 'kidney').
 * Uses substring matching for Japanese and Hindi / Unicode scripts.
 */
export function matchesKeyword(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;

  // Check if keyword is pure Latin / ASCII words
  const isLatin = /^[a-z0-9\s\-]+$/i.test(kw);
  if (isLatin) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
    return regex.test(text);
  } else {
    return text.toLowerCase().includes(kw);
  }
}

interface MatchCandidate {
  target: string;
  dept: CanonicalDepartment;
  isAlias: boolean;
}

// Build candidates list sorted longest-name first for substring matching
const CANDIDATES_LONGEST_FIRST: MatchCandidate[] = (() => {
  const list: MatchCandidate[] = [];
  for (const dept of CANONICAL_DEPARTMENTS) {
    list.push({ target: dept.ja, dept, isAlias: false });
    list.push({ target: dept.en, dept, isAlias: false });
    for (const alias of dept.aliases) {
      list.push({ target: alias, dept, isAlias: true });
    }
  }
  return list.sort((a, b) => b.target.length - a.target.length);
})();

/**
 * Validates any department string against the canonical departments.
 * Order:
 * 1. Exact ja / en / alias matches first.
 * 2. Substring matches with candidates sorted LONGEST-NAME FIRST (e.g. 循環器内科 wins over 内科).
 * 3. Keyword matching.
 * Returns formatted label: e.g. "内科 (Internal Medicine)"
 */
export function validateDepartment(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') {
    return '内科 (Internal Medicine)';
  }

  let clean = raw.trim();

  // Strip negations so "not pregnant" doesn't falsely match Obstetrics
  clean = clean.replace(/\b(not|no|never|isn't|is not)\s+(pregnant|pregnancy)\b/gi, 'not_pregnant');
  clean = clean.replace(/\b(no|not|none)\s+(allergies|allergy)\b/gi, 'no_allergies');
  const cleanLower = clean.toLowerCase();

  // 1. Exact ja / en / alias matches first
  for (const dept of CANONICAL_DEPARTMENTS) {
    if (
      cleanLower === dept.ja.toLowerCase() ||
      cleanLower === dept.en.toLowerCase() ||
      dept.aliases.some((a) => cleanLower === a.toLowerCase())
    ) {
      return `${dept.ja} (${dept.en})`;
    }
  }

  // 2. Substring matches sorted LONGEST-NAME FIRST (so 循環器内科 wins over 内科)
  for (const cand of CANDIDATES_LONGEST_FIRST) {
    const candLower = cand.target.toLowerCase();
    if (cleanLower.includes(candLower)) {
      return `${cand.dept.ja} (${cand.dept.en})`;
    }
  }

  // 3. Whole-word Latin / substring Japanese keyword matching
  for (const cand of CANDIDATES_LONGEST_FIRST) {
    const allKw = [...cand.dept.keywords.en, ...cand.dept.keywords.ja, ...cand.dept.keywords.hi];
    for (const kw of allKw) {
      if (matchesKeyword(clean, kw)) {
        return `${cand.dept.ja} (${cand.dept.en})`;
      }
    }
  }

  // Default fallback
  return '内科 (Internal Medicine)';
}

/**
 * Extracts the canonical Japanese department name for DB querying.
 * Order:
 * 1. Exact ja / en / alias match first.
 * 2. Substring match sorted LONGEST-NAME FIRST (so 循環器内科 wins over 内科).
 * e.g. "循環器内科 (Cardiology)" -> "循環器内科", "内科" -> "内科"
 */
export function getJapaneseDepartmentName(dept: string): string {
  if (!dept) return '内科';
  const target = dept.trim();
  const targetLower = target.toLowerCase();

  // 1. Exact ja / en / alias match first
  for (const d of CANONICAL_DEPARTMENTS) {
    if (
      targetLower === d.ja.toLowerCase() ||
      targetLower === d.en.toLowerCase() ||
      d.aliases.some((a) => targetLower === a.toLowerCase())
    ) {
      return d.ja;
    }
  }

  // 2. Substring match sorted LONGEST-NAME FIRST
  for (const cand of CANDIDATES_LONGEST_FIRST) {
    if (targetLower.includes(cand.target.toLowerCase())) {
      return cand.dept.ja;
    }
  }

  return target.split(/[\s(（]/)[0].trim() || '内科';
}

/**
 * Look up canonical department record by name or code
 */
export function getCanonicalDepartment(nameOrCode: string): CanonicalDepartment | undefined {
  if (!nameOrCode) return undefined;
  const target = nameOrCode.trim().toLowerCase();
  return CANONICAL_DEPARTMENTS.find(
    (d) =>
      d.code.toLowerCase() === target ||
      d.ja.toLowerCase() === target ||
      d.en.toLowerCase() === target ||
      d.aliases.some((a) => a.toLowerCase() === target)
  );
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
