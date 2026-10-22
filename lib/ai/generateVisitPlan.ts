export interface VisitPlanRequest {
  clinicName: string;
  clinicAddress: string;
  clinicType: string;
  symptomSummary: string;
  hasInsurance: boolean;
  insuranceType?: string;
}

export interface VisitPlanResult {
  checklist: {
    item: string;
    item_ja: string;
    mandatory: boolean;
    reason: string;
  }[];
  steps: {
    order: number;
    title_en: string;
    title_ja: string;
    action: string;
    tips: string;
  }[];
  costEstimate: {
    copayPercentage: string;
    consultationFee: string;
    testingFeeEstimate: string;
    pharmacyMedicationEstimate: string;
    totalExpectedRange: string;
    explanation: string;
  };
  navigationUrl: string;
}

export function generateVisitPlan(request: VisitPlanRequest): VisitPlanResult {
  const isHospital = request.clinicType?.toLowerCase() === 'hospital';
  const hasInsurance = request.hasInsurance;

  // 1. Checklist of what to bring
  const checklist = [
    {
      item: 'Health Insurance Card or My Number Card',
      item_ja: '健康保険証 または マイナンバーカード',
      mandatory: true,
      reason: hasInsurance 
        ? 'Required for the 30% copay rate. Without this, you will be billed 100% upfront.'
        : 'Crucial if you possess Japanese insurance.'
    },
    {
      item: 'Residence Card (Zairyu Card) / Photo ID',
      item_ja: '在留カード / 身分証明書',
      mandatory: true,
      reason: 'Standard identity verification for foreign residents in Japan.'
    },
    {
      item: 'Cash (¥10,000 in bills recommended)',
      item_ja: '現金（1万円程度推奨）',
      mandatory: true,
      reason: 'Many neighborhood clinics and dispensing pharmacies do NOT accept credit cards. Always carry cash.'
    },
    {
      item: 'Medication Record Notebook or Current Meds',
      item_ja: 'お薬手帳 または 服用中の薬',
      mandatory: false,
      reason: 'Essential if you are taking medications from India or other clinics to prevent adverse drug interactions.'
    },
    {
      item: 'MedNavi Bilingual Intake Card (On your phone)',
      item_ja: '問診票サマリー画面',
      mandatory: true,
      reason: 'Show directly to the reception staff to bypass language hesitation.'
    }
  ];

  if (isHospital) {
    checklist.push({
      item: 'Referral Letter (Shoukaijou) if available',
      item_ja: '紹介状（診療情報提供書）',
      mandatory: false,
      reason: 'Hospitals with 200+ beds charge an extra fee (Sentei Ryouyouhi, approx. ¥5,000–¥7,700) if visiting without a referral letter.'
    });
  }

  // 2. Step by step workflow
  const steps = [
    {
      order: 1,
      title_en: 'Arrival & Reception Desk',
      title_ja: '受付（うけつけ / Uketsuke）',
      action: 'Hand over your Health Insurance Card and say: "Hajimete desu" (初めてです - This is my first time). Show your MedNavi Japanese intake summary on your phone.',
      tips: 'You will be asked to fill out a paper questionnaire (問診票 / Monshinhyo) or they may use your screen summary.'
    },
    {
      order: 2,
      title_en: 'Waiting Room',
      title_ja: '待合室（まちあいしつ / Machiaishitsu）',
      action: 'Take a seat and listen for your surname or reception number being called over the speaker.',
      tips: 'Turn your mobile phone to silent mode (マナーモード) as is customary in Japanese medical waiting rooms.'
    },
    {
      order: 3,
      title_en: 'Doctor Consultation',
      title_ja: '診察室（しんさつしつ / Shinsatsushitsu）',
      action: 'Enter when called. The physician will review your symptoms, listen to your chest or examine affected areas.',
      tips: 'You can ask questions using the MedNavi bilingual questions guide.'
    },
    {
      order: 4,
      title_en: 'Tests or In-clinic Treatment (If needed)',
      title_ja: '検査・処置（けんさ・しょち）',
      action: 'If flu/COVID tests, blood draw, or X-rays are ordered, a nurse will guide you to the testing room.',
      tips: 'Tests take around 10–20 minutes to yield immediate results.'
    },
    {
      order: 5,
      title_en: 'Cashier & Prescription Voucher',
      title_ja: '会計・処方箋（かいけい・しょほうせん）',
      action: 'Wait at the lobby for payment. Pay your 30% copay, collect your receipt (領収書) and paper prescription voucher (処方せん).',
      tips: 'Prescription vouchers are valid for only 4 days including the date of issue. Do not lose this paper.'
    },
    {
      order: 6,
      title_en: 'Visit the Dispensing Pharmacy',
      title_ja: '調剤薬局（ちょうざいやっきょく）',
      action: 'Walk into any nearby pharmacy (usually right next door to the clinic) and hand them your prescription sheet and insurance card.',
      tips: 'The pharmacist will prepare your medications in separate morning/noon/evening packets with clear instructions.'
    }
  ];

  // 3. Accurate Cost Calculation based on MHLW points
  const copay = hasInsurance ? '30% (Standard National Health Insurance)' : '100% (No Japanese Insurance)';
  let totalMin = hasInsurance ? 2000 : 7000;
  let totalMax = hasInsurance ? 4500 : 15000;

  if (isHospital) {
    totalMin += hasInsurance ? 3000 : 8000;
    totalMax += hasInsurance ? 7000 : 20000;
  }

  const costEstimate = {
    copayPercentage: copay,
    consultationFee: hasInsurance ? '¥860 - ¥1,100 (Initial consultation)' : '¥2,880 - ¥3,500',
    testingFeeEstimate: hasInsurance ? '¥600 - ¥2,000 (If basic blood/swab is taken)' : '¥2,000 - ¥6,500',
    pharmacyMedicationEstimate: hasInsurance ? '¥800 - ¥1,800 (Separate payment at pharmacy)' : '¥2,500 - ¥6,000',
    totalExpectedRange: `¥${totalMin.toLocaleString()} - ¥${totalMax.toLocaleString()}`,
    explanation: hasInsurance
      ? 'Under Japanese NHI / Shakai Hoken, medical prices are legally standardized across the nation. A standard clinic visit with 3 days of medicine typically costs between ¥2,000 and ¥3,500 total.'
      : 'Without Japanese public insurance, you are liable for 100% of all procedural points plus possible international administrative handling fees.'
  };

  const navigationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${request.clinicName} ${request.clinicAddress}`
  )}`;

  return {
    checklist,
    steps,
    costEstimate,
    navigationUrl
  };
}
