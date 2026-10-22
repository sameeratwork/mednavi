'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  FileText, 
  Receipt, 
  CalendarCheck, 
  AlertTriangle, 
  Languages, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  HeartHandshake,
  Stethoscope,
  PhoneCall,
  Clock,
  Compass
} from 'lucide-react';
import ClinicCard from '@/components/ClinicCard';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedClinics() {
      try {
        const res = await fetch('/api/clinics?limit=4');
        const data = await res.json();
        if (data.success) {
          setClinics(data.clinics.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching clinics for home:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedClinics();
  }, []);

  const quickSymptoms = [
    { label: 'Fever & Chills (発熱・悪寒)', query: 'Fever' },
    { label: 'Cough & Sore Throat (咳・のどの痛み)', query: 'Cough' },
    { label: 'Stomach Ache (胃痛・腹痛)', query: 'Stomach' },
    { label: 'Skin Rash & Allergy (発疹・かゆみ)', query: 'Skin' },
    { label: 'Pediatrics / Baby (小児科)', query: 'Pediatrics' },
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
        
        {/* Background glow accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-brand-200/30 via-teal-100/30 to-blue-200/30 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200/80 shadow-sm text-xs font-semibold text-brand-800">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Verified MHLW & Tokyo Open Data</span>
              <span className="text-navy-300">|</span>
              <span className="text-brand-600 font-bold">English &bull; 日本語 &bull; हिन्दी</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-navy-950 tracking-tight leading-[1.15]">
              Navigating Healthcare in Japan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-600 to-teal-500">
                Made Effortless
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed">
              Your AI care-navigation copilot for foreign residents and Indian expats. Discover real English & Hindi-friendly clinics, generate instant Japanese doctor notes (問診票), and understand 30% NHI medical bills with zero anxiety.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl p-2 border border-navy-200 shadow-card focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                <Search className="w-5 h-5 text-navy-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symptoms (e.g. fever, headache) or Tokyo wards (Edogawa, Minato)..."
                  className="w-full px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 bg-transparent focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.location.href = `/clinics?query=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
                <Link
                  href={`/clinics?query=${encodeURIComponent(searchQuery)}`}
                  className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
                >
                  Find Clinics
                </Link>
              </div>

              {/* Quick Symptom Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
                <span className="text-navy-500 font-medium">Quick search:</span>
                {quickSymptoms.map((qs, i) => (
                  <Link
                    key={i}
                    href={`/symptom-checker?symptom=${encodeURIComponent(qs.query)}`}
                    className="px-2.5 py-1 bg-white/80 hover:bg-white text-navy-700 hover:text-brand-700 rounded-lg border border-navy-200 hover:border-brand-300 font-medium transition-colors shadow-2xs"
                  >
                    {qs.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/symptom-checker"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-float transition-all hover:scale-[1.02]"
              >
                <FileText className="w-4 h-4" />
                <span>Create Japanese Doctor Note (問診サマリー)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/clinics"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-navy-50 text-navy-900 border border-navy-200 font-bold text-sm shadow-sm transition-all"
              >
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Explore Clinics on Map</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* INDIAN DIASPORA & EXPATS FOCUS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-teal-500/10 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-subtle">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              <span>🇮🇳 Indian Community in Japan Care Navigation</span>
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-navy-950">
              Specialized Assistance for Tokyo&apos;s Indian Residents
            </h3>
            <p className="text-xs sm:text-sm text-navy-600 max-w-2xl leading-relaxed">
              Tailored for residents in <strong>Nishi-Kasai / Edogawa</strong>, Minato, and Shinjuku. Includes Hindi guidance, understanding common Japanese prescription substitutes (e.g. <em>Calonal</em> for <em>Crocin / Dolo 650</em>, <em>Loxonin</em> for <em>Brufen</em>), and navigating National Health Insurance (NHI).
            </p>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 px-5 py-3 rounded-2xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold shadow-md transition-colors"
          >
            Set Up Expat Profile &rarr;
          </Link>
        </div>
      </section>

      {/* 4 CORE PILLARS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            End-to-End Care Journey
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy-950">
            Everything You Need to Visit a Japanese Doctor
          </h2>
          <p className="text-xs sm:text-sm text-navy-600">
            From initial symptom assessment to your final prescription payment at the pharmacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Symptom Builder */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                Bilingual Doctor Note
              </h3>
              <p className="text-xs text-navy-600 leading-relaxed mb-4">
                Structured symptom builder that generates a formal Japanese questionnaire (問診票サマリー) plus English and Hindi explanations with a dedicated &quot;Doctor Mode&quot; screen.
              </p>
            </div>
            <Link
              href="/symptom-checker"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 pt-3 border-t border-navy-100"
            >
              <span>Build Symptom Note</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Real Clinic Finder */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                Verified Clinic Map
              </h3>
              <p className="text-xs text-navy-600 leading-relaxed mb-4">
                Real data directly from MHLW and Tokyo Metropolitan Government. Filter by English/Hindi support, NHI insurance acceptance, and clinic vs hospital.
              </p>
            </div>
            <Link
              href="/clinics"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 pt-3 border-t border-navy-100"
            >
              <span>Search Real Clinics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3: Visit Plan & Costs */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                Visit Workflow & Cost
              </h3>
              <p className="text-xs text-navy-600 leading-relaxed mb-4">
                Step-by-step guidance on what to bring (insurance card, cash), reception protocol, and realistic cost calculations based on the 30% NHI copay system.
              </p>
            </div>
            <Link
              href="/visit-planner"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 pt-3 border-t border-navy-100"
            >
              <span>Calculate Visit Cost</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 4: Bill & Prescription Explainer */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-subtle hover:border-brand-300 hover:shadow-card transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-navy-950 mb-2">
                Bill & Rx Decipherer
              </h3>
              <p className="text-xs text-navy-600 leading-relaxed mb-4">
                Demystifies Japanese medical points (点数) and explains medications (Calonal, Loxonin, Mucosta) in plain English and Hindi with dosage timings (食後).
              </p>
            </div>
            <Link
              href="/explainer"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 pt-3 border-t border-navy-100"
            >
              <span>Explain My Bill / Meds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURED REAL CLINICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Verified Public Data
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy-950">
              Featured English & Hindi Friendly Facilities
            </h2>
            <p className="text-xs sm:text-sm text-navy-600">
              From Nishi-Kasai Indian hubs to central Tokyo international medical centers.
            </p>
          </div>
          <Link
            href="/clinics"
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            <span>View All Real Facilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-navy-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        )}
      </section>

      {/* EMERGENCY 119 BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emergency-900 via-navy-950 to-navy-900 text-white rounded-3xl p-6 sm:p-10 border border-emergency-800 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emergency-600/30 text-emergency-300 border border-emergency-500/40 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-emergency-400" />
              <span>In Case of Severe Emergency</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight text-white">
              Need an Ambulance in Japan?
            </h2>
            <p className="text-xs sm:text-sm text-navy-300 leading-relaxed">
              Don&apos;t panic if you don&apos;t speak Japanese. Use our emergency phonetic guide to call 119, or consult Tokyo&apos;s emergency triage service (#7119) to decide if you need an ER immediately.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/emergency"
                className="px-5 py-3 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs shadow-lg transition-colors inline-flex items-center space-x-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>119 Call Phrases & ER Hospitals &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
