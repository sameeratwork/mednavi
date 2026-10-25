'use client';

import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Languages,
  PhoneCall,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface ScriptStep {
  step: number;
  dispatcherQ: {
    ja: string;
    romaji: string;
    en: string;
    hi: string;
  };
  patientA: {
    ja: string;
    romaji: string;
    en: string;
    hi: string;
  };
  note: {
    en: string;
    ja: string;
    hi: string;
  };
}

const CALL_SCRIPT_STEPS: ScriptStep[] = [
  {
    step: 1,
    dispatcherQ: {
      ja: '火事ですか？救急ですか？',
      romaji: 'Kaji desu ka? Kyuukyuu desu ka?',
      en: 'Fire or Medical emergency / ambulance?',
      hi: 'आग लगी है या मेडिकल इमरजेंसी है?'
    },
    patientA: {
      ja: '救急です！（きゅうきゅう です）',
      romaji: 'Kyuukyuu desu!',
      en: 'It is a medical emergency / ambulance!',
      hi: 'यह मेडिकल इमरजेंसी / एम्बुलेंस है!'
    },
    note: {
      en: 'Say this clearly as soon as the dispatcher answers the call.',
      ja: '電話が繋がったら、まず第一声で「救急です」と伝えます。',
      hi: 'कॉल कनेक्ट होते ही सबसे पहले "क्यूक्यू देस" कहें।'
    }
  },
  {
    step: 2,
    dispatcherQ: {
      ja: '場所・住所はどこですか？',
      romaji: 'Basho, juusho wa doko desu ka?',
      en: 'Where are you? What is your address / location?',
      hi: 'आप कहाँ हैं? आपका पता या स्थान क्या है?'
    },
    patientA: {
      ja: '場所は【住所・駅・目印】です。',
      romaji: 'Basho wa [address / station / landmark] desu.',
      en: 'The location is [Ward / Station / Building name].',
      hi: 'स्थान [वार्ड / स्टेशन / बिल्डिंग का नाम] है।'
    },
    note: {
      en: 'Give ward, neighborhood, or nearest train station. Use the "My Location" GPS coordinates below if unsure.',
      ja: '区・町名、駅名、または目印となる建物を伝えます。下のGPS位置情報も活用してください。',
      hi: 'वार्ड, मोहल्ला या निकटतम रेलवे स्टेशन बताएं। नीचे दिए गए GPS का उपयोग करें।'
    }
  },
  {
    step: 3,
    dispatcherQ: {
      ja: 'どうしましたか？誰がどんな状態ですか？',
      romaji: 'Dou shimashita ka? Dare ga donna joutai desu ka?',
      en: 'What happened? Who is hurt or sick, and what is their condition?',
      hi: 'क्या हुआ है? कौन बीमार या घायल है और उनकी स्थिति क्या है?'
    },
    patientA: {
      ja: '【人】が倒れて、意識がありません / 激しい胸痛があります。',
      romaji: '[Hito] ga taorete, ishiki ga arimasen / Hageshii kyoutsuu ga arimasu.',
      en: '[Friend / Family / I] collapsed, unresponsive / having severe chest pain.',
      hi: '[दोस्त / परिजन / मैं] गिर पड़े हैं, बेहोश हैं / छाती में तेज दर्द है।'
    },
    note: {
      en: 'State if the person is breathing, conscious, or bleeding.',
      ja: '意識の有無、呼吸をしているか、出血があるかを簡潔に答えます。',
      hi: 'बताएं कि व्यक्ति सांस ले रहा है, होश में है या खून बह रहा है।'
    }
  },
  {
    step: 4,
    dispatcherQ: {
      ja: 'あなたの名前と電話番号を教えてください。',
      romaji: 'Anata no namae to denwa bangou o oshiete kudasai.',
      en: 'Please tell me your name and telephone number.',
      hi: 'कृपया अपना नाम और फोन नंबर बताएं।'
    },
    patientA: {
      ja: '名前は【名前】です。電話番号は【番号】です。',
      romaji: 'Namae wa [Name] desu. Denwa bangou wa [Phone number] desu.',
      en: 'My name is [Your name]. My phone number is [Your phone number].',
      hi: 'मेरा नाम [नाम] है। मेरा फोन नंबर [नंबर] है।'
    },
    note: {
      en: 'Keep your phone on and clear. Dispatchers or paramedics may call back for landmark directions.',
      ja: '救急隊が現場に向かう途中で電話をかけてくることがあるため、通話後は電話を切らずに待機します。',
      hi: 'कॉल के बाद अपना फोन चालू रखें। एम्बुलेंस कर्मी रास्ते में आपको कॉल कर सकते हैं।'
    }
  },
  {
    step: 5,
    dispatcherQ: {
      ja: '通訳が必要ですか？',
      romaji: 'Tsuuyaku ga hitsuyou desu ka?',
      en: 'Do you need language interpretation?',
      hi: 'क्या आपको दुभाषिए (अनुवादक) की आवश्यकता है?'
    },
    patientA: {
      ja: '英語が話せる人はいますか？（えいご が はなせる ひとは いますか？）',
      romaji: 'Eigo ga hanaseru hito wa imasu ka?',
      en: 'Is there an English speaker? (Tokyo 119 provides 3-way live translation)',
      hi: 'क्या कोई अंग्रेजी बोलने वाला है? (टोक्यो 119 में 3-तरफ़ा लाइव अनुवाद है)'
    },
    note: {
      en: 'Tokyo Fire Department operates a 24/7 3-way simultaneous interpretation service in English and other languages.',
      ja: '東京消防庁では英語などの多言語で24時間3者同時通訳対応を行っています。',
      hi: 'टोक्यो फायर डिपार्टमेंट 24 घंटे अंग्रेजी में लाइव 3-वे टेलीफोन अनुवाद प्रदान करता है।'
    }
  }
];

