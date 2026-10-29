/**
 * Group-specific questions for the MedNavi Symptom Chatbot.
 *
 * STATUS: DRAFT. Batch 1 of 5 (groups g01, g02, g03, g05, g12, g16, g26, g28).
 * Every question, option, urgency flag and routing rule MUST be reviewed by a
 * doctor or pharmacist before real patients use it. Hindi text is
 * machine-written and must be read by a Hindi speaker.
 *
 * How the data is used (intended; the chat engine must read this shape):
 * - Asked after the emergency tick-list and before the shared questions
 *   (duration, severity, age group, medicines, allergies).
 * - Max 4 questions per group, so the total stays within the 10-question cap.
 * - option.label.ja and option.label.en go into the intake note as typed here.
 * - option.urgency: 'now' = send to the 119 page, 'today' = see a doctor today,
 *   'days' = within a few days. Chosen options can only RAISE urgency.
 * - option.useBackupDept: if chosen, use the group's backup department.
 * - No AI is involved in any of this.
 *
 * This file must NOT import from symptomGroups.ts (that file imports this one).
 */

export interface Ml {
  en: string;
  ja: string;
  hi: string;
}

export interface QuestionOption {
  id: string;
  label: Ml;
  urgency?: 'now' | 'today' | 'days';
  useBackupDept?: boolean;
}

export interface GroupQuestion {
  id: string;
  kind: 'single' | 'multi';
  text: Ml;
  /** Heading used in the intake note, e.g. 随伴症状 / Associated symptoms */
  noteLabel: { ja: string; en: string };
  options: QuestionOption[];
}

const m = (en: string, ja: string, hi: string): Ml => ({ en, ja, hi });
const o = (
  id: string,
  en: string,
  ja: string,
  hi: string,
  extra: Partial<Pick<QuestionOption, 'urgency' | 'useBackupDept'>> = {}
): QuestionOption => ({ id, label: m(en, ja, hi), ...extra });

