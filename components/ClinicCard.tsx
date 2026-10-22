'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Globe, 
  CalendarCheck, 
  ChevronRight, 
  ShieldCheck,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';

export interface ClinicCardProps {
  clinic: {
    id: string;
    name_ja: string;
    name_en?: string | null;
    type: string;
    specialties: string[] | any;
    address: string;
    phone?: string | null;
    website?: string | null;
    lat: number;
    lng: number;
    insurance_accepted?: boolean;
    languages_supported?: string[];
    opening_hours?: any;
    how_to_book?: string;
    foreign_friendly_notes?: string | null;
  };
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function ClinicCard({ clinic, isSelected, onSelect }: ClinicCardProps) {
  const isHospital = clinic.type?.toLowerCase() === 'hospital';
  const specialties: string[] = Array.isArray(clinic.specialties) ? clinic.specialties : [];
  const languages: string[] = Array.isArray(clinic.languages_supported) ? clinic.languages_supported : [];
  const hasHindi = languages.includes('hi');
  const hasEnglish = languages.includes('en');

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20 bg-brand-50/20'
          : 'border-navy-200 hover:border-brand-300 hover:shadow-card'
      }`}
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isHospital
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-brand-100 text-brand-800'
            }`}
          >
            {isHospital ? 'Hospital (病院)' : 'Clinic (診療所)'}
          </span>

          {hasHindi && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
              <span>🇮🇳</span>
              <span>Hindi Friendly</span>
            </span>
          )}

          {hasEnglish && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              English Supported
            </span>
          )}

          {clinic.insurance_accepted && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>30% NHI Accepted</span>
            </span>
          )}
        </div>

        {/* Booking tag */}
        <span className="text-[11px] font-medium text-navy-600 bg-navy-100 px-2 py-0.5 rounded-md shrink-0">
          {clinic.how_to_book || 'Walk-in Welcome'}
        </span>
      </div>

      {/* Clinic Name */}
      <div className="mb-2">
        <h3 className="font-heading font-bold text-lg text-navy-950 group-hover:text-brand-700 transition-colors">
          {clinic.name_en || clinic.name_ja}
        </h3>
        <p className="font-jp text-xs text-navy-500 font-medium">{clinic.name_ja}</p>
      </div>

      {/* Specialties Pills */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {specialties.slice(0, 4).map((spec, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 bg-navy-50 text-navy-700 rounded-md font-medium border border-navy-100"
            >
              {spec}
            </span>
          ))}
          {specialties.length > 4 && (
            <span className="text-[11px] px-1.5 py-0.5 bg-navy-50 text-navy-500 rounded-md font-medium">
              +{specialties.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Address & Contact */}
      <div className="space-y-1.5 text-xs text-navy-600 mb-4">
        <div className="flex items-start space-x-2">
          <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{clinic.address}</span>
        </div>
        {clinic.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <a
              href={`tel:${clinic.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-brand-700 font-medium"
            >
              {clinic.phone}
            </a>
          </div>
        )}
      </div>

      {/* Foreign Resident Note Snippet */}
      {clinic.foreign_friendly_notes && (
        <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-2.5 mb-4 text-xs text-brand-900 leading-relaxed flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{clinic.foreign_friendly_notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-3 border-t border-navy-100">
        <Link
          href={`/clinics/${clinic.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-center py-2 px-3 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
        >
          <span>Clinic Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/visit-planner?clinicId=${clinic.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-center py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Plan Visit</span>
        </Link>
      </div>
    </div>
  );
}
