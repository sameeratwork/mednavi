'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Globe2, 
  MapPin, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Sparkles, 
  HeartHandshake,
  Train,
  Clock,
  Languages,
  BadgePercent,
  Leaf,
  UserCheck
} from 'lucide-react';
import { 
  NATIONALITIES, 
  LANGUAGES_LIST, 
  JAPANESE_CITIES, 
  INSURANCE_OPTIONS, 
  CONSTRAINT_OPTIONS 
} from '@/lib/data/japaneseCities';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('India');
  const [japaneseLevel, setJapaneseLevel] = useState('none');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'hi']);
  const [city, setCity] = useState('Edogawa Ward (Nishi-Kasai / Kasai)');
  const [insuranceType, setInsuranceType] = useState('National Health Insurance (国民健康保険 / Kokumin Kenko Hoken)');
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>(['no_car', 'english_mandatory']);

  // Load existing profile from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mednavi_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.nationality) setNationality(parsed.nationality);
        if (parsed.japanese_level) setJapaneseLevel(parsed.japanese_level);
        if (parsed.languages) setSelectedLanguages(parsed.languages);
        if (parsed.city) setCity(parsed.city);
        if (parsed.insurance_type) setInsuranceType(parsed.insurance_type);
        if (parsed.constraints) setSelectedConstraints(parsed.constraints);
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== code));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  const toggleConstraint = (id: string) => {
    if (selectedConstraints.includes(id)) {
      setSelectedConstraints(selectedConstraints.filter((c) => c !== id));
    } else {
      setSelectedConstraints([...selectedConstraints, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const profileData = {
      name: name || 'Resident Patient',
      email: email || 'resident@mednavi.jp',
      nationality,
      japanese_level: japaneseLevel,
      languages: selectedLanguages,
      city,
      insurance_type: insuranceType,
      constraints: selectedConstraints,
    };

    try {
      // 1. Save to API / Database
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      // 2. Save locally for instant persistence
      localStorage.setItem('mednavi_profile', JSON.stringify(profileData));

      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/clinics');
      }, 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
      localStorage.setItem('mednavi_profile', JSON.stringify(profileData));
      router.push('/clinics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Care Navigation</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy-950">
          Your Japan Healthcare Profile
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 mt-1">
          Tell us about your languages, city, and insurance so MedNavi can filter the most appropriate clinics and format doctor notes accurately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Info */}
            <div>
              <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2 mb-4">
                <User className="w-4 h-4 text-brand-600" />
                <span>1. Personal & Nationality</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Your Name (Optional / Romanized)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Nationality (国籍)
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  >
                    {NATIONALITIES.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat === 'India' ? '🇮🇳 India (Recommended Preset)' : nat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Languages & Japanese Level */}
            <div className="pt-4 border-t border-navy-100">
              <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2 mb-4">
                <Globe2 className="w-4 h-4 text-brand-600" />
                <span>2. Language Proficiency</span>
              </h3>

              {/* Japanese Level */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-navy-700 mb-2">
                  Japanese Speaking Ability
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'none', label: 'None / Zero', desc: 'Need English/Hindi doctor or screen intake' },
                    { id: 'little', label: 'A Little (Basic)', desc: 'Can say greetings, simple pain words' },
                    { id: 'intermediate', label: 'Intermediate / Fluent', desc: 'Can handle standard Japanese checkup' }
                  ].map((level) => (
                    <div
                      key={level.id}
                      onClick={() => setJapaneseLevel(level.id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        japaneseLevel === level.id
                          ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500'
                          : 'border-navy-200 hover:border-navy-300 text-navy-700'
                      }`}
                    >
                      <span className="font-bold block">{level.label}</span>
                      <span className="text-[11px] text-navy-500 mt-0.5 block">{level.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Native / Preferred Languages */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-2">
                  Preferred Languages for Medical Explanations (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES_LIST.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.code);
                    return (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-navy-700 border-navy-200 hover:border-brand-300'
                        }`}
                      >
                        {lang.label} ({lang.native})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Location in Japan */}
            <div className="pt-4 border-t border-navy-100">
              <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2 mb-4">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>3. City / Area in Japan</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Select your Ward or City (実在の自治体)
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                >
                  {JAPANESE_CITIES.map((c, i) => (
                    <option key={i} value={c.name_en}>
                      {c.isPopularForExpats ? `★ ${c.name_en} - ${c.name_ja}` : `${c.name_en} - ${c.name_ja}`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-navy-400 mt-1">
                  Tokyo areas with high Indian diaspora (e.g. Edogawa-ku/Nishi-Kasai, Minato-ku) are highlighted.
                </p>
              </div>
            </div>

            {/* 4. Health Insurance */}
            <div className="pt-4 border-t border-navy-100">
              <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>4. Health Insurance Type</span>
              </h3>

              <div className="space-y-2">
                {INSURANCE_OPTIONS.map((ins) => (
                  <label
                    key={ins.id}
                    className={`flex items-start justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      insuranceType === ins.label
                        ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500'
                        : 'border-navy-200 hover:border-navy-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="insurance"
                        checked={insuranceType === ins.label}
                        onChange={() => setInsuranceType(ins.label)}
                        className="text-brand-600 focus:ring-brand-500 mt-0.5"
                      />
                      <span className="font-medium text-navy-900">{ins.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded shrink-0">
                      Copay: {ins.copay}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Constraints & Preferences */}
            <div className="pt-4 border-t border-navy-100">
              <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2 mb-4">
                <Train className="w-4 h-4 text-brand-600" />
                <span>5. Constraints & Specific Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONSTRAINT_OPTIONS.map((con) => {
                  const isChecked = selectedConstraints.includes(con.id);
                  return (
                    <div
                      key={con.id}
                      onClick={() => toggleConstraint(con.id)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-semibold'
                          : 'border-navy-200 text-navy-700 hover:border-navy-300'
                      }`}
                    >
                      <span className="pr-2">{con.label}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'border-navy-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-navy-100 flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center space-x-2 text-emerald-700 text-sm font-bold animate-fade-in">
                  <Check className="w-5 h-5" />
                  <span>Profile Saved! Redirecting to Clinics...</span>
                </div>
              ) : (
                <div className="text-[11px] text-navy-400">
                  You can update these preferences anytime.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-float transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Save Profile & Explore Clinics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

        {/* Live Patient Passport Preview Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 bg-gradient-to-b from-navy-900 to-navy-950 text-white rounded-3xl p-6 border border-navy-800 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-brand-400" />
                <span className="font-heading font-bold text-sm tracking-wide">
                  Care Passport Preview
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                ACTIVE
              </span>
            </div>

            <div className="pt-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Patient</span>
                <p className="font-bold text-sm text-white mt-0.5">{name || 'Resident Patient'}</p>
                <p className="text-navy-300 text-[11px]">Nationality: {nationality}</p>
              </div>

              <div>
                <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Languages</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedLanguages.map((code) => (
                    <span key={code} className="px-2 py-0.5 rounded bg-navy-800 text-navy-200 text-[11px] font-medium">
                      {LANGUAGES_LIST.find((l) => l.code === code)?.label || code}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Location</span>
                <p className="text-white font-medium mt-0.5">{city}</p>
              </div>

              <div>
                <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Insurance Copay</span>
                <p className="text-brand-300 font-semibold mt-0.5">
                  {insuranceType.includes('National') || insuranceType.includes('Social') ? '30% Patient Copay (Standard)' : '100% Out of Pocket'}
                </p>
              </div>

              {selectedConstraints.length > 0 && (
                <div>
                  <span className="text-[10px] text-navy-400 uppercase tracking-wider block">Constraints</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedConstraints.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-navy-800 text-amber-300 text-[10px]">
                        {CONSTRAINT_OPTIONS.find((opt) => opt.id === c)?.label.split('(')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-navy-800 text-[11px] text-navy-400 leading-relaxed">
              This profile dynamically filters clinic search results and pre-fills your bilingual Japanese doctor questionnaires.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