export default function EmergencyCallScriptCard() {
  const [lang, setLang] = useState<'en' | 'ja' | 'hi'>('en');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card space-y-6">
      {/* Header and Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emergency-100 text-emergency-700 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-navy-950">
              119 Ambulance Call Script &amp; Dialogue
            </h3>
            <p className="text-xs text-navy-500">
              Exact questions Tokyo dispatchers ask and Japanese phonetic responses with Romaji
            </p>
          </div>
        </div>

        {/* Translation Language Switcher */}
        <div className="flex items-center bg-navy-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              lang === 'en'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setLang('ja')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              lang === 'ja'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇯🇵 日本語
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              lang === 'hi'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇮🇳 हिन्दी
          </button>
        </div>
      </div>

      {/* Interactive Dialogue Steps */}
      <div className="space-y-4">
        {CALL_SCRIPT_STEPS.map((s, idx) => {
          const isCopied = copiedIdx === idx;
          return (
            <div
              key={s.step}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-navy-200/80 space-y-3 transition-colors hover:border-brand-300"
            >
              {/* Question from 119 Operator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                    Step {s.step} &bull; Dispatcher Asks:
                  </span>
                  <span className="text-[10px] text-brand-700 font-semibold">
                    119 Operator
                  </span>
                </div>

                <p className="font-heading font-extrabold text-sm text-navy-900 font-jp">
                  {s.dispatcherQ.ja}
                </p>
                <p className="text-[11px] text-navy-500 font-mono">
                  &ldquo;{s.dispatcherQ.romaji}&rdquo;
                </p>
                <p className="text-xs text-navy-700 italic">
                  &rarr; {lang === 'hi' ? s.dispatcherQ.hi : s.dispatcherQ.en}
                </p>
              </div>

              {/* Patient Response */}
              <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-subtle space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Your Response (Read aloud):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(idx, s.patientA.ja)}
                    className="flex items-center space-x-1 text-[10px] font-semibold text-navy-500 hover:text-navy-800 px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100"
                    title="Copy Japanese phrase"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="font-heading font-black text-base text-navy-950 font-jp">
                  {s.patientA.ja}
                </p>
                <p className="text-xs font-bold text-brand-700 font-mono">
                  &ldquo;{s.patientA.romaji}&rdquo;
                </p>
                <p className="text-xs text-navy-600">
                  Meaning: {lang === 'hi' ? s.patientA.hi : s.patientA.en}
                </p>
              </div>

              {/* Context Note */}
              <p className="text-[11px] text-navy-500 bg-white/60 p-2 rounded-lg border border-navy-100">
                💡 <strong className="text-navy-700">Advice:</strong> {s.note[lang]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
