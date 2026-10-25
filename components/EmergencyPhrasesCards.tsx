'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  Volume2,
  Copy,
  Check,
  Maximize2
} from 'lucide-react';

interface EmergencyPhrase {
  id: string;
  largeJa: string;
  romaji: string;
  en: string;
  hi: string;
  badge: string;
  color: 'red' | 'amber' | 'blue' | 'purple';
}

const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  {
    id: 'ambulance',
    largeJa: '救急車を呼んでください！',
    romaji: 'Kyuukyuusha o yonde kudasai!',
    en: 'Please call an ambulance!',
    hi: 'कृपया एम्बुलेंस बुलाएं!',
    badge: 'Immediate 119 Request',
    color: 'red'
  },
  {
    id: 'doctor',
    largeJa: '医者が必要です！助けてください。',
    romaji: 'Isha ga hitsuyou desu! Tasukete kudasai.',
    en: 'I need a doctor / Please help me.',
    hi: 'मुझे डॉक्टर की आवश्यकता है / कृपया मदद करें।',
    badge: 'Urgent Medical Help',
    color: 'amber'
  },
  {
    id: 'no-japanese',
    largeJa: '日本語が話せません。119番に通報してください。',
    romaji: 'Nihongo ga hanasemasen. 119-ban ni tsuuhou shite kudasai.',
    en: 'I cannot speak Japanese. Please call 119 for me.',
    hi: 'मुझे जापानी नहीं आती। कृपया मेरे लिए 119 पर कॉल करें।',
    badge: 'Language Barrier',
    color: 'blue'
  },
  {
    id: 'allergy',
    largeJa: 'アレルギー発作を起こしています！',
    romaji: 'Arerugii hossa o okoshite imasu!',
    en: 'I am having an acute allergic reaction (Anaphylaxis).',
    hi: 'मुझे गंभीर एलर्जी का दौरा (एनाफिलेक्सिस) पड़ा है।',
    badge: 'Allergic Reaction',
    color: 'purple'
  }
];

export default function EmergencyPhrasesCards() {
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');
  const [customAllergy, setCustomAllergy] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card space-y-6">
      {/* Header and Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-100">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emergency-50 border border-emergency-200 text-emergency-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Show-to-Stranger Screen Cards (緊急時カード)</span>
          </div>
          <h3 className="font-heading font-extrabold text-lg text-navy-950">
            Emergency Phrases to Show a Japanese Bystander
          </h3>
          <p className="text-xs text-navy-500">
            If you cannot speak Japanese, hold your screen up to a passerby, train staff, or shop clerk.
          </p>
        </div>

        {/* Translation Language Switcher */}
        <div className="flex items-center bg-navy-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeLang === 'en'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('hi')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeLang === 'hi'
                ? 'bg-white text-navy-900 shadow-sm font-bold'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇮🇳 हिन्दी
          </button>
        </div>
      </div>

      {/* Grid of Large Japanese Phrase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMERGENCY_PHRASES.map((phrase) => {
          const isCopied = copiedId === phrase.id;
          return (
            <div
              key={phrase.id}
              className={`p-5 rounded-3xl border-2 transition-all space-y-3 ${
                phrase.color === 'red'
                  ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                  : phrase.color === 'amber'
                  ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                  : phrase.color === 'purple'
                  ? 'border-purple-300 bg-purple-50/50 hover:bg-purple-50'
                  : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    phrase.color === 'red'
                      ? 'bg-red-200/80 text-red-900'
                      : phrase.color === 'amber'
                      ? 'bg-amber-200/80 text-amber-900'
                      : phrase.color === 'purple'
                      ? 'bg-purple-200/80 text-purple-900'
                      : 'bg-blue-200/80 text-blue-900'
                  }`}
                >
                  {phrase.badge}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(phrase.id, phrase.largeJa)}
                  className="p-1.5 rounded-lg hover:bg-white/80 text-navy-600 transition-colors"
                  title="Copy Japanese phrase"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Large High-Contrast Japanese Text for Bystanders */}
              <div className="bg-white p-4 rounded-2xl border border-navy-200/60 shadow-subtle text-center">
                <p className="font-heading font-black text-xl sm:text-2xl text-navy-950 tracking-wide font-jp leading-snug">
                  {phrase.largeJa}
                </p>
                <p className="text-[11px] text-navy-500 font-mono mt-1">
                  &ldquo;{phrase.romaji}&rdquo;
                </p>
              </div>

              {/* Explanation in Selected Language */}
              <div className="text-xs text-navy-700 px-1">
                <p className="font-semibold">
                  {activeLang === 'hi' ? phrase.hi : phrase.en}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Custom Allergy Card ("I am allergic to ___") */}
      <div className="p-5 rounded-3xl border-2 border-indigo-200 bg-indigo-50/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900 uppercase tracking-wider w-fit">
            Custom Allergy Card (アレルギー表示)
          </span>
          <span className="text-[11px] text-navy-500">
            Type your specific allergy to generate Japanese text to show clinic/emergency staff
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            placeholder="e.g. Peanuts, Penicillin, Shellfish, NSAIDs..."
            className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          />
          {['Penicillin', 'Peanuts', 'Shellfish', 'Eggs', 'NSAIDs / Aspirin'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCustomAllergy(item)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-100 font-medium transition-colors"
            >
              +{item}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-subtle text-center space-y-1">
          <p className="font-heading font-black text-xl sm:text-2xl text-navy-950 font-jp">
            私は【{customAllergy || '○○'}】のアレルギーがあります。
          </p>
          <p className="text-[11px] text-navy-500 font-mono">
            &ldquo;Watashi wa [{customAllergy || '...'} ] no arerugii ga arimasu&rdquo;
          </p>
          <p className="text-xs text-navy-700 font-medium pt-1">
            {activeLang === 'hi'
              ? `मुझे [${customAllergy || '...'} ] से एलर्जी है।`
              : `I am allergic to [${customAllergy || '...'} ].`}
          </p>
        </div>
      </div>
    </div>
  );
}
