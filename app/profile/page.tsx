'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  History,
  Bookmark,
  Clock,
  Receipt,
  ShieldCheck,
  Building2,
  Trash2,
  Copy,
  Check,
  FileText,
  ExternalLink,
  Plus,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  LogOut,
  ArrowRight,
  Compass,
  Heart,
  Tag,
  Eye,
  X
} from 'lucide-react';
import { TOKYO_WARDS } from '@/lib/departments';

type Tab = 'details' | 'symptoms' | 'saved' | 'visits' | 'bills' | 'privacy';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const tabParam = (searchParams.get('tab') as Tab) || 'details';
  const [activeTab, setActiveTab] = useState<Tab>(tabParam);

  // Profile details state
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [ward, setWard] = useState('Shinjuku');
  const [nationality, setNationality] = useState('India');
  const [insuranceType, setInsuranceType] = useState('National Health Insurance');
  const [saveHistory, setSaveHistory] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Symptom history state
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Saved clinics state
  const [savedClinics, setSavedClinics] = useState<any[]>([]);
  const [clinicFilter, setClinicFilter] = useState<'all' | 'favorite' | 'want_to_go'>('all');
  const [loadingClinics, setLoadingClinics] = useState(false);

  // Visit log state
  const [visits, setVisits] = useState<any[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [newVisitClinic, setNewVisitClinic] = useState('');
  const [newVisitDate, setNewVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVisitNote, setNewVisitNote] = useState('');
  const [savingVisit, setSavingVisit] = useState(false);

  // Bill history state
  const [bills, setBills] = useState<any[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  // Delete all dialog state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam && ['details', 'symptoms', 'saved', 'visits', 'bills', 'privacy'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  // Load user profile on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (activeTab === 'symptoms') fetchSymptoms();
    if (activeTab === 'saved') fetchSavedClinics();
    if (activeTab === 'visits') fetchVisits();
    if (activeTab === 'bills') fetchBills();
  }, [activeTab, status]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/me/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setName(data.profile.name || session?.user?.name || '');
          setEmail(data.profile.email || session?.user?.email || '');
          setLanguage(data.profile.language || 'en');
          setWard(data.profile.ward || 'Shinjuku');
          setNationality(data.profile.nationality || 'India');
          setInsuranceType(data.profile.insuranceType || 'National Health Insurance');
          setSaveHistory(data.profile.saveHistory ?? true);
        }
      }
    } catch (e) {
      console.error('Fetch profile error:', e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          ward,
          nationality,
          insuranceType,
          saveHistory,
        }),
      });
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'Profile preferences saved successfully!' });
        try {
          localStorage.setItem(
            'mednavi_profile',
            JSON.stringify({ ward, city: ward, nationality, insurance_type: insuranceType })
          );
        } catch (_) {}
      } else {
        setProfileMsg({ type: 'error', text: 'Failed to save profile. Please try again.' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'Network error saving profile.' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const fetchSymptoms = async () => {
    setLoadingSymptoms(true);
    try {
      const res = await fetch('/api/me/history');
      if (res.ok) {
        const data = await res.json();
        setSymptoms(data.history || []);
      }
    } catch (e) {
      console.error('Error fetching symptom notes:', e);
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this symptom note?')) return;
    try {
      const res = await fetch(`/api/me/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSymptoms((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error('Error deleting symptom:', e);
    }
  };

  const handleCopyNote = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const fetchSavedClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await fetch('/api/me/saved-clinics');
      if (res.ok) {
        const data = await res.json();
        setSavedClinics(data.items || []);
      }
    } catch (e) {
      console.error('Error fetching saved clinics:', e);
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleRemoveSavedClinic = async (id: string) => {
    try {
      const res = await fetch(`/api/me/saved-clinics?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedClinics((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error('Error removing saved clinic:', e);
    }
  };

  const handleVisitedClick = (clinic: any) => {
    setNewVisitClinic(clinic.clinicName);
    setNewVisitDate(new Date().toISOString().split('T')[0]);
    setNewVisitNote(`Follow-up visit to ${clinic.clinicName}`);
    setShowAddVisit(true);
    setActiveTab('visits');
  };

  const fetchVisits = async () => {
    setLoadingVisits(true);
    try {
      const res = await fetch('/api/me/visit-log');
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (e) {
      console.error('Error fetching visits:', e);
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleAddVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitClinic.trim()) return;
    setSavingVisit(true);
    try {
      const res = await fetch('/api/me/visit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicName: newVisitClinic.trim(),
          visitedAt: newVisitDate,
          note: newVisitNote.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.visit) {
          setVisits((prev) => [data.visit, ...prev]);
        }
        setShowAddVisit(false);
        setNewVisitClinic('');
        setNewVisitNote('');
      }
    } catch (e) {
      console.error('Error adding visit:', e);
    } finally {
      setSavingVisit(false);
    }
  };

  const handleDeleteVisit = async (id: string) => {
    if (!confirm('Delete this visit log entry?')) return;
    try {
      const res = await fetch(`/api/me/visit-log?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVisits((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (e) {
      console.error('Error deleting visit:', e);
    }
  };

  const fetchBills = async () => {
    setLoadingBills(true);
    try {
      const res = await fetch('/api/me/bill-history');
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || []);
      }
    } catch (e) {
      console.error('Error fetching bills:', e);
    } finally {
      setLoadingBills(false);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Delete this explanation record?')) return;
    try {
      const res = await fetch(`/api/me/bill-history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBills((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error('Error deleting bill record:', e);
    }
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    setDeletingAll(true);
    try {
      const res = await fetch('/api/me/delete-all', { method: 'DELETE' });
      if (res.ok) {
        localStorage.removeItem('mednavi_profile');
        signOut({ callbackUrl: '/' });
      } else {
        alert('Could not complete deletion. Please try again.');
      }
    } catch (e) {
      alert('Network error while deleting data.');
    } finally {
      setDeletingAll(false);
      setShowDeleteModal(false);
    }
  };

  if (status === 'loading' || loadingProfile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-navy-600 font-medium">Loading your MedNavi profile...</p>
      </div>
    );
  }

  const filteredClinics = savedClinics.filter((c) => {
    if (clinicFilter === 'favorite') return c.status === 'favorite';
    if (clinicFilter === 'want_to_go') return c.status === 'want_to_go';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {name ? name.slice(0, 2).toUpperCase() : 'ME'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{name || 'MedNavi Resident'}</h1>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Verified Resident
              </span>
            </div>
            <p className="text-xs text-navy-300 mt-0.5">{email}</p>
            <p className="text-xs text-teal-300 mt-1 font-medium">
              📍 Home Ward: <span className="font-semibold">{ward}</span> ({nationality || 'Japan Expats'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/visit-planner"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition"
          >
            <Compass className="w-4 h-4 text-teal-300" />
            <span>Visit Guide</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-navy-200 overflow-x-auto pb-px">
        {[
          { id: 'details', label: 'My Details', icon: User },
          { id: 'symptoms', label: 'Symptom History', icon: History, count: symptoms.length },
          { id: 'saved', label: 'Saved Clinics', icon: Bookmark, count: savedClinics.length },
          { id: 'visits', label: 'Visit Log', icon: Clock, count: visits.length },
          { id: 'bills', label: 'Bill & Medicine', icon: Receipt, count: bills.length },
          { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                router.replace(`/profile?tab=${tab.id}`, { scroll: false });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                  : 'border-transparent text-navy-600 hover:text-navy-900 hover:bg-navy-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-navy-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-navy-100 text-navy-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: PERSONAL DETAILS
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200/90 shadow-sm max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-navy-950">Personal Details & Preferences</h2>
            <p className="text-xs text-navy-500 mt-0.5">
              Configured information will prefill your medical intake forms and clinic search.
            </p>
          </div>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Full Name (from Google)
                </label>
                <input
                  type="text"
                  value={name}
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-50 border border-navy-200 text-navy-800 text-xs font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-50 border border-navy-200 text-navy-800 text-xs font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Home Ward in Tokyo (居住区)
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {TOKYO_WARDS.filter((w) => w.ja !== '東京都全域').map((w) => (
                    <option key={w.ja} value={w.en}>
                      {w.en} ({w.ja})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Nationality (国籍)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. India, USA, Philippines"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Insurance Type (健康保険種別)
                </label>
                <select
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="National Health Insurance">National Health Insurance (国民健康保険 / NHI)</option>
                  <option value="Social / Employer Insurance">Social Insurance (健康保険 / Shakai Hoken)</option>
                  <option value="Self-pay / None">No Japanese Insurance (100% Self-pay)</option>
                  <option value="Travel / International Insurance">Travel / International Expat Insurance</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                <span>{savingProfile ? 'Saving...' : 'Save Profile Preferences'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: SYMPTOM NOTE HISTORY
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'symptoms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Saved Symptom Notes (問診票サマリー)</h2>
              <p className="text-xs text-navy-500">
                Doctor notes generated during your symptom checker sessions.
              </p>
            </div>
            <Link
              href="/symptom-checker"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Symptom Note</span>
            </Link>
          </div>

          {loadingSymptoms ? (
            <div className="py-12 text-center text-xs text-navy-500">Loading symptom history...</div>
          ) : symptoms.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-navy-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">No symptom notes saved yet</h3>
              <p className="text-xs text-navy-500 max-w-sm mx-auto">
                Use our trilingual symptom checker to generate a Japanese clinic reception note for your doctor.
              </p>
              <Link
                href="/symptom-checker"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Start Symptom Checker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {symptoms.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-navy-200 hover:border-brand-300 transition shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-navy-400 block">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <h4 className="font-bold text-sm text-navy-950 mt-0.5">
                          {item.departmentEn}{' '}
                          <span className="text-xs font-japanese text-navy-500 font-normal">
                            ({item.departmentJa})
                          </span>
                        </h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        item.urgency === '119_now'
                          ? 'bg-red-100 text-red-800'
                          : item.urgency === 'see_doctor_today'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.urgency?.replace(/_/g, ' ') || 'Normal'}
                      </span>
                    </div>

                    <p className="text-xs text-navy-600 line-clamp-3 font-japanese bg-navy-50/70 p-2.5 rounded-xl border border-navy-100 whitespace-pre-wrap">
                      {item.noteJa}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-navy-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedNote(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Note</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyNote(item.noteJa, item.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-navy-700 hover:bg-navy-100 px-2.5 py-1.5 rounded-lg border border-navy-200 transition"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy JA'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSymptom(item.id)}
                        className="p-1.5 text-navy-400 hover:text-red-600 rounded-lg transition"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: SAVED CLINICS
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Saved Clinics &amp; Hospitals</h2>
              <p className="text-xs text-navy-500">
                Medical institutions bookmarked as favorites or places you want to visit.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center bg-navy-100/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setClinicFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  clinicFilter === 'all' ? 'bg-white text-navy-950 shadow-2xs font-bold' : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                All ({savedClinics.length})
              </button>
              <button
                type="button"
                onClick={() => setClinicFilter('favorite')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                  clinicFilter === 'favorite' ? 'bg-white text-navy-950 shadow-2xs font-bold' : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span>Favorites</span>
              </button>
              <button
                type="button"
                onClick={() => setClinicFilter('want_to_go')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                  clinicFilter === 'want_to_go' ? 'bg-white text-navy-950 shadow-2xs font-bold' : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                <Bookmark className="w-3 h-3 text-brand-600 fill-brand-600" />
                <span>Want to go</span>
              </button>
            </div>
          </div>

          {loadingClinics ? (
            <div className="py-12 text-center text-xs text-navy-500">Loading saved clinics...</div>
          ) : filteredClinics.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-navy-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">No saved clinics in this category</h3>
              <p className="text-xs text-navy-500 max-w-sm mx-auto">
                Browse our Tokyo clinic registry to save foreign-friendly doctors and clinics.
              </p>
              <Link
                href="/clinics"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Find Clinics in Tokyo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white rounded-2xl p-5 border border-navy-200 hover:border-brand-300 transition shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-navy-950 hover:text-brand-600 transition font-japanese">
                        <Link href={`/clinics/${clinic.clinicId}`}>
                          {clinic.clinicName}
                        </Link>
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                        clinic.status === 'favorite'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}>
                        {clinic.status === 'favorite' ? (
                          <>
                            <Heart className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                            <span>Favorite</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-2.5 h-2.5 fill-brand-600 text-brand-600" />
                            <span>Want to go</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-navy-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
                      <span>{clinic.address}</span>
                    </p>

                    {clinic.ward && (
                      <span className="inline-block text-[10px] bg-navy-50 text-navy-600 px-2 py-0.5 rounded font-medium">
                        {clinic.ward}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleVisitedClick(clinic)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>I visited</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/clinics/${clinic.clinicId}`}
                        className="inline-flex items-center gap-1 text-xs text-navy-700 hover:text-brand-600 px-2 py-1 rounded-lg transition"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedClinic(clinic.id)}
                        className="p-1.5 text-navy-400 hover:text-red-600 rounded-lg transition"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: VISIT LOG
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Clinic Visit Log (受診履歴)</h2>
              <p className="text-xs text-navy-500">
                Keep track of your medical visits and notes for future doctor consultations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVisit(!showAddVisit)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddVisit ? 'Cancel' : 'Add Visit'}</span>
            </button>
          </div>

          {/* Add Visit Form */}
          {showAddVisit && (
            <form
              onSubmit={handleAddVisitSubmit}
              className="bg-white rounded-2xl p-5 border border-brand-200 shadow-sm space-y-3 max-w-xl animate-in fade-in duration-150"
            >
              <h3 className="font-bold text-sm text-navy-950">Record a Clinic Visit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-navy-700 block mb-1">
                    Clinic / Hospital Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newVisitClinic}
                    onChange={(e) => setNewVisitClinic(e.target.value)}
                    placeholder="e.g. Shinjuku Internal Clinic"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-navy-700 block mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-navy-700 block mb-1">
                  Optional Notes (Doctor advice, prescriptions, next appointment)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={newVisitNote}
                  onChange={(e) => setNewVisitNote(e.target.value)}
                  placeholder="e.g. Prescribed Calonal 500mg. Return next Tuesday if fever persists."
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-navy-200 text-navy-900 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={savingVisit}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                {savingVisit ? 'Saving...' : 'Save Visit'}
              </button>
            </form>
          )}

          {loadingVisits ? (
            <div className="py-12 text-center text-xs text-navy-500">Loading visit log...</div>
          ) : visits.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-navy-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">No clinic visits logged yet</h3>
              <p className="text-xs text-navy-500 max-w-sm mx-auto">
                Record your visits to track medical history, tests performed, and follow-up instructions.
              </p>
              <button
                type="button"
                onClick={() => setShowAddVisit(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Your First Visit</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-navy-200 hover:border-brand-300 transition shadow-2xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                        {new Date(v.visitedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <h4 className="font-bold text-sm text-navy-950">{v.clinicName}</h4>
                    </div>
                    {v.note && (
                      <p className="text-xs text-navy-600 pl-2 border-l-2 border-brand-200 mt-1 whitespace-pre-wrap">
                        {v.note}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteVisit(v.id)}
                    className="p-1.5 text-navy-400 hover:text-red-600 transition"
                    title="Delete visit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 5: BILL & MEDICINE HISTORY
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Bill &amp; Prescription Explanations</h2>
              <p className="text-xs text-navy-500">
                Deciphered Japanese hospital receipts and prescription explanations.
              </p>
            </div>
            <Link
              href="/explainer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Decipher Receipt</span>
            </Link>
          </div>

          {loadingBills ? (
            <div className="py-12 text-center text-xs text-navy-500">Loading saved explanations...</div>
          ) : bills.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-navy-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">No bill explanations saved</h3>
              <p className="text-xs text-navy-500 max-w-sm mx-auto">
                Got a Japanese receipt or prescription? Use the explainer to break down points, copays, and medications in English and Hindi.
              </p>
              <Link
                href="/explainer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Explain Japanese Receipt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bills.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-navy-200 hover:border-brand-300 transition shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-navy-400 block">
                          {new Date(b.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <h4 className="font-bold text-sm text-navy-950 mt-0.5">{b.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        {b.kind === 'medicine' ? '💊 Medicine' : '🧾 Receipt'}
                      </span>
                    </div>

                    {b.summaryJson?.summary_en && (
                      <p className="text-xs text-navy-600 line-clamp-3 bg-navy-50/70 p-2.5 rounded-xl border border-navy-100">
                        {b.summaryJson.summary_en}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-navy-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBill(b)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Breakdown</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBill(b.id)}
                      className="p-1.5 text-navy-400 hover:text-red-600 rounded-lg transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 6: PRIVACY & DATA MANAGEMENT
         ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200/90 shadow-sm max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-navy-950">Privacy, History &amp; Data Control</h2>
            <p className="text-xs text-navy-500 mt-0.5">
              Control your health data privacy and download or delete your records at any time.
            </p>
          </div>

          <div className="space-y-4">
            {/* Auto-save Toggle */}
            <div className="flex items-center justify-between p-4 bg-navy-50/70 rounded-2xl border border-navy-200">
              <div className="pr-4">
                <span className="font-bold text-xs text-navy-900 block">
                  Save my history automatically
                </span>
                <span className="text-[11px] text-navy-500 block mt-0.5">
                  When enabled, doctor notes and deciphered explanations are saved to your profile for future access.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={saveHistory}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setSaveHistory(checked);
                    await fetch('/api/me/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ saveHistory: checked }),
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            {/* Visit Guide Link */}
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-950">Japanese Hospital Visit Guide</p>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  Step-by-step walkthrough: Insurance copays, English phone numbers, reception, and pharmacy guidance.
                </p>
              </div>
              <Link
                href="/visit-planner"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shrink-0"
              >
                <span>Open Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Delete All Data Section */}
            <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Delete All My Data (GDPR / Japan APPI Compliance)</span>
                </h3>
                <p className="text-[11px] text-red-800/80 mt-1">
                  Permanently deletes your user profile, symptom notes, saved clinics, visit logs, and receipts from MedNavi. This action is irreversible.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmText('');
                  setShowDeleteModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All My Data</span>
              </button>
            </div>

            {/* Log Out */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of MedNavi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note View Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <div>
                <h3 className="font-bold text-base text-navy-950">
                  {selectedNote.departmentEn} ({selectedNote.departmentJa})
                </h3>
                <p className="text-xs text-navy-500">
                  Generated {new Date(selectedNote.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-brand-700 block mb-1">
                  Japanese Doctor Intake Note (日本語問診票):
                </span>
                <pre className="text-xs font-japanese bg-navy-50 p-4 rounded-xl border border-navy-200 whitespace-pre-wrap leading-relaxed text-navy-900">
                  {selectedNote.noteJa}
                </pre>
              </div>

              {selectedNote.noteEn && (
                <div>
                  <span className="text-xs font-bold text-navy-700 block mb-1">
                    English Translation:
                  </span>
                  <pre className="text-xs bg-navy-50 p-4 rounded-xl border border-navy-200 whitespace-pre-wrap leading-relaxed text-navy-800">
                    {selectedNote.noteEn}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopyNote(selectedNote.noteJa, selectedNote.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Japanese Note</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 bg-navy-100 text-navy-700 hover:bg-navy-200 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill View Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <div>
                <h3 className="font-bold text-base text-navy-950">{selectedBill.title}</h3>
                <p className="text-xs text-navy-500">
                  Saved {new Date(selectedBill.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedBill.summaryJson?.summary_en && (
              <div className="bg-brand-50/70 border border-brand-200 rounded-xl p-4 text-xs text-navy-800 leading-relaxed">
                <span className="font-bold text-brand-900 block mb-1">Summary (English):</span>
                {selectedBill.summaryJson.summary_en}
              </div>
            )}

            {selectedBill.summaryJson?.summary_hi && (
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-xs text-navy-800 leading-relaxed">
                <span className="font-bold text-teal-900 block mb-1">हिन्दी सारांश (Hindi):</span>
                {selectedBill.summaryJson.summary_hi}
              </div>
            )}

            {selectedBill.summaryJson?.medicines && Array.isArray(selectedBill.summaryJson.medicines) && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-navy-900">Prescribed Medicines:</span>
                <div className="space-y-2">
                  {selectedBill.summaryJson.medicines.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 bg-navy-50 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-navy-900">{m.name_ja} ({m.name_en})</p>
                      <p className="text-navy-600">{m.purpose_en}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 bg-navy-100 text-navy-700 hover:bg-navy-200 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-navy-950">Delete All Data Permanently</h3>
              <p className="text-xs text-navy-500 leading-relaxed">
                This will delete your profile, symptom history, saved clinics, visit logs, and account from our servers.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-navy-700 block text-center">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center tracking-widest font-mono text-sm px-3.5 py-2 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-500 font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim() !== 'DELETE' || deletingAll}
                onClick={handleDeleteAllData}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {deletingAll ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-navy-600 font-medium">Loading profile...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
