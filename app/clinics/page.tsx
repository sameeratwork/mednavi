'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  Languages, 
  Calendar, 
  ShieldCheck, 
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Map from '@/components/Map';
import ClinicCard from '@/components/ClinicCard';

function ClinicsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [facilityType, setFacilityType] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [mobileView, setMobileView] = useState<'split' | 'map' | 'list'>('split');

  // Debounce search input
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset page on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [facilityType, languageFilter, specialtyFilter, weekendOnly]);

  // Fetch clinics from API with all filters
  const fetchClinics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim());
      if (facilityType !== 'all') params.set('type', facilityType);
      if (languageFilter !== 'all') params.set('language', languageFilter);
      if (specialtyFilter !== 'all') params.set('specialty', specialtyFilter);
      params.set('page', String(currentPage));
      params.set('limit', '100');

      const res = await fetch(`/api/clinics?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setClinics(data.clinics);
        setTotalResults(data.total ?? data.count ?? 0);
      }
    } catch (err) {
      console.error('Error fetching clinics:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, facilityType, languageFilter, specialtyFilter, currentPage]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  // Client-side weekend filter (opening_hours is JSON, hard to do in SQL)
  const displayClinics = weekendOnly
    ? clinics.filter((clinic) => {
        const hours = JSON.stringify(clinic.opening_hours || '').toLowerCase();
        return hours.includes('saturday') && !hours.includes('closed');
      })
    : clinics;

  const totalPages = Math.max(1, Math.ceil(totalResults / 100));

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setFacilityType('all');
    setLanguageFilter('all');
    setSpecialtyFilter('all');
    setWeekendOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Public Open Data (MHLW &amp; Tokyo Himawari)</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy-950">
            Find Foreign-Friendly Medical Facilities
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 mt-1">
            Real clinics and hospitals across Tokyo with verified language support and National Health Insurance (NHI) acceptance.
          </p>
        </div>

        {/* Mobile View Toggle Buttons */}
        <div className="flex lg:hidden items-center bg-navy-100 p-1 rounded-xl text-xs font-semibold self-start">
          <button
            onClick={() => setMobileView('list')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 ${
              mobileView === 'list' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 ${
              mobileView === 'map' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-navy-200 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, English, Japanese, ward, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="all">All Languages</option>
              <option value="en">English Supported (英語)</option>
              <option value="hi">🇮🇳 Hindi Friendly (हिन्दी)</option>
              <option value="ja">Japanese (日本語)</option>
            </select>
          </div>

          <div>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="all">All Facilities</option>
              <option value="clinic">Clinics (診療所 / 小児科 / 内科)</option>
              <option value="hospital">Hospitals (総合病院 / 救急)</option>
            </select>
          </div>

          <div>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="all">All Specialties</option>
              <option value="Internal Medicine">Internal Medicine (内科)</option>
              <option value="Pediatrics">Pediatrics (小児科)</option>
              <option value="Cardiology">Cardiology (循環器科)</option>
              <option value="Dermatology">Dermatology (皮膚科)</option>
              <option value="Obstetrics">Obstetrics &amp; GYN (産婦人科)</option>
              <option value="Emergency">Emergency Care (救急科)</option>
            </select>
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-navy-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center space-x-1.5 cursor-pointer text-navy-700">
              <input
                type="checkbox"
                checked={weekendOnly}
                onChange={(e) => setWeekendOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium">Open on Weekends (Saturday consultation)</span>
            </label>

            <button
              type="button"
              onClick={() => setLanguageFilter(languageFilter === 'hi' ? 'all' : 'hi')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                languageFilter === 'hi'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
              }`}
            >
              🇮🇳 Hindi-Friendly Clinics Filter
            </button>
          </div>

          <div className="flex items-center space-x-3 text-navy-500">
            <span>
              Showing <strong>{displayClinics.length}</strong> of <strong>{totalResults.toLocaleString()}</strong> facilities
              {totalPages > 1 && (
                <> &middot; Page {currentPage}/{totalPages}</>
              )}
            </span>
            {(searchQuery || facilityType !== 'all' || languageFilter !== 'all' || specialtyFilter !== 'all' || weekendOnly) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Map & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        <div
          className={`lg:col-span-6 lg:block ${
            mobileView === 'list' ? 'hidden' : 'block'
          }`}
        >
          <div className="sticky top-24 h-[450px] lg:h-[calc(100vh-140px)] w-full">
            <Map
              clinics={displayClinics}
              selectedClinicId={selectedClinicId}
              onSelectClinic={(id) => setSelectedClinicId(id)}
              zoom={12}
            />
          </div>
        </div>

        <div
          className={`lg:col-span-6 space-y-4 ${
            mobileView === 'map' ? 'hidden' : 'block'
          }`}
        >
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-navy-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : displayClinics.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-navy-200 space-y-3">
              <Building2 className="w-10 h-10 text-navy-300 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-navy-900">
                No facilities found matching your criteria
              </h3>
              <p className="text-xs text-navy-500 max-w-sm mx-auto">
                Try clearing some filters or expanding your search to all languages and facility types.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {displayClinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  isSelected={clinic.id === selectedClinicId}
                  onSelect={() => setSelectedClinicId(clinic.id)}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold text-navy-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-50 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <span className="text-xs text-navy-500 font-medium px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold text-navy-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-50 transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
}

export default function ClinicsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-navy-500">Loading Clinics Finder...</p>
      </div>
    }>
      <ClinicsContent />
    </Suspense>
  );
}
