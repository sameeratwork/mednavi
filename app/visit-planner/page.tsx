'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CalendarCheck, 
  MapPin, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Navigation, 
  Clock, 
  Receipt, 
  Printer, 
  ArrowRight,
  Sparkles,
  Building2,
  FileText
} from 'lucide-react';
import CostBreakdown from '@/components/CostBreakdown';
import VisitCalendarSection from '@/components/visit-calendar/VisitCalendarSection';

function VisitPlannerContent() {
  const searchParams = useSearchParams();
  const initialClinicId = searchParams.get('clinicId') || '';
  const initialSymptom = searchParams.get('symptomSummary') || '';

  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId);
  const [symptomSummary, setSymptomSummary] = useState(initialSymptom);
  const [planResult, setPlanResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadClinics() {
      try {
        const res = await fetch('/api/clinics');
        const data = await res.json();
        if (data.success && data.clinics.length > 0) {
          setClinics(data.clinics);
          if (!selectedClinicId) {
            setSelectedClinicId(data.clinics[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading clinics for planner:', err);
      }
    }
    loadClinics();
  }, []);

  const selectedClinic = clinics.find((c) => c.id === selectedClinicId) || clinics[0];

  const handleGeneratePlan = async () => {
    if (!selectedClinic) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/visit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: selectedClinic.id,
          clinicName: selectedClinic.name_en || selectedClinic.name_ja,
          clinicAddress: selectedClinic.address,
          clinicType: selectedClinic.type,
          symptomSummary: symptomSummary || 'General consultation',
          hasInsurance: true,
          save: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlanResult(data.data);
      }
    } catch (err) {
      console.error('Error generating visit plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClinic) {
      handleGeneratePlan();
    }
  }, [selectedClinicId]);

  const toggleCheck = (idx: string) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step-by-Step Care Navigator</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy-950">
          Personalized Clinic Visit Plan & Guide
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 mt-1">
          Prepare for your visit to avoid common surprises: what paperwork and cash to carry, Japanese reception etiquette, and an accurate 30% NHI cost calculation.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy-800 mb-1">
              Select Destination Clinic / Hospital (実在の医療機関)
            </label>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en || c.name_ja} ({c.type === 'hospital' ? '病院' : '診療所'} - {c.address.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 mb-1">
              Main Reason for Visit (Optional Notes)
            </label>
            <input
              type="text"
              value={symptomSummary}
              onChange={(e) => setSymptomSummary(e.target.value)}
              placeholder="e.g. High fever, chest cold, skin allergy"
              className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {selectedClinic && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-navy-100 text-xs text-navy-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{selectedClinic.address}</span>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${selectedClinic.name_ja} ${selectedClinic.address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps Transit Route</span>
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1 font-semibold text-navy-700 hover:text-navy-900 bg-navy-50 px-3 py-1 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {planResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-brand-600" />
                  <span>Essential Checklist (持ち物リスト)</span>
                </h3>
                <span className="text-[11px] text-navy-500 font-medium">Check off as you pack</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {planResult.checklist.map((item: any, idx: number) => {
                  const isChecked = !!checkedItems[String(idx)];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(String(idx))}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-brand-50/40 border-brand-300 text-navy-900'
                          : 'bg-white border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-brand-600 shrink-0"
                        aria-label="Toggle item"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-brand-600" />
                        ) : (
                          <Square className="w-5 h-5 text-navy-300" />
                        )}
                      </button>

                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isChecked ? 'line-through text-navy-400' : 'text-navy-950'}`}>
                            {item.item}
                          </span>
                          {item.mandatory && (
                            <span className="text-[10px] font-bold bg-emergency-100 text-emergency-800 px-1.5 py-0.2 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="font-jp text-[11px] text-navy-500">{item.item_ja}</p>
                        <p className="text-[11px] text-navy-600 leading-relaxed pt-0.5">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-subtle space-y-4">
              <h3 className="font-heading font-bold text-base text-navy-950 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <span>Clinic Workflow Sequence (受診の流れ)</span>
              </h3>

              <div className="space-y-4 pt-2">
                {planResult.steps.map((step: any) => (
                  <div
                    key={step.order}
                    className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-navy-50/60 border border-navy-100"
                  >
                    <div className="w-7 h-7 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {step.order}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-navy-950 text-sm">{step.title_en}</span>
                        <span className="font-jp text-navy-500 text-[11px]">({step.title_ja})</span>
                      </div>
                      <p className="text-navy-700 leading-relaxed">{step.action}</p>
                      {step.tips && (
                        <p className="text-[11px] text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg font-medium inline-block mt-1">
                          Tip: {step.tips}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <CostBreakdown
              hasInsurance={true}
              isFirstVisit={true}
              isHospital={selectedClinic?.type?.toLowerCase() === 'hospital'}
            />

            <div className="bg-navy-900 text-white rounded-3xl p-6 border border-navy-800 space-y-3 shadow-card">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-400" />
                <h4 className="font-heading font-bold text-base text-white">
                  Need a Doctor Note for this Visit?
                </h4>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                Generate your formal Japanese reception intake screen (問診票サマリー) to show the staff at <strong>{selectedClinic?.name_ja}</strong> upon arrival.
              </p>
              <Link
                href={`/symptom-checker?clinicId=${selectedClinic?.id}`}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs transition-colors shadow-md"
              >
                <span>Create Japanese Intake Note &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Visit Calendar Section */}
      <VisitCalendarSection selectedClinic={selectedClinic} />
    </div>
  );
}

export default function VisitPlannerPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-navy-500">Loading Visit Guide...</p>
      </div>
    }>
      <VisitPlannerContent />
    </Suspense>
  );
}