export const GROUP_QUESTIONS: Record<string, GroupQuestion[]> = {
  // g01 Fever, cold and flu -> 内科
  g01: [
    {
      id: 'g01q1',
      kind: 'single',
      text: m('What is the highest temperature you measured?', '測った中で一番高い体温はどれくらいですか？', 'आपने सबसे अधिक तापमान कितना मापा?'),
      noteLabel: { ja: '最高体温', en: 'Highest temperature' },
      options: [
        o('under375', 'Below 37.5°C', '37.5℃未満', '37.5°C से कम'),
        o('375_384', '37.5 to 38.4°C', '37.5〜38.4℃', '37.5 से 38.4°C'),
        o('385_399', '38.5 to 39.9°C', '38.5〜39.9℃', '38.5 से 39.9°C'),
        o('over40', '40°C or higher', '40℃以上', '40°C या अधिक', { urgency: 'today' }),
        o('notmeasured', 'I have not measured it', '測っていない', 'मैंने नहीं मापा'),
      ],
    },
    {
      id: 'g01q2',
      kind: 'multi',
      text: m('Which other symptoms do you have?', '他にどんな症状がありますか？（複数選択可）', 'आपको और कौन से लक्षण हैं? (एक से अधिक चुन सकते हैं)'),
      noteLabel: { ja: '随伴症状', en: 'Associated symptoms' },
      options: [
        o('sorethroat', 'Sore throat', 'のどの痛み', 'गले में दर्द'),
        o('cough', 'Cough', '咳', 'खांसी'),
        o('runnynose', 'Runny or blocked nose', '鼻水・鼻づまり', 'नाक बहना या बंद होना'),
        o('bodyache', 'Body or joint aches', '関節痛・筋肉痛', 'बदन या जोड़ों में दर्द'),
        o('gi', 'Vomiting or diarrhoea', '嘔吐・下痢', 'उल्टी या दस्त'),
        o('rash', 'Skin rash', '発疹', 'त्वचा पर दाने', { urgency: 'today' }),
        o('none', 'None of these', '特になし', 'इनमें से कोई नहीं'),
      ],
    },
    {
      id: 'g01q3',
      kind: 'single',
      text: m('Any recent contact or travel?', '最近、感染の心当たりや渡航歴はありますか？', 'हाल में कोई संपर्क या यात्रा हुई है?'),
      noteLabel: { ja: '感染の心当たり・渡航歴', en: 'Contact / travel' },
      options: [
        o('contact', 'Someone around me has flu or COVID', '周囲にインフルエンザ・コロナの人がいる', 'आसपास किसी को फ्लू या कोविड है'),
        o('abroad', 'Returned from abroad in the last 3 weeks', '3週間以内に海外から帰国した', '3 सप्ताह के भीतर विदेश से लौटा/लौटी', { urgency: 'today' }),
        o('neither', 'Neither', 'どちらもない', 'दोनों नहीं'),
      ],
    },
  ],

  // g02 Cough and breathing -> 呼吸器内科 / 内科
  g02: [
    {
      id: 'g02q1',
      kind: 'single',
      text: m('What is your cough like?', '咳はどのような咳ですか？', 'आपकी खांसी कैसी है?'),
      noteLabel: { ja: '咳の性状', en: 'Type of cough' },
      options: [
        o('dry', 'Dry cough', '乾いた咳', 'सूखी खांसी'),
        o('phlegm', 'Cough with phlegm', '痰がからむ咳', 'बलगम वाली खांसी'),
        o('wheeze', 'Wheezing or whistling when breathing', 'ヒューヒュー、ゼーゼーする', 'सांस लेते समय सीटी जैसी आवाज'),
        o('blood', 'Blood in the phlegm', '痰に血が混じる', 'बलगम में खून', { urgency: 'today' }),
      ],
    },
    {
      id: 'g02q2',
      kind: 'single',
      text: m('Do you feel short of breath?', '息苦しさはありますか？', 'क्या आपको सांस फूलती है?'),
      noteLabel: { ja: '息苦しさ', en: 'Shortness of breath' },
      options: [
        o('none', 'No', 'ない', 'नहीं'),
        o('exertion', 'Only when walking or climbing stairs', '歩いたり階段を上ると息切れする', 'चलने या सीढ़ियां चढ़ने पर ही'),
        o('rest', 'Even when resting', '安静にしていても息苦しい', 'आराम करते समय भी', { urgency: 'today' }),
      ],
    },
    {
      id: 'g02q3',
      kind: 'single',
      text: m('Which describes you best?', '当てはまるものを選んでください', 'इनमें से कौन सा आप पर लागू होता है?'),
      noteLabel: { ja: '背景', en: 'Background' },
      options: [
        o('coldlike', 'Cold-like illness (fever, sore throat, runny nose) for a few days', '数日前から風邪のような症状（発熱・のどの痛み・鼻水）がある', 'कुछ दिनों से सर्दी जैसे लक्षण (बुखार, गला दर्द, नाक बहना)', { useBackupDept: true }),
        o('asthma', 'I have asthma or COPD', '喘息・COPDと言われている', 'मुझे अस्थमा या सीओपीडी है'),
        o('smoker', 'I smoke', '喫煙している', 'मैं धूम्रपान करता/करती हूं'),
        o('none', 'None of these', '特になし', 'इनमें से कोई नहीं'),
      ],
    },
  ],

  // g03 Heart, chest and blood pressure -> 循環器内科
  g03: [
    {
      id: 'g03q1',
      kind: 'single',
      text: m('What is the main problem?', '一番の困りごとはどれですか？', 'मुख्य समस्या क्या है?'),
      noteLabel: { ja: '主な症状', en: 'Main problem' },
      options: [
        o('chestpain', 'Chest pain or pressure', '胸の痛み・圧迫感', 'सीने में दर्द या दबाव', { urgency: 'today' }),
        o('palpitation', 'Heart racing or skipping beats', '動悸・脈の乱れ', 'दिल तेज धड़कना या धड़कन छूटना'),
        o('highbp', 'High blood pressure reading', '血圧が高い', 'ब्लड प्रेशर ज्यादा आया'),
        o('other', 'Something else about my heart', 'その他（心臓に関すること）', 'दिल से जुड़ी कोई और बात'),
      ],
    },
    {
      id: 'g03q2',
      kind: 'single',
      text: m('When does it happen?', 'どんな時に起こりますか？', 'यह कब होता है?'),
      noteLabel: { ja: '起こる状況', en: 'When it happens' },
      options: [
        o('exertion', 'When I walk or exert myself', '動いた時・運動した時', 'चलने या मेहनत करने पर', { urgency: 'today' }),
        o('rest', 'At rest or at night', '安静時・夜間', 'आराम करते समय या रात में', { urgency: 'today' }),
        o('sweat', 'With cold sweat, nausea, or pain spreading to arm or jaw', '冷や汗・吐き気・腕や顎への痛みを伴う', 'ठंडे पसीने, मतली या हाथ/जबड़े में दर्द के साथ', { urgency: 'now' }),
        o('random', 'Comes and goes, no clear pattern', '一定せず、時々起こる', 'कभी-कभी, कोई तय पैटर्न नहीं'),
      ],
    },
    {
      id: 'g03q3',
      kind: 'single',
      text: m('Do you have a known heart or blood pressure condition?', '心臓や血圧の持病はありますか？', 'क्या आपको दिल या बीपी की कोई बीमारी है?'),
      noteLabel: { ja: '心臓・血圧の持病', en: 'Heart / BP history' },
      options: [
        o('bpmeds', 'High blood pressure, on medicine', '高血圧で薬を飲んでいる', 'हाई बीपी है, दवा ले रहा/रही हूं'),
        o('heartdisease', 'Heart disease or a past heart problem', '心臓病・心臓の病歴がある', 'दिल की बीमारी या पहले दिल की समस्या'),
        o('family', 'Family history of heart disease', '家族に心臓病の人がいる', 'परिवार में दिल की बीमारी का इतिहास'),
        o('none', 'None', 'なし', 'कोई नहीं'),
      ],
    },
  ],

  // g05 Stomach and digestion -> 消化器内科
  g05: [
    {
      id: 'g05q1',
      kind: 'single',
      text: m('Where does it hurt most?', '一番痛い（つらい）のはどこですか？', 'सबसे ज्यादा दर्द कहां होता है?'),
      noteLabel: { ja: '痛む場所', en: 'Location' },
      options: [
        o('upper', 'Upper belly / above the navel', '上腹部（みぞおち）', 'पेट का ऊपरी हिस्सा'),
        o('lowerright', 'Lower right belly', '右下腹部', 'पेट का निचला दायां हिस्सा', { urgency: 'today' }),
        o('lowerleft', 'Lower or left belly', '下腹部・左下腹部', 'पेट का निचला या बायां हिस्सा'),
        o('whole', 'All over the belly', 'お腹全体', 'पूरा पेट'),
        o('nopain', 'No pain, other digestive trouble', '痛みはなく、他の消化器症状', 'दर्द नहीं, पाचन की दूसरी समस्या'),
      ],
    },
    {
      id: 'g05q2',
      kind: 'multi',
      text: m('Which of these do you have?', '次のうち当てはまるものはありますか？（複数選択可）', 'इनमें से कौन से लक्षण हैं? (एक से अधिक चुन सकते हैं)'),
      noteLabel: { ja: '随伴症状', en: 'Associated symptoms' },
      options: [
        o('nausea', 'Nausea', '吐き気', 'मतली'),
        o('vomit', 'Vomiting', '嘔吐', 'उल्टी'),
        o('diarrhoea', 'Diarrhoea', '下痢', 'दस्त'),
        o('constipation', 'Constipation', '便秘', 'कब्ज'),
        o('heartburn', 'Heartburn or sour taste', '胸やけ・酸っぱいものが上がる', 'सीने में जलन या खट्टी डकार'),
        o('bloodstool', 'Blood in stool or black stool', '血便・黒い便', 'मल में खून या काला मल', { urgency: 'today' }),
        o('none', 'None of these', '特になし', 'इनमें से कोई नहीं'),
      ],
    },
    {
      id: 'g05q3',
      kind: 'single',
      text: m('Did anything come before it?', '症状の前に思い当たることはありますか？', 'इससे पहले कुछ हुआ था?'),
      noteLabel: { ja: '思い当たる原因', en: 'Possible trigger' },
      options: [
        o('food', 'I ate raw, old, or unusual food', '生もの・古いもの・普段と違うものを食べた', 'कच्चा, पुराना या अलग खाना खाया'),
        o('painkiller', 'I took painkillers recently', '最近、痛み止めを飲んだ', 'हाल में दर्द की दवा ली'),
        o('stress', 'Stress or irregular meals', 'ストレス・不規則な食事', 'तनाव या अनियमित खाना'),
        o('none', 'Nothing in particular', '特にない', 'कुछ खास नहीं'),
      ],
    },
    {
      id: 'g05q4',
      kind: 'single',
      text: m('Can you drink fluids?', '水分は摂れていますか？', 'क्या आप पानी या तरल पी पा रहे हैं?'),
      noteLabel: { ja: '水分摂取', en: 'Able to drink' },
      options: [
        o('yes', 'Yes', '摂れている', 'हां'),
        o('little', 'Only small sips', '少しずつなら摂れる', 'सिर्फ थोड़ा-थोड़ा'),
        o('no', 'No, I vomit everything', '飲んでもすぐ吐いてしまう', 'नहीं, सब उल्टी हो जाता है', { urgency: 'today' }),
      ],
    },
  ],

  // g12 Periods, menopause, contraception, fertility -> 婦人科 / 産科
  g12: [
    {
      id: 'g12q1',
      kind: 'single',
      text: m('What is the main reason for your visit?', '受診の目的は何ですか？', 'आप किस कारण से दिखाना चाहती हैं?'),
      noteLabel: { ja: '受診の目的', en: 'Reason for visit' },
      options: [
        o('pain', 'Painful periods', '生理痛', 'दर्दनाक पीरियड्स'),
        o('irregular', 'Irregular periods', '月経不順', 'अनियमित पीरियड्स'),
        o('heavy', 'Very heavy bleeding', '出血量が多い', 'बहुत ज्यादा ब्लीडिंग', { urgency: 'today' }),
        o('between', 'Bleeding between periods', '不正出血', 'पीरियड्स के बीच ब्लीडिंग', { urgency: 'days' }),
        o('menopause', 'Menopause symptoms', '更年期症状', 'रजोनिवृत्ति के लक्षण'),
        o('contraception', 'Contraception or morning-after pill', '避妊・緊急避妊の相談', 'गर्भनिरोधक या इमरजेंसी पिल'),
        o('fertility', 'Trying to conceive', '妊娠を希望している（不妊相談）', 'गर्भधारण की कोशिश (प्रजनन परामर्श)'),
      ],
    },
    {
      id: 'g12q2',
      kind: 'single',
      text: m('Could you be pregnant?', '妊娠の可能性はありますか？', 'क्या आप गर्भवती हो सकती हैं?'),
      noteLabel: { ja: '妊娠の可能性', en: 'Possible pregnancy' },
      options: [
        o('no', 'No', 'ない', 'नहीं'),
        o('notsure', 'Not sure', 'わからない', 'पक्का नहीं पता'),
        o('yes', 'Yes, or a test was positive', 'ある・検査で陽性だった', 'हां, या टेस्ट पॉजिटिव आया', { useBackupDept: true }),
      ],
    },
    {
      id: 'g12q3',
      kind: 'single',
      text: m('When was your last period?', '最後の生理はいつでしたか？', 'आखिरी पीरियड कब हुआ था?'),
      noteLabel: { ja: '最終月経', en: 'Last period' },
      options: [
        o('month', 'Within the last month', '1か月以内', 'पिछले 1 महीने के भीतर'),
        o('threemonths', '1 to 3 months ago', '1〜3か月前', '1 से 3 महीने पहले'),
        o('over3', 'More than 3 months ago, or stopped', '3か月以上前・閉経している', '3 महीने से ज्यादा पहले या बंद हो चुके'),
      ],
    },
  ],

  // g16 Headache, numbness, nerves -> 脳神経内科 / 脳神経外科
  g16: [
    {
      id: 'g16q1',
      kind: 'single',
      text: m('How would you describe it?', 'どのような症状ですか？', 'आप इसे कैसे बताएंगे?'),
      noteLabel: { ja: '症状の性状', en: 'Type' },
      options: [
        o('throb', 'Throbbing headache', 'ズキズキする頭痛', 'धड़कता हुआ सिरदर्द'),
        o('tight', 'Tight band or pressure', '締めつけられるような頭痛', 'कसाव या दबाव जैसा सिरदर्द'),
        o('thunder', 'Sudden, the worst headache of my life', '突然起きた、今までで最悪の頭痛', 'अचानक हुआ, जिंदगी का सबसे बुरा सिरदर्द', { urgency: 'now' }),
        o('numb', 'Numbness or tingling, no headache', '頭痛はなく、しびれが主', 'सिरदर्द नहीं, सुन्नपन या झुनझुनी'),
      ],
    },
    {
      id: 'g16q2',
      kind: 'single',
      text: m('Did you hit your head recently?', '最近、頭を打ちましたか？', 'क्या हाल में सिर पर चोट लगी थी?'),
      noteLabel: { ja: '頭部外傷', en: 'Head injury' },
      options: [
        o('no', 'No', 'いいえ', 'नहीं'),
        o('week', 'Yes, within the last week', 'はい、1週間以内', 'हां, पिछले एक सप्ताह में', { urgency: 'today', useBackupDept: true }),
        o('older', 'Yes, more than a week ago', 'はい、1週間より前', 'हां, एक सप्ताह से पहले', { useBackupDept: true }),
      ],
    },
    {
      id: 'g16q3',
      kind: 'multi',
      text: m('Do you have any of these?', '次のうち当てはまるものはありますか？（複数選択可）', 'क्या इनमें से कोई लक्षण है? (एक से अधिक चुन सकते हैं)'),
      noteLabel: { ja: '随伴症状', en: 'Associated symptoms' },
      options: [
        o('nausea', 'Nausea or vomiting', '吐き気・嘔吐', 'मतली या उल्टी'),
        o('light', 'Sensitive to light or sound', '光や音がつらい', 'रोशनी या आवाज से परेशानी'),
        o('vision', 'Changes in vision', '視界の異常（かすみ・二重に見える）', 'नजर में बदलाव (धुंधला या दोहरा दिखना)', { urgency: 'today' }),
        o('weak', 'Weakness on one side, drooping face, or slurred speech', '片側の脱力・顔のゆがみ・ろれつが回らない', 'एक तरफ कमजोरी, चेहरा टेढ़ा या बोलने में लड़खड़ाहट', { urgency: 'now' }),
        o('stiffneck', 'Fever with stiff neck', '発熱と首のこわばり', 'बुखार के साथ गर्दन अकड़ना', { urgency: 'now' }),
        o('none', 'None of these', '特になし', 'इनमें से कोई नहीं'),
      ],
    },
  ],

  // g26 Skin, hair, nails -> 皮膚科
  g26: [
    {
      id: 'g26q1',
      kind: 'multi',
      text: m('What problem do you have?', 'どのような症状ですか？（複数選択可）', 'आपको क्या समस्या है? (एक से अधिक चुन सकते हैं)'),
      noteLabel: { ja: '症状', en: 'Symptoms' },
      options: [
        o('itch', 'Itching', 'かゆみ', 'खुजली'),
        o('rash', 'Rash or redness', '発疹・赤み', 'दाने या लाली'),
        o('blister', 'Blisters', '水ぶくれ', 'छाले'),
        o('pain', 'Painful skin', '皮膚の痛み', 'त्वचा में दर्द'),
        o('acne', 'Acne', 'ニキビ', 'मुंहासे'),
        o('hair', 'Hair loss', '抜け毛・脱毛', 'बाल झड़ना'),
        o('nail', 'Nail problem', '爪のトラブル', 'नाखून की समस्या'),
      ],
    },
    {
      id: 'g26q2',
      kind: 'single',
      text: m('Where is it?', 'どこに症状がありますか？', 'यह कहां है?'),
      noteLabel: { ja: '部位', en: 'Location' },
      options: [
        o('face', 'Face', '顔', 'चेहरा'),
        o('scalp', 'Scalp', '頭皮', 'सिर की त्वचा'),
        o('trunk', 'Chest, back, or belly', '胸・背中・お腹', 'छाती, पीठ या पेट'),
        o('limbs', 'Arms, legs, hands, or feet', '腕・脚・手足', 'हाथ, पैर'),
        o('widespread', 'Almost everywhere', '全身', 'लगभग पूरे शरीर पर'),
      ],
    },
    {
      id: 'g26q3',
      kind: 'single',
      text: m('Is it changing?', '症状は変化していますか？', 'क्या यह बदल रहा है?'),
      noteLabel: { ja: '経過', en: 'Course' },
      options: [
        o('stable', 'About the same', 'あまり変わらない', 'लगभग वैसा ही'),
        o('spreading', 'Spreading quickly', '急に広がっている', 'तेजी से फैल रहा है', { urgency: 'today' }),
        o('fever', 'With fever or feeling very unwell', '発熱やつらい全身症状を伴う', 'बुखार या बहुत बीमार महसूस होना', { urgency: 'today' }),
        o('trigger', 'Started after a new medicine, food, or product', '新しい薬・食べ物・化粧品のあとに始まった', 'नई दवा, खाने या प्रोडक्ट के बाद शुरू हुआ'),
      ],
    },
  ],

  // g28 Bones, joints, muscles -> 整形外科
  g28: [
    {
      id: 'g28q1',
      kind: 'single',
      text: m('Which area is the problem?', 'どの部位が痛みますか？', 'कौन सा हिस्सा प्रभावित है?'),
      noteLabel: { ja: '部位', en: 'Area' },
      options: [
        o('neckshoulder', 'Neck or shoulder', '首・肩', 'गर्दन या कंधा'),
        o('back', 'Back or lower back', '背中・腰', 'पीठ या कमर'),
        o('armhand', 'Elbow, wrist, or hand', '肘・手首・手', 'कोहनी, कलाई या हाथ'),
        o('hipknee', 'Hip or knee', '股関節・膝', 'कूल्हा या घुटना'),
        o('anklefoot', 'Ankle or foot', '足首・足', 'टखना या पैर'),
      ],
    },
    {
      id: 'g28q2',
      kind: 'single',
      text: m('How did it start?', 'きっかけは何ですか？', 'यह कैसे शुरू हुआ?'),
      noteLabel: { ja: 'きっかけ', en: 'How it started' },
      options: [
        o('injury', 'A fall or injury', '転倒・ケガ', 'गिरना या चोट'),
        o('sport', 'Sport or exercise', 'スポーツ・運動', 'खेल या कसरत'),
        o('work', 'Desk work or heavy lifting', 'デスクワーク・重いものを持った', 'डेस्क वर्क या भारी सामान उठाना'),
        o('gradual', 'Gradually, no clear cause', 'いつの間にか・原因不明', 'धीरे-धीरे, कारण पता नहीं'),
      ],
    },
    {
      id: 'g28q3',
      kind: 'multi',
      text: m('Do you have any of these?', '次のうち当てはまるものはありますか？（複数選択可）', 'क्या इनमें से कोई लक्षण है? (एक से अधिक चुन सकते हैं)'),
      noteLabel: { ja: '随伴症状', en: 'Associated symptoms' },
      options: [
        o('swelling', 'Swelling or bruising', '腫れ・あざ', 'सूजन या नील'),
        o('numb', 'Numbness or tingling', 'しびれ', 'सुन्नपन या झुनझुनी'),
        o('noweight', 'Cannot put weight on it or cannot move it', '体重をかけられない・動かせない', 'वजन नहीं डाल पा रहा/रही या हिला नहीं पा रहा/रही', { urgency: 'today' }),
        o('bladder', 'Loss of bladder or bowel control', '尿や便のコントロールができない', 'पेशाब या मल पर नियंत्रण नहीं', { urgency: 'now' }),
        o('none', 'None of these', '特になし', 'इनमें से कोई नहीं'),
      ],
    },
  ],
};
