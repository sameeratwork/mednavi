'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  CalendarCheck, 
  FileText, 
  ArrowLeft,
  Navigation,
  Share2,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import Map from '@/components/Map';

export default function ClinicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClinic() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/clinics/${id}`);
        const data = await res.json();
        if (data.success) {
          setClinic(data.clinic);
        } else {
          setError(data.error || 'Clinic not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch clinic');
      } finally {
        setLoading(false);
      }
    }
    loadClinic();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-navy-500">Loading clinic profile from verified open data...</p>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-emergency-500 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-navy-950">Facility Not Found</h2>
        <p className="text-xs text-navy-600">{error || 'The requested clinic could not be located.'}</p>
        <Link
          href="/clinics"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clinic Search</span>
        </Link>
      </div>
    );
  }

  const isHospital = clinic.type?.toLowerCase() === 'hospital';
  const specialties: string[] = Array.isArray(clinic.specialties) ? clinic.specialties : [];
  const languages: string[] = Array.isArray(clinic.languages_supported) ? clinic.languages_supported : [];
  const hasHindi = languages.includes('hi');
  const hasEnglish = languages.includes('en');

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${clinic.name_ja} ${clinic.address}`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search results</span>
        </button>
      </div>

      {/* Main Clinic Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isHospital
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-brand-100 text-brand-800'
                }`}
              >
                {isHospital ? 'Hospital (病院)' : 'Clinic (診療所)'}
              </span>

              {hasHindi && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                  <span>🇮🇳</span>
                  <span>Hindi Friendly Support</span>
                </span>
              )}

              {hasEnglish && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  English Supported
                </span>
              )}

              {clinic.insurance_accepted && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>30% NHI Accepted</span>
                </span>
              )}
            </div>

            {/* Names */}
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy-950">
                {clinic.name_en || clinic.name_ja}
              </h1>
              <p className="font-jp text-base text-navy-600 font-medium mt-1">
                {clinic.name_ja}
              </p>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-2 text-xs sm:text-sm text-navy-700">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>{clinic.address}</span>
            </div>

            {/* Phone & Booking */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm pt-1">
              {clinic.phone && (
                <a
                  href={`tel:${clinic.phone}`}
                  className="flex items-center space-x-2 font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>{clinic.phone}</span>
                </a>
              )}
              {clinic.website && (
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 font-medium text-navy-600 hover:text-brand-600 bg-navy-50 px-3 py-1.5 rounded-xl"
                >
                  <Globe className="w-4 h-4 text-navy-400" />
                  <span>Official Website</span>
                </a>
              )}
            </div>

          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-56">
            <Link
              href={`/visit-planner?clinicId=${clinic.id}`}
              className="w-full text-center py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-float transition-all flex items-center justify-center space-x-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Plan a Visit</span>
            </Link>

            <Link
              href={`/symptom-checker?clinicId=${clinic.id}`}
              className="w-full text-center py-3 px-4 rounded-2xl bg-white hover:bg-navy-50 text-navy-800 font-bold text-xs border border-navy-200 shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Create Doctor Note</span>
            </Link>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 px-4 rounded-2xl bg-navy-100 hover:bg-navy-200 text-navy-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Transit Directions</span>
            </a>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details & Foreign Friendliness */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Foreign Resident Friendliness Notes */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-4">
            <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <span>Foreign Patient Friendliness Assessment</span>
            </h3>

            {clinic.foreign_friendly_notes ? (
              <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-4 text-xs text-brand-950 leading-relaxed space-y-2">
                <p className="font-semibold text-brand-900">Verified Facility Profile:</p>
                <p>{clinic.foreign_friendly_notes}</p>
              </div>
            ) : (
              <p className="text-xs text-navy-500 italic">
                Standard Japanese facility. English questionnaires or translation apps may be used by staff.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-navy-500 block text-[10px] uppercase font-bold">Languages</span>
                <span className="font-bold text-navy-900 mt-0.5 block">
                  {languages.map((l: string) => l.toUpperCase()).join(', ') || 'Japanese'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-navy-500 block text-[10px] uppercase font-bold">How to Book</span>
                <span className="font-bold text-navy-900 mt-0.5 block">
                  {clinic.how_to_book || 'Walk-in Welcome'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-navy-500 block text-[10px] uppercase font-bold">Health Insurance</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {clinic.insurance_accepted ? '30% NHI Copay Accepted' : 'Inquire with Clinic'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-navy-500 block text-[10px] uppercase font-bold">Data Source</span>
                <span className="font-medium text-navy-700 mt-0.5 block">
                  {clinic.source || 'MHLW_Tokyo_OpenData'}
                </span>
              </div>
            </div>
          </div>

          {/* Specialties Department */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-3">
            <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-brand-600" />
              <span>Specialties & Departments (診療科目)</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {specialties.map((spec: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-navy-50 text-navy-800 text-xs font-semibold border border-navy-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-3">
            <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span>Consultation Hours (診療時間)</span>
            </h3>

            {clinic.opening_hours ? (
              <div className="space-y-2 text-xs">
                {Object.entries(clinic.opening_hours).map(([key, val]: [string, any]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center py-2 border-b border-navy-100 last:border-0"
                  >
                    <span className="capitalize font-semibold text-navy-700">{key}:</span>
                    <span className="font-medium text-navy-900">{String(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy-500">
                Standard Japanese outpatient reception hours (09:00 - 12:30, 14:30 - 18:00). Please call or check their official website for holiday hours.
              </p>
            )}
          </div>

        </div>

        {/* Right Column: Mini Interactive Map & Visit Action */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mini Map */}
          <div className="bg-white rounded-3xl p-4 border border-navy-200 shadow-subtle">
            <h4 className="font-heading font-bold text-sm text-navy-900 mb-3 px-2 flex items-center justify-between">
              <span>Location on Map</span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
              >
                Google Maps &rarr;
              </a>
            </h4>
            <div className="h-[280px] rounded-2xl overflow-hidden">
              <Map
                clinics={[clinic]}
                selectedClinicId={clinic.id}
                center={[clinic.lat, clinic.lng]}
                zoom={15}
              />
            </div>
            <p className="text-[11px] text-navy-500 mt-2 px-2">
              {clinic.address}
            </p>
          </div>

          {/* Quick Step Guide Card */}
          <div className="bg-navy-900 text-white rounded-3xl p-6 border border-navy-800 space-y-4 shadow-card">
            <h4 className="font-heading font-bold text-base text-white">
              Visiting {clinic.name_en || clinic.name_ja}
            </h4>
            <p className="text-xs text-navy-300 leading-relaxed">
              Don&apos;t speak Japanese? Generate a bilingual intake note in under 2 minutes. When you arrive, simply show your phone screen to the receptionist.
            </p>
            <Link
              href={`/symptom-checker?clinicId=${clinic.id}`}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs transition-colors shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Create Bilingual Intake Form</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
