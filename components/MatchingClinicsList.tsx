'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  TOKYO_WARDS,
  getCanonicalDepartment,
  getTotalDepartmentClinicCount,
  CanonicalDepartment
} from '@/lib/departments';

interface MatchingClinicsListProps {
  department: string;
  backupDepartment?: string;
}

interface FilteredClinic {
  id: string;
  name_ja: string;
  name_en?: string;
  address: string;
  ward?: string;
  type?: string;
  matchedDepartment: string;
}

export default function MatchingClinicsList({
  department,
  backupDepartment,
}: MatchingClinicsListProps) {
  const [selectedWard, setSelectedWard] = useState('all');
  const [clinics, setClinics] = useState<FilteredClinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedTermsTried, setSearchedTermsTried] = useState<string[]>([]);
  const [activeSearchedDept, setActiveSearchedDept] = useState<string>(department);

  const primaryDeptInfo = getCanonicalDepartment(department);
  const backupDeptInfo = backupDepartment ? getCanonicalDepartment(backupDepartment) : undefined;
  const canonicalJa = primaryDeptInfo?.ja || department;
  const backupJa = backupDeptInfo?.ja || backupDepartment;

  // Total count across canonical and aliases for few clinics warning
  const totalDepartmentCount = getTotalDepartmentClinicCount(canonicalJa);
  const isFewClinics = totalDepartmentCount > 0 && totalDepartmentCount <= 85;

  useEffect(() => {
    let isCancelled = false;

    async function searchClinicsSequence() {
      setLoading(true);
      setClinics([]);
      setSearchedTermsTried([]);

      const collected: FilteredClinic[] = [];
      const seenIds = new Set<string>();
      const termsTried: string[] = [];

      // Build sequence of terms to search:
      // 1. Canonical Japanese name
      // 2. Each alias of canonical department
      // 3. Backup department canonical name
      // 4. Each alias of backup department
      const sequence: string[] = [canonicalJa];

      if (primaryDeptInfo?.aliases) {
        for (const alias of primaryDeptInfo.aliases) {
          if (!sequence.includes(alias)) {
            sequence.push(alias);
          }
        }
      }

      if (backupJa && !sequence.includes(backupJa)) {
        sequence.push(backupJa);
      }

      if (backupDeptInfo?.aliases) {
        for (const alias of backupDeptInfo.aliases) {
          if (!sequence.includes(alias)) {
            sequence.push(alias);
          }
        }
      }

      try {
        for (const term of sequence) {
          if (isCancelled) break;
          if (collected.length >= 3) break;

          termsTried.push(term);
          setActiveSearchedDept(term);

          // Fetch up to 3 pages per term (limit 50 per page)
          for (let page = 1; page <= 3; page++) {
            if (isCancelled) break;

            const params = new URLSearchParams();
            params.set('specialty', term);
            if (selectedWard && selectedWard !== 'all') {
              params.set('ward', selectedWard);
            }
            params.set('limit', '50');
            params.set('page', String(page));

            const res = await fetch(`/api/clinics?${params.toString()}`);
            if (!res.ok) break;

            const data = await res.json();
            if (!data.success || !Array.isArray(data.clinics) || data.clinics.length === 0) {
              break;
            }

            // In-code filter: Keep clinic ONLY if one of its departments EXACTLY equals term
            for (const c of data.clinics) {
              if (seenIds.has(c.id)) continue;

              let depts: string[] = [];
              if (Array.isArray(c.departments)) {
                depts = c.departments;
              } else if (typeof c.departments === 'string') {
                try {
                  depts = JSON.parse(c.departments);
                } catch {
                  depts = [];
                }
              }

              const hasExactDept = depts.some(
                (d) => typeof d === 'string' && d.trim() === term
              );

              if (hasExactDept) {
                seenIds.add(c.id);
                collected.push({
                  id: c.id,
                  name_ja: c.name_ja,
                  name_en: c.name_en,
                  address: c.address,
                  ward: c.ward,
                  type: c.type,
                  matchedDepartment: term,
                });
              }
            }

            // If we have at least 3 clinics, or fewer than 50 clinics were returned by API, stop paging
            if (collected.length >= 3 || data.clinics.length < 50) {
              break;
            }
          }
        }

        if (!isCancelled) {
          setClinics(collected);
          setSearchedTermsTried(termsTried);
        }
      } catch (err) {
        console.error('Error finding matching clinics:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    searchClinicsSequence();

    return () => {
      isCancelled = true;
    };
  }, [canonicalJa, backupJa, selectedWard]);

  const currentWardLabel =
    TOKYO_WARDS.find((w) => w.ja === selectedWard)?.en || selectedWard;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header and Ward Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Matching Clinics in Tokyo</span>
          </div>
          <h4 className="font-bold text-lg text-gray-900 font-japanese">
            {canonicalJa}
            {primaryDeptInfo?.en && (
              <span className="text-gray-500 font-normal text-sm ml-2">
                ({primaryDeptInfo.en})
              </span>
            )}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Registry clinics verified to list this exact medical department
          </p>
        </div>

        {/* Ward Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="relative">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-gray-900 shadow-2xs cursor-pointer"
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

      {/* Few clinics note (e.g. 総合診療科, 睡眠外来, 血液・腫瘍内科) */}
      {isFewClinics && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Limited Specialized Clinics in Tokyo (東京都内に約{totalDepartmentCount}施設)
            </p>
            <p className="leading-relaxed opacity-90">
              {canonicalJa} is a highly specialized or hospital-centered field with few independent clinics across Tokyo.
              If no nearby clinics appear, consider expanding to <strong>All Tokyo Wards</strong> or consulting general internal medicine (内科) / general hospitals.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-10 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-600 font-medium">
            Searching Tokyo clinics for {activeSearchedDept} in {currentWardLabel}...
          </p>
        </div>
      )}

      {/* Results list */}
      {!loading && clinics.length > 0 && (
        <div className="space-y-3">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xs transition bg-white space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-bold text-sm text-gray-900 font-japanese hover:text-blue-700 transition">
                      {clinic.name_ja}
                    </h5>
                    {clinic.type && (
                      <span className="text-2xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium uppercase">
                        {clinic.type}
                      </span>
                    )}
                  </div>
                  {clinic.name_en && (
                    <p className="text-xs text-gray-500 mt-0.5">{clinic.name_en}</p>
                  )}
                </div>

                <Link
                  href={`/clinics/${clinic.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition shrink-0 w-fit"
                >
                  <span>View Details &amp; Hours</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 text-xs text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>{clinic.address}</span>
              </div>

              {/* Matched department tag */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-2xs text-gray-400">Matched department:</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md font-japanese flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {clinic.matchedDepartment}
                </span>
              </div>
            </div>
          ))}

          {/* Prompt specified text under results */}
          <div className="pt-2 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">
              Showing clinics listing this department name
            </p>
          </div>
        </div>
      )}

      {/* No clinics found state */}
      {!loading && clinics.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
          <h5 className="font-bold text-gray-900 text-sm">
            No clinics found listing &ldquo;{canonicalJa}&rdquo; in {currentWardLabel}
          </h5>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            {searchedTermsTried.length > 1
              ? `We also searched aliases (${searchedTermsTried.slice(1).join(', ')}) without finding an exact department match in this ward.`
              : 'None of the registered facilities in this ward match this department name.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {selectedWard !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedWard('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition"
              >
                Search All Tokyo Wards
              </button>
            )}
            <Link
              href="/clinics"
              className="inline-flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition"
            >
              <span>Browse Full Clinics Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
