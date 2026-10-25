'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  ArrowRight,
  CheckCircle2,
  Hospital
} from 'lucide-react';
import { TOKYO_WARDS, getJapaneseDepartmentName } from '@/lib/departments';

interface MatchingClinicsListProps {
  department: string;
  backupDepartment?: string;
}

export default function MatchingClinicsList({
  department,
  backupDepartment,
}: MatchingClinicsListProps) {
  const [selectedDept, setSelectedDept] = useState(department);
  const [selectedWard, setSelectedWard] = useState('all');
  const [clinics, setClinics] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Synchronize if initial department prop updates
  useEffect(() => {
    setSelectedDept(department);
    setPage(1);
  }, [department]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchMatchingClinics() {
      setLoading(true);
      try {
        const deptJa = getJapaneseDepartmentName(selectedDept);
        const params = new URLSearchParams();
        params.set('specialty', deptJa);
        if (selectedWard && selectedWard !== 'all') {
          params.set('ward', selectedWard);
        }
        params.set('limit', '10');
        params.set('page', String(page));

        const res = await fetch(`/api/clinics?${params.toString()}`);
        const data = await res.json();

        if (!isCancelled && data.success) {
          setClinics(data.clinics || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching matching clinics:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchMatchingClinics();

    return () => {
      isCancelled = true;
    };
  }, [selectedDept, selectedWard, page]);

  const totalPages = Math.max(1, Math.ceil(total / 10));
  const currentWardLabel =
    TOKYO_WARDS.find((w) => w.ja === selectedWard)?.en || selectedWard;

  return (
    <div className="bg-white rounded-3xl border border-navy-200 shadow-card p-6 sm:p-7 space-y-6 animate-in fade-in duration-300">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Nearby Clinics in Japan</span>
          </div>
          <h4 className="font-heading font-extrabold text-base sm:text-lg text-navy-950">
            Clinics with {getJapaneseDepartmentName(selectedDept)} ({selectedDept.split('(')[1]?.replace(')', '') || 'Specialty'})
          </h4>
          <p className="text-xs text-navy-500">
            Real MHLW clinic registry data filtered for your triage recommendation
          </p>
        </div>

        {/* Ward Filter Dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-4 h-4 text-navy-400 shrink-0" />
          <div className="relative">
            <select
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                setPage(1);
              }}
              className="text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-navy-900 shadow-subtle cursor-pointer"
            >
              {TOKYO_WARDS.map((w) => (
                <option key={w.ja} value={w.ja}>
                  {w.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alternative Department Toggle (if backup is provided) */}
      {backupDepartment && backupDepartment !== department && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-navy-500 font-medium">Department:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedDept(department);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedDept === department
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
            }`}
          >
            {department}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDept(backupDepartment);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedDept === backupDepartment
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
            }`}
          >
            Backup: {backupDepartment}
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-navy-500 font-medium">
            Finding matching clinics in {currentWardLabel}...
          </p>
        </div>
      )}

      {/* Clinic Results List (Up to 10) */}
      {!loading && clinics.length > 0 && (
        <div className="space-y-3">
          {clinics.map((clinic) => {
            const depts: string[] = Array.isArray(clinic.departments)
              ? clinic.departments
              : Array.isArray(clinic.specialties)
              ? clinic.specialties
              : [];

            return (
              <div
                key={clinic.id}
                className="p-4 sm:p-5 rounded-2xl border border-navy-200/90 hover:border-brand-300 hover:shadow-card transition-all bg-white space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-heading font-bold text-sm text-navy-950 hover:text-brand-700 transition-colors">
                        {clinic.name_ja}
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-100 text-navy-700 font-semibold uppercase">
                        {clinic.type || 'clinic'}
                      </span>
                    </div>
                    {clinic.name_en && (
                      <p className="text-xs text-navy-500">{clinic.name_en}</p>
                    )}
                  </div>

                  <Link
                    href={`/clinics/${clinic.id}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors shrink-0 w-fit"
                  >
                    <span>View Clinic &amp; Hours</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-1.5 text-xs text-navy-600">
                  <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{clinic.address}</span>
                </div>

                {/* Departments Tag Badges */}
                {depts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {depts.slice(0, 6).map((d, i) => {
                      const isTarget = d === getJapaneseDepartmentName(selectedDept);
                      return (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                            isTarget
                              ? 'bg-brand-100 text-brand-800 font-bold border border-brand-200'
                              : 'bg-navy-50 text-navy-600'
                          }`}
                        >
                          {d}
                        </span>
                      );
                    })}
                    {depts.length > 6 && (
                      <span className="text-[10px] text-navy-400 font-medium">
                        +{depts.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No Clinics Found Empty State */}
      {!loading && clinics.length === 0 && (
        <div className="bg-navy-50/70 border border-navy-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-white text-navy-400 flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h5 className="font-heading font-bold text-sm text-navy-900">
              No clinics found in {currentWardLabel} for {selectedDept}
            </h5>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              Try switching the area to &ldquo;All Tokyo Wards&rdquo; or explore the complete directory.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/clinics?specialty=${encodeURIComponent(
                getJapaneseDepartmentName(selectedDept)
              )}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <span>Browse All Clinics in MedNavi Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Simple Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-navy-100 text-xs">
          <span className="text-navy-500 font-medium">
            Page {page} of {totalPages} &bull; {total} clinics found
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-navy-800">{page}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
