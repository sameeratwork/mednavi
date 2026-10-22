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
  Sparkles
} from 'lucide-react';

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
      <div className="bg-gradient-to-r from-emergency-900 via-emergency-800 to-navy-950 text-white rounded-3xl p-6 sm:p-10 border border-emergency-700 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-emergency-300" />
            <span>Japan Emergency Care Guidance (救急ナビ)</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white">
            Emergency 119 & ER Assistance
          </h1>

          <p className="text-xs sm:text-sm text-emergency-100 leading-relaxed max-w-2xl">
            In Japan, dialing <strong>119</strong> calls an ambulance. If you are unsure whether your condition warrants an ambulance, Tokyo&apos;s <strong>#7119</strong> emergency consultation center can advise you in English.
          </p>

          {/* Quick Dial Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="tel:119"
              className="px-6 py-3.5 rounded-2xl bg-white text-emergency-800 hover:bg-emergency-50 font-heading font-black text-sm shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <PhoneCall className="w-5 h-5 text-emergency-600" />
              <span>DIAL 119 (AMBULANCE / 救急)</span>
            </a>

            <a
              href="tel:#7119"
              className="px-5 py-3.5 rounded-2xl bg-emergency-700/80 hover:bg-emergency-700 text-white border border-emergency-500/50 font-bold text-xs shadow-md flex items-center space-x-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Dial #7119 (Medical Consultation)</span>
            </a>

            <a
              href="tel:03-5285-8181"
              className="px-4 py-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-900 text-navy-200 border border-navy-700 font-medium text-xs flex items-center space-x-1.5 transition-colors"
              title="Tokyo Metropolitan Health Services 'Himawari' Multilingual Helpline"
            >
              <span>Himawari Multilingual Helpline (03-5285-8181)</span>
            </a>
          </div>

        </div>
      </div>

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

        </div>

        {/* Right Column: 119 Phone Dialogue & Emergency Hospitals */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 119 Japanese Phonetic Dialogue Guide */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emergency-100 text-emergency-700 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-navy-950">
                  What to Say When Calling 119
                </h3>
                <p className="text-xs text-navy-500">
                  Japanese emergency operators speak slowly and clearly. Read these phonetic phrases:
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-1">
              
              {/* Step 1 */}
              <div className="p-3.5 bg-navy-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-navy-400 uppercase">
                  1. Operator asks: Fire or Medical? (火事ですか？救急ですか？)
                </span>
                <p className="font-bold text-sm text-navy-900">
                  &ldquo;Kyuukyuu desu!&rdquo; (きゅうきゅう です)
                </p>
                <p className="text-navy-600 text-[11px]">&rarr; &quot;It is a medical emergency / ambulance!&quot;</p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-navy-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-navy-400 uppercase">
                  2. Operator asks: What is your address? (住所・場所はどこですか？)
                </span>
                <p className="font-bold text-sm text-navy-900">
                  &ldquo;Basho wa [Ward / Station / Address] desu&rdquo;
                </p>
                <p className="text-navy-600 text-[11px]">&rarr; &quot;The location is [Your Address]&quot;. Give a nearby landmark or station.</p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-navy-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-navy-400 uppercase">
                  3. If you do not speak Japanese:
                </span>
                <p className="font-bold text-sm text-navy-900">
                  &ldquo;Eigo ga hanaseru hito wa imasu ka?&rdquo; (英語が話せる人はいますか？)
                </p>
                <p className="text-navy-600 text-[11px]">&rarr; &quot;Is there someone who can speak English?&quot; (Tokyo 119 has 3-way translation services).</p>
              </div>

            </div>
          </div>

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

    </div>
  );
}
