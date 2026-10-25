'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  HelpCircle, 
  Hospital, 
  Volume2, 
  MapPin, 
  Phone, 
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import EmergencyPhoneDirectory from '@/components/EmergencyPhoneDirectory';
import EmergencyLocationCard from '@/components/EmergencyLocationCard';
import EmergencyCallScriptCard from '@/components/EmergencyCallScriptCard';
import EmergencyPhrasesCards from '@/components/EmergencyPhrasesCards';

export default function EmergencyPage() {
  const [triageAnswers, setTriageAnswers] = useState({
    chestPain: false,
    slurredSpeech: false,
    difficultyBreathing: false,
    unconscious: false,
    highFeverPersistent: false,
    severeStomachPain: false,
  });

  const [emergencyHospitals, setEmergencyHospitals] = useState<any[]>([]);
  const [copiedBannerNumber, setCopiedBannerNumber] = useState<string | null>(null);

  const handleBannerCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedBannerNumber(num);
    setTimeout(() => setCopiedBannerNumber(null), 2000);
  };

  useEffect(() => {
    async function loadEmergencyHospitals() {
      try {
        const res = await fetch('/api/clinics?type=hospital');
        const data = await res.json();
        if (data.success) {
          // Filter hospitals with emergency capacity from real data
          const erHospitals = data.clinics.filter((c: any) => 
            c.type === 'hospital' || 
            JSON.stringify(c.opening_hours || '').toLowerCase().includes('emergency') ||
            c.specialties?.includes('Emergency Medicine') ||
            c.specialties?.includes('Emergency Care')
          );
          setEmergencyHospitals(erHospitals.length > 0 ? erHospitals : data.clinics.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching emergency hospitals:', err);
      }
    }
    loadEmergencyHospitals();
  }, []);

  // Triage logic
  const isImmediateEmergency = 
    triageAnswers.chestPain || 
    triageAnswers.slurredSpeech || 
    triageAnswers.difficultyBreathing || 
    triageAnswers.unconscious;

  const isUrgentConsultation = 
    !isImmediateEmergency && (triageAnswers.highFeverPersistent || triageAnswers.severeStomachPain);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner */}
      <div 
        className="bg-[#3b0707] bg-gradient-to-r from-red-950 via-red-900 to-navy-950 text-white rounded-3xl p-6 sm:p-10 border border-red-800/80 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #3b0707 0%, #7f1d1d 50%, #0a0f1d 100%)' }}
      >
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-950/80 text-red-200 border border-red-500/50 text-xs font-bold shadow-inner">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Japan Emergency Care Guidance (救急ナビ)</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white drop-shadow-sm">
            Emergency 119 & ER Assistance
          </h1>

          <p className="text-sm sm:text-base text-red-100 leading-relaxed max-w-2xl font-normal">
            In Japan, dialing <strong className="text-white font-bold underline decoration-red-400/60 decoration-2">119</strong> calls an ambulance. If you are unsure whether your condition warrants an ambulance, Tokyo&apos;s <strong className="text-white font-bold underline decoration-red-400/60 decoration-2">#7119</strong> emergency consultation center can advise you in English.
          </p>

          {/* Quick Dial Buttons with tel:%237119 and Desktop Copy */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Primary 119 Button: Solid Red Background, White Bold Text */}
            <div 
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl p-1 shadow-xl ring-2 ring-red-400/80 transition-all hover:scale-105"
              style={{ backgroundColor: '#dc2626' }}
            >
              <a
                href="tel:119"
                className="px-5 py-2.5 text-white font-heading font-black text-sm sm:text-base flex items-center space-x-2"
              >
                <PhoneCall className="w-5 h-5 text-white animate-bounce shrink-0" />
                <span className="font-bold text-white tracking-wide">Dial 119 (Ambulance / Fire)</span>
              </a>
              <button
                type="button"
                onClick={() => handleBannerCopy('119')}
                className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-colors border border-red-400/40"
                style={{ backgroundColor: '#b91c1c' }}
                title="Copy 119"
              >
                {copiedBannerNumber === '119' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-1.5 bg-emergency-700/80 hover:bg-emergency-700 text-white border border-emergency-500/50 rounded-2xl p-1 shadow-md">
              <a
                href="tel:%237119"
                className="px-4 py-2.5 font-bold text-xs flex items-center space-x-2"
              >
                <Phone className="w-4 h-4 text-emergency-300" />
                <span>Dial #7119 (Medical Consultation)</span>
              </a>
              <button
                type="button"
                onClick={() => handleBannerCopy('#7119')}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-emergency-800/80 hover:bg-emergency-900 text-white text-xs font-bold transition-colors"
                title="Copy #7119"
              >
                {copiedBannerNumber === '#7119' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/80" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-1.5 bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-500/50 rounded-2xl p-1 shadow-md">
              <a
                href="tel:110"
                className="px-4 py-2.5 font-bold text-xs flex items-center space-x-2"
              >
                <Phone className="w-4 h-4 text-blue-200" />
                <span>Dial 110 (Police / 警察)</span>
              </a>
              <button
                type="button"
                onClick={() => handleBannerCopy('110')}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-blue-800/80 hover:bg-blue-900 text-white text-xs font-bold transition-colors"
                title="Copy 110"
              >
                {copiedBannerNumber === '110' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/80" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Emergency Phone Directory Config Component */}
      <EmergencyPhoneDirectory />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Triage Decision Tool */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Self-Triage Assistant
              </span>
              <h2 className="font-heading font-bold text-xl text-navy-950 mt-1">
                Do I Need to Call 119?
              </h2>
              <p className="text-xs text-navy-600 mt-1">
                Check any severe symptoms you or your family member are experiencing right now.
              </p>
            </div>

            {/* Red Flag Questions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emergency-700 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Red Flags (119 Immediate)</span>
              </span>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-navy-200 hover:border-emergency-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={triageAnswers.chestPain}
                  onChange={(e) => setTriageAnswers({ ...triageAnswers, chestPain: e.target.checked })}
                  className="mt-0.5 rounded text-emergency-600 focus:ring-emergency-500"
                />
                <div>
                  <span className="font-bold text-navy-900">Crushing chest pain or pressure</span>
                  <p className="text-[11px] text-navy-500">Especially if radiating to arm, neck, or accompanied by cold sweat</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-navy-200 hover:border-emergency-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={triageAnswers.slurredSpeech}
                  onChange={(e) => setTriageAnswers({ ...triageAnswers, slurredSpeech: e.target.checked })}
                  className="mt-0.5 rounded text-emergency-600 focus:ring-emergency-500"
                />
                <div>
                  <span className="font-bold text-navy-900">Sudden face drooping, arm weakness, or slurred speech</span>
                  <p className="text-[11px] text-navy-500">Possible acute stroke signs (FAST test)</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-navy-200 hover:border-emergency-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={triageAnswers.difficultyBreathing}
                  onChange={(e) => setTriageAnswers({ ...triageAnswers, difficultyBreathing: e.target.checked })}
                  className="mt-0.5 rounded text-emergency-600 focus:ring-emergency-500"
                />
                <div>
                  <span className="font-bold text-navy-900">Severe difficulty breathing or gasping for air</span>
                  <p className="text-[11px] text-navy-500">Blue lips, inability to speak full sentences</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-navy-200 hover:border-emergency-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={triageAnswers.unconscious}
                  onChange={(e) => setTriageAnswers({ ...triageAnswers, unconscious: e.target.checked })}
                  className="mt-0.5 rounded text-emergency-600 focus:ring-emergency-500"
                />
                <div>
                  <span className="font-bold text-navy-900">Loss of consciousness or unresponsiveness</span>
                  <p className="text-[11px] text-navy-500">Seizures, sudden collapse, or confusion</p>
                </div>
              </label>
            </div>

            {/* Amber Questions */}
            <div className="space-y-3 pt-2 border-t border-navy-100">
              <span className="text-xs font-bold text-amber-700 flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>Urgent Symptoms (#7119 or Same-day Clinic)</span>
              </span>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-navy-200 hover:border-amber-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={triageAnswers.highFeverPersistent}
                  onChange={(e) => setTriageAnswers({ ...triageAnswers, highFeverPersistent: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-bold text-navy-900">High fever (&gt; 39.0°C) not responding to medication</span>
                  <p className="text-[11px] text-navy-500">Persistent over 48 hours or with severe chills</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-2xl border border-navy-200 hover:border-amber-300 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={triageAnswers.severeStomachPain}
                  onChange={(e) => setTriageAnswers({ ...triageAnswers, severeStomachPain: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-bold text-navy-900">Sudden, excruciating abdominal pain or vomiting blood</span>
                  <p className="text-[11px] text-navy-500">Inability to stand upright or keep water down</p>
                </div>
              </label>
            </div>

            {/* Triage Output Card */}
            <div className="pt-2">
              {isImmediateEmergency ? (
                <div className="bg-emergency-50 border-2 border-emergency-500 rounded-2xl p-5 space-y-3 animate-fade-in">
                  <div className="flex items-center space-x-2 text-emergency-800 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-emergency-600" />
                    <span>TRIAGE RESULT: CALL 119 IMMEDIATELY</span>
                  </div>
                  <p className="text-xs text-emergency-900 leading-relaxed">
                    The symptoms selected require prompt emergency hospital evaluation. Do not attempt to drive yourself. Call 119 or have a neighbor/bystander assist you immediately.
                  </p>
                  <a
                    href="tel:119"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Tap to Call 119 Ambulance</span>
                  </a>
                </div>
              ) : isUrgentConsultation ? (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 space-y-3 animate-fade-in">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>TRIAGE RESULT: CALL #7119 OR VISIT CLINIC TODAY</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    Your symptoms are concerning but may not require a siren ambulance. Call Tokyo&apos;s medical consultation line <strong>#7119</strong> to have a nurse triage whether you should take a taxi to an ER or visit an urgent care clinic.
                  </p>
                  <a
                    href="tel:#7119"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Tap to Dial #7119 Consultation</span>
                  </a>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>TRIAGE RESULT: BOOK ROUTINE CLINIC VISIT</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    No acute red-flag emergencies detected. You can safely visit a local clinic during standard reception hours. Prepare a Japanese intake note before you go.
                  </p>
                  <Link
                    href="/symptom-checker"
                    className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <span>Create Doctor Note (問診サマリー) &rarr;</span>
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Current GPS Location for 119 Dispatch */}
          <EmergencyLocationCard />

        </div>

        {/* Right Column: 119 Phone Dialogue & Emergency Hospitals */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Trilingual 119 Call Script & Dialogue Guide */}
          <EmergencyCallScriptCard />

          {/* Real Emergency Hospitals Directory */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
                  <Hospital className="w-5 h-5 text-brand-600" />
                  <span>Designated Emergency Hospitals (救急告示病院)</span>
                </h3>
                <p className="text-xs text-navy-500 mt-0.5">
                  Verified major hospitals in Tokyo with 24/7 ER capability and international desks.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {emergencyHospitals.map((hosp: any) => (
                <div
                  key={hosp.id}
                  className="p-4 rounded-2xl border border-navy-200 bg-white hover:border-brand-300 transition-colors space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-navy-950 block">
                        {hosp.name_en || hosp.name_ja}
                      </span>
                      <span className="font-jp text-navy-500 text-[11px]">{hosp.name_ja}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      24/7 Emergency
                    </span>
                  </div>

                  <div className="flex items-start space-x-1.5 text-navy-600 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
                    <span>{hosp.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-navy-100">
                    <span className="text-[11px] text-brand-800 font-semibold">
                      {hosp.languages_supported?.includes('hi') ? '🇮🇳 Hindi & English Service' : 'English Coordination'}
                    </span>
                    {hosp.phone && (
                      <a
                        href={`tel:${hosp.phone}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-xs shadow-sm transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call ER ({hosp.phone})</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Show-to-Stranger Large Japanese Phrase Cards */}
      <EmergencyPhrasesCards />

    </div>
  );
}
