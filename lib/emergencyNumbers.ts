/**
 * Emergency and Crisis Phone Numbers Configuration for Japan
 * Check official sources before relying on these numbers.
 */

export interface EmergencyService {
  id: string;
  name: {
    en: string;
    ja: string;
    hi: string;
  };
  number: string;
  telUri: string;
  altNumber?: string;
  altTelUri?: string;
  hours: {
    en: string;
    ja: string;
    hi: string;
  };
  description: {
    en: string;
    ja: string;
    hi: string;
  };
  badge: {
    en: string;
    ja: string;
    hi: string;
  };
  isPrimary?: boolean;
  category: 'ambulance' | 'police' | 'consultation' | 'helpline' | 'mental-health';
  officialSource: string;
  lastVerified: string;
}

export const EMERGENCY_NUMBERS: EmergencyService[] = [
  {
    id: 'ambulance-119',
    name: {
      en: 'Ambulance & Fire Department',
      ja: '救急・消防（119番）',
      hi: 'एम्बुलेंस और अग्निशमन सेवा'
    },
    number: '119',
    telUri: 'tel:119',
    hours: {
      en: '24 hours / 365 days',
      ja: '24時間365日対応',
      hi: '24 घंटे / 365 दिन'
    },
    description: {
      en: 'Life-threatening medical emergencies, acute injury, cardiac arrest, stroke, severe bleeding, or fire.',
      ja: '命に関わる急病、意識障害、激しい胸痛・呼吸困難、重傷、火災。',
      hi: 'जानलेवा आपात स्थिति, दिल का दौरा, स्ट्रोक, गंभीर चोट, सांस लेने में तकलीफ या आग।'
    },
    badge: {
      en: 'Immediate Emergency',
      ja: '緊急・即時',
      hi: 'तत्काल आपातकाल'
    },
    isPrimary: true,
    category: 'ambulance',
    officialSource: 'Fire and Disaster Management Agency (総務省消防庁) & Tokyo Fire Department',
    lastVerified: 'June 2026'
  },
  {
    id: 'police-110',
    name: {
      en: 'Police Emergency',
      ja: '警察（110番）',
      hi: 'पुलिस आपातकालीन सेवा'
    },
    number: '110',
    telUri: 'tel:110',
    hours: {
      en: '24 hours / 365 days',
      ja: '24時間365日対応',
      hi: '24 घंटे / 365 दिन'
    },
    description: {
      en: 'Traffic accidents, crime reports, physical assault, dangerous incidents, or immediate police assistance.',
      ja: '交通事故、事件、犯罪被害、不審者、危険な事態の警察通報。',
      hi: 'सड़क दुर्घटना, अपराध, हमला या तत्काल पुलिस सहायता के लिए।'
    },
    badge: {
      en: 'Police Dispatch',
      ja: '警察通報',
      hi: 'पुलिस सेवा'
    },
    category: 'police',
    officialSource: 'National Police Agency of Japan (警察庁)',
    lastVerified: 'June 2026'
  },
  {
    id: 'medical-consult-7119',
    name: {
      en: 'Tokyo Emergency Consultation Center (#7119)',
      ja: '東京消防庁 救急相談センター（#7119）',
      hi: 'टोक्यो आपातकालीन चिकित्सा परामर्श (#7119)'
    },
    number: '#7119',
    telUri: 'tel:%237119',
    altNumber: '03-3212-2323',
    altTelUri: 'tel:0332122323',
    hours: {
      en: '24 hours / 365 days',
      ja: '24時間365日対応',
      hi: '24 घंटे / 365 दिन'
    },
    description: {
      en: 'Unsure whether you need an ambulance or an urgent clinic visit? Doctors and nurses triage symptoms and advise on ER care.',
      ja: '救急車を呼ぶべきか迷った際、医師・看護師が電話で受診の緊急性を判断。',
      hi: 'यदि आप निश्चित नहीं हैं कि एम्बुलेंस चाहिए या क्लिनिक जाना है, तो डॉक्टर और नर्स सहायता करते हैं।'
    },
    badge: {
      en: 'Nurse Triage / ER Advice',
      ja: '救急トリアージ相談',
      hi: 'चिकित्सा सलाह'
    },
    category: 'consultation',
    officialSource: 'Tokyo Fire Department Emergency Medical Information Center (東京消防庁)',
    lastVerified: 'June 2026'
  },
  {
    id: 'japan-helpline',
    name: {
      en: 'Japan Helpline (Toll-Free Nationwide)',
      ja: 'ジャパン・ヘルプライン（全国24時間）',
      hi: 'जापान हेल्पलाइन (24 घंटे अंग्रेजी)'
    },
    number: '0570-000-911',
    telUri: 'tel:0570-000-911',
    hours: {
      en: '24 hours / 365 days (English)',
      ja: '24時間365日（英語対応）',
      hi: '24 घंटे / 365 दिन (अंग्रेजी)'
    },
    description: {
      en: 'Nationwide 24-hour non-profit helpline offering English-language support for emergencies, crisis guidance, and daily assistance in Japan.',
      ja: '外国人向け全国24時間緊急・生活相談電話。英語での相談対応。',
      hi: 'जापान में आपात स्थिति, संकट मार्गदर्शन और सहायता के लिए 24 घंटे की अंग्रेजी हेल्पलाइन।'
    },
    badge: {
      en: '24h English Helpline',
      ja: '24時間英語対応',
      hi: '24 घंटे अंग्रेजी'
    },
    category: 'helpline',
    officialSource: 'Japan Helpline Foundation (NPO)',
    lastVerified: 'June 2026'
  },
  {
    id: 'himawari-medical',
    name: {
      en: 'Himawari Tokyo Medical Information Service',
      ja: '東京都医療情報案内サービス「ひまわり」',
      hi: 'हिमावारी टोक्यो चिकित्सा सूचना सेवा'
    },
    number: '03-5285-8181',
    telUri: 'tel:0352858181',
    hours: {
      en: 'Daily 9:00 – 20:00 (English, Chinese, Korean, Thai, Spanish)',
      ja: '毎日 9:00〜20:00（外国語対応）',
      hi: 'प्रतिदिन सुबह 9:00 से रात 8:00 तक (अंग्रेजी व अन्य भाषाएँ)'
    },
    description: {
      en: 'Official Tokyo Metropolitan service providing multilingual hospital referrals and emergency medical translation over the phone.',
      ja: '外国語で受診可能な東京都内の医療機関の案内および緊急医療電話通訳。',
      hi: 'टोक्यो मेट्रोपॉलिटन सेवा जो अंग्रेजी बोलने वाले अस्पतालों की जानकारी और फोन पर अनुवाद प्रदान करती है।'
    },
    badge: {
      en: 'Multilingual Referrals',
      ja: '多言語医療案内',
      hi: 'बहुभाषी चिकित्सा सहायता'
    },
    category: 'consultation',
    officialSource: 'Tokyo Metropolitan Government Bureau of Public Health (東京都保健医療局)',
    lastVerified: 'June 2026'
  },
  {
    id: 'tell-lifeline',
    name: {
      en: 'TELL Lifeline (Mental Health & Crisis Support)',
      ja: 'TELL ライフライン（心と命の相談）',
      hi: 'TELL लाइफलाइन (मानसिक स्वास्थ्य सहायता)'
    },
    number: '03-5774-0992',
    telUri: 'tel:0357740992',
    hours: {
      en: 'Daily 9:00 – 23:00 (Free & Confidential English)',
      ja: '毎日 9:00〜23:00（英語・無料・秘密厳守）',
      hi: 'प्रतिदिन सुबह 9:00 से रात 11:00 तक (गोपनीय अंग्रेजी)'
    },
    description: {
      en: 'Free, confidential crisis counseling and mental health support for international residents and foreign nationals in Japan.',
      ja: '日本在住外国人向けの無料・秘密厳守のメンタルヘルス・危機相談ホットライン。',
      hi: 'जापान में अंतरराष्ट्रीय निवासियों के लिए निःशुल्क और गोपनीय मानसिक स्वास्थ्य परामर्श हेल्पलाइन।'
    },
    badge: {
      en: 'Mental Health Support',
      ja: '心の健康・相談',
      hi: 'मानसिक स्वास्थ्य'
    },
    category: 'mental-health',
    officialSource: 'TELL Japan (Certified Non-Profit Organization)',
    lastVerified: 'June 2026'
  }
];
