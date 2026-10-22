'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Sparkles, 
  Send, 
  AlertCircle, 
  Check, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  ArrowRight,
  HelpCircle,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import DoctorNoteCard from '@/components/DoctorNoteCard';

function SymptomCheckerContent() {
  const searchParams = useSearchParams();
  const prefillSymptom = searchParams.get('symptom') || '';
  const clinicId = searchParams.get('clinicId') || '';

  const [mainSymptom, setMainSymptom] = useState(prefillSymptom || 'Fever & Chills (発熱・悪寒)');
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('Since yesterday (昨日から)');
  const [severity, setSeverity] = useState(5);
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>(['Headache (頭痛)', 'Fatigue (倦怠感)']);
  const [currentMedications, setCurrentMedications] = useState('Dolo 650 / Paracetamol taken 6 hours ago');
  const [allergies, setAllergies] = useState('None (なし)');
  const [pastConditions, setPastConditions] = useState('None (特になし)');
  const [specialRequests, setSpecialRequests] = useState('Please explain in English or simple Japanese');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);

  const symptomPresets = [
    'Fever & Chills (発熱・悪寒)',
    'Cough & Sore Throat (咳・のどの痛み)',
    'Stomach Ache & Nausea (胃痛・吐き気)',
    'Severe Headache (激しい頭痛)',
    'Skin Rash & Itching (発疹・かゆみ)',
    'Chest Pain / Discomfort (胸痛・息苦しさ)',
    'Ear or Sinus Pain (耳の痛み・鼻づまり)',
    'Pediatric Fever (子供の発熱・ぐったり)',
    'Other (Specify below)'
  ];

  const durationOptions = [
    'Started a few hours ago (数時間前)',
    'Since this morning (今朝から)',
    'Since yesterday (昨日から)',
    '2 to 3 days ago (2〜3日前から)',
    'Over a week ago (1週間以上前から)',
  ];

  const associatedPresets = [
    'Headache (頭痛)',
    'Fatigue (倦怠感)',
    'Nausea (吐き気)',
    'Loss of Appetite (食欲不振)',
    'Dizziness (めまい)',
    'Shortness of Breath (息切れ)',
    'Diarrhea (下痢)',
    'Joint Pain (関節痛)',
  ];

  const toggleAssociated = (symptom: string) => {
    if (associatedSymptoms.includes(symptom)) {
      setAssociatedSymptoms(associatedSymptoms.filter((s) => s !== symptom));
    } else {
      setAssociatedSymptoms([...associatedSymptoms, symptom]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const symptomText = mainSymptom.includes('Other') && customSymptom.trim() !== ''
      ? customSymptom
      : mainSymptom;

    const payload = {
      mainSymptom: symptomText,
      duration,
      severity,
      associatedSymptoms,
      currentMedications,
      allergies,
      pastConditions,
      specialRequests,
      clinicId: clinicId || null,
      save: true,
    };

    try {
      const res = await fetch('/api/ai/symptom-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setSavedPlanId(data.savedPlanId);
      }
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Monshinhyo (問診票) Builder</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy-950">
          Bilingual Japanese Doctor Note Generator
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 mt-1">
          Going to a Japanese clinic without speaking Japanese? Fill in your symptoms in English, and MedNavi will craft an authentic Japanese intake summary for reception plus English and Hindi explanations for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                1. Main Symptom (主訴)
              </label>
              <select
                value={mainSymptom}
                onChange={(e) => setMainSymptom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                {symptomPresets.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {mainSymptom.includes('Other') && (
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Describe your primary issue..."
                  className="w-full mt-2 px-3.5 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                2. Since When? (発症時期)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                {durationOptions.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-navy-800">
                  3. Severity / Pain Level (1 to 10)
                </label>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    severity >= 8
                      ? 'bg-emergency-100 text-emergency-700'
                      : severity >= 5
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Level {severity} / 10 &bull; {severity >= 8 ? 'Severe' : severity >= 5 ? 'Moderate' : 'Mild'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full h-2 bg-navy-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-navy-400 mt-1">
                <span>1 (Mild discomfort)</span>
                <span>5 (Noticeable pain)</span>
                <span>10 (Unbearable)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-2">
                4. Associated Symptoms (随伴症状)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {associatedPresets.map((sym) => {
                  const checked = associatedSymptoms.includes(sym);
                  return (
                    <div
                      key={sym}
                      onClick={() => toggleAssociated(sym)}
                      className={`p-2 rounded-xl border text-[11px] cursor-pointer flex items-center justify-between transition-all ${
                        checked
                          ? 'bg-brand-50 border-brand-500 text-brand-900 font-semibold'
                          : 'border-navy-200 text-navy-700 hover:border-navy-300'
                      }`}
                    >
                      <span>{sym.split('(')[0]}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          checked ? 'bg-brand-600 border-brand-600 text-white' : 'border-navy-300'
                        }`}
                      >
                        {checked && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1">
                  Current Medications (服用中の薬)
                </label>
                <input
                  type="text"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Dolo 650, Paracetamol, Metformin"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1">
                  Drug Allergies (アレルギー)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, None"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Special Requests & Dietary (配慮事項)
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Vegetarian capsules preferred, English speaker preferred"
                className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-float transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Bilingual Japanese Note...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Japanese Doctor Note & Explanations</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <DoctorNoteCard
                summaryJa={result.summary_ja}
                summaryEn={result.summary_en}
                summaryHi={result.summary_hi}
                suggestedDepartment={result.suggestedDepartment}
                urgencyLevel={result.urgencyLevel}
              />

              {result.questionsForDoctor && result.questionsForDoctor.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-3">
                  <h4 className="font-heading font-bold text-sm text-navy-950 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-brand-600" />
                    <span>Recommended Questions for the Doctor</span>
                  </h4>
                  <div className="space-y-3 pt-1">
                    {result.questionsForDoctor.map((q: any, i: number) => (
                      <div key={i} className="p-3 bg-navy-50 rounded-2xl text-xs space-y-1">
                        <p className="font-semibold text-navy-900">{q.en}</p>
                        <p className="font-jp text-navy-700">{q.ja}</p>
                        {q.hi && <p className="text-navy-500 font-sans">{q.hi}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/clinics?specialty=${encodeURIComponent(
                    result.suggestedDepartment?.split(' ')[0] || 'Internal Medicine'
                  )}`}
                  className="flex-1 text-center py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Find Clinics for {result.suggestedDepartment?.split(' ')[0] || 'this issue'}</span>
                </Link>

                <Link
                  href={`/visit-planner?symptomSummary=${encodeURIComponent(result.summary_ja)}`}
                  className="flex-1 text-center py-3 px-4 rounded-2xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Prepare Visit Checklist</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-navy-50/70 border-2 border-dashed border-navy-200 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-14 h-14 rounded-2xl bg-white text-brand-600 flex items-center justify-center shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-sm">
                <h3 className="font-heading font-bold text-base text-navy-900">
                  Doctor Intake Summary Preview
                </h3>
                <p className="text-xs text-navy-500 mt-1 leading-relaxed">
                  Complete the form on the left and click Generate. MedNavi will produce a high-contrast Japanese intake card ready to show directly to clinic staff in Japan, plus English and Hindi guides.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SymptomCheckerPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-navy-500">Loading Doctor Note Builder...</p>
      </div>
    }>
      <SymptomCheckerContent />
    </Suspense>
  );
}
