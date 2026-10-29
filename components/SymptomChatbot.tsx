'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  FileText,
  Clock,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Activity,
  Wind,
  HeartPulse,
  Utensils,
  Droplet,
  Users,
  Baby,
  Brain,
  Flame,
  Crosshair,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';

import {
  SYMPTOM_CATEGORIES,
  SYMPTOM_GROUPS,
  SymptomCategory,
  SymptomGroup,
  findGroupByKeyword,
  getGroupById,
  getGroupsByCategory
} from '@/lib/symptomGroups';
import {
  checkEmergencyTrigger,
  checkSelfHarmTrigger,
  getCrisisSupportResources,
  evaluateUrgency,
  generateDoctorNotes,
  PatientIntakeData,
  UrgencyInfo,
  GeneratedDoctorNote
} from '@/lib/ai/symptomChatbot';
import { getCanonicalDepartment, CanonicalDepartment } from '@/lib/departments';
import MatchingClinicsList from './MatchingClinicsList';

// Category icon mapper
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  general: <Activity className="w-5 h-5 text-blue-600" />,
  respiratory: <Wind className="w-5 h-5 text-sky-600" />,
  heart: <HeartPulse className="w-5 h-5 text-red-600" />,
  digestive: <Utensils className="w-5 h-5 text-amber-600" />,
  urinary: <Droplet className="w-5 h-5 text-indigo-600" />,
  reproductive: <Users className="w-5 h-5 text-purple-600" />,
  children: <Baby className="w-5 h-5 text-pink-600" />,
  neurology_mental: <Brain className="w-5 h-5 text-teal-600" />,
  endocrine_blood: <Flame className="w-5 h-5 text-orange-600" />,
  skin_aesthetic: <Sparkles className="w-5 h-5 text-rose-600" />,
  musculoskeletal: <Crosshair className="w-5 h-5 text-emerald-600" />,
  ent_eyes: <Eye className="w-5 h-5 text-cyan-600" />,
  dental_preventive: <ShieldCheck className="w-5 h-5 text-lime-600" />
};

export default function SymptomChatbot() {
  // Navigation / Wizard step state
  // 1: Start (Input / Categories)
  // 2: Confirm Matched Group ("Is it X?")
  // 3: Emergency Tick-List (Red Flags)
  // 4: Shared Q1 - Duration
  // 5: Shared Q2 - Severity (1-10)
  // 6: Shared Q3 - Age Group & Pregnancy
  // 7: Shared Q4 - Medications Taken
  // 8: Shared Q5 - Allergies & Conditions
  // 9: Result (Department, Urgency, Doctor Note)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User input text
  const [inputText, setInputText] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Group selection & confirmation
  const [selectedGroup, setSelectedGroup] = useState<SymptomGroup | null>(null);
  const [candidateGroup, setCandidateGroup] = useState<SymptomGroup | null>(null);
  const [browsingCategory, setBrowsingCategory] = useState<SymptomCategory | null>(null);

  // Red flag emergency check
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState<string | null>(null);

  // Self-harm / crisis safe stop
  const [selfHarmTriggered, setSelfHarmTriggered] = useState(false);

  // Intake data state
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState<number>(5);
  const [ageGroup, setAgeGroup] = useState('Adult (18-64) / 成人');
  const [isPregnant, setIsPregnant] = useState('not_pregnant');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');

  // Result state
  const [urgencyResult, setUrgencyResult] = useState<UrgencyInfo | null>(null);
  const [primaryDeptInfo, setPrimaryDeptInfo] = useState<CanonicalDepartment | null>(null);
  const [backupDeptInfo, setBackupDeptInfo] = useState<CanonicalDepartment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<GeneratedDoctorNote | null>(null);
  const [activeNoteTab, setActiveNoteTab] = useState<'ja' | 'en' | 'hi'>('ja');
  const [copied, setCopied] = useState(false);

  // Reset all states
  const handleReset = () => {
    setCurrentStep(1);
    setInputText('');
    setCharCount(0);
    setSelectedGroup(null);
    setCandidateGroup(null);
    setBrowsingCategory(null);
    setSelectedRedFlags([]);
    setEmergencyTriggered(false);
    setEmergencyReason(null);
    setSelfHarmTriggered(false);
    setDuration('');
    setSeverity(5);
    setAgeGroup('Adult (18-64) / 成人');
    setIsPregnant('not_pregnant');
    setMedications('');
    setAllergies('');
    setUrgencyResult(null);
    setPrimaryDeptInfo(null);
    setBackupDeptInfo(null);
    setDoctorNotes(null);
    setCopied(false);
  };

  // Text submit handler
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    // 1. Instant emergency check (EN, JA, HI)
    if (checkEmergencyTrigger(text)) {
      setEmergencyReason('Immediate emergency keywords detected in your description.');
      setEmergencyTriggered(true);
      return;
    }

    // 2. Self-harm / mental crisis check
    if (checkSelfHarmTrigger(text)) {
      setSelfHarmTriggered(true);
      return;
    }

    // 3. Keyword matching to symptom groups
    const matched = findGroupByKeyword(text);
    if (matched) {
      setCandidateGroup(matched);
      setCurrentStep(2); // Ask "Is it X?"
    } else {
      // No keyword match: guide user to pick from 13 body-area categories
      setBrowsingCategory(SYMPTOM_CATEGORIES[0]);
    }
  };

  // Group confirmation handler
  const confirmGroup = (group: SymptomGroup) => {
    setSelectedGroup(group);
    setCandidateGroup(null);
    setBrowsingCategory(null);

    // If group has red flags, go to emergency tick-list, else go to Q1
    if (group.redFlags && group.redFlags.length > 0) {
      setCurrentStep(3);
    } else {
      setCurrentStep(4);
    }
  };

  // Emergency tick-list handler
  const handleRedFlagSubmit = (hasRedFlags: boolean) => {
    if (hasRedFlags && selectedRedFlags.length > 0) {
      setEmergencyReason('One or more danger red flags were confirmed on the emergency checklist.');
      setEmergencyTriggered(true);
    } else {
      setSelectedRedFlags([]);
      // Group questions are empty for now, proceed to shared Q1
      setCurrentStep(4);
    }
  };

  // Final calculate and note generation
  const finalizeIntake = () => {
    if (!selectedGroup) return;

    const intake: PatientIntakeData = {
      groupId: selectedGroup.id,
      chiefComplaint: inputText.trim() || selectedGroup.name.en,
      duration: duration || 'A few days ago / 数日前から',
      severity,
      ageGroup,
      isPregnant,
      medications: medications || 'None reported / 特になし',
      allergies: allergies || 'None reported / 特になし',
      checkedRedFlags: selectedRedFlags
    };

    const pDept = getCanonicalDepartment(selectedGroup.primaryDept);
    const bDept = selectedGroup.backupDept ? getCanonicalDepartment(selectedGroup.backupDept) : undefined;
    const urgency = evaluateUrgency(intake, selectedGroup);
    const notes = generateDoctorNotes(intake);

    setPrimaryDeptInfo(pDept || null);
    setBackupDeptInfo(bDept || null);
    setUrgencyResult(urgency);
    setDoctorNotes(notes);
    setCurrentStep(9);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CRITICAL CRISIS SCREEN (Self-harm / Suicide)
  // ───────────────────────────────────────────────────────────────────────────
  if (selfHarmTriggered) {
    const resources = getCrisisSupportResources();
    return (
      <div className="bg-white border-2 border-red-500 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You Are Not Alone. Support Is Available.</h2>
        <p className="text-sm font-japanese text-gray-600 mb-4">
          命の危機やこころの苦しさを感じている方へ。秘密厳守で相談できる窓口があります。
        </p>
        <p className="text-gray-700 text-sm mb-6">
          If you are going through a crisis or having thoughts of self-harm, please reach out right now.
          Trained counselors in Japan are ready to listen and help you in English and Japanese.
        </p>

        <div className="space-y-4 mb-6 text-left">
          {resources.tell && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{resources.tell.name.en}</p>
                <p className="text-xs text-gray-600 font-japanese">{resources.tell.name.ja}</p>
                <p className="text-xs text-gray-500 mt-1">{resources.tell.hours.en}</p>
              </div>
              <a
                href={resources.tell.telUri}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm shadow-md transition"
              >
                <PhoneCall className="w-4 h-4" />
                {resources.tell.number}
              </a>
            </div>
          )}

          {resources.ambulance && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Immediate Physical Danger: Ambulance (119)</p>
                <p className="text-xs text-gray-600 font-japanese">救急・消防（24時間365日）</p>
              </div>
              <a
                href="tel:119"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm shadow-md transition"
              >
                <PhoneCall className="w-4 h-4" />
                Call 119
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            Emergency Numbers Guide
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Checker
          </button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CRITICAL EMERGENCY SCREEN (119 Ambulance Alert)
  // ───────────────────────────────────────────────────────────────────────────
  if (emergencyTriggered) {
    return (
      <div className="bg-white border-2 border-red-500 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 animate-pulse">
          <AlertTriangle className="w-9 h-9" />
        </div>
        <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Immediate 119 Ambulance Needed
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">直ちに119番（救急車）を呼んでください</h2>
        <p className="text-gray-700 text-sm mb-4">
          {emergencyReason || 'Potentially life-threatening emergency symptoms have been detected.'}
        </p>
        <p className="text-xs text-gray-500 mb-6 font-japanese">
          胸痛、激しい呼吸困難、意識混濁、大量出血などの緊急事態は、クリニックではなく救急外来での即時処置が必要です。
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 text-center">
          <p className="text-sm text-red-900 font-semibold mb-3">Call Japan Emergency Ambulance:</p>
          <a
            href="tel:119"
            className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xl px-8 py-3.5 rounded-xl shadow-lg transition w-full sm:w-auto"
          >
            <PhoneCall className="w-6 h-6" />
            Dial 119 (救急車)
          </a>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            Open 119 Communication Card
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Checker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">
              Bilingual Japanese Doctor Note Generator
            </h2>
            <p className="text-xs text-slate-300 font-japanese">
              症状グループ別 医療機関ナビゲーション・問診票サマリー作成
            </p>
          </div>
        </div>
        {currentStep > 1 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            title="Start Over"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        )}
      </div>

      <div className="p-5 sm:p-8">
        {/* ───────────────────────────────────────────────────────────────────
            STEP 1: START SCREEN (Text input + 13 Body-Area Categories)
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                What brings you to the clinic today?
              </h3>
              <p className="text-sm text-gray-600">
                Type your symptoms in English, 日本語, or हिन्दी, or choose a body area below.
              </p>
            </div>

            {/* Free text input box (max 200 chars) */}
            <form onSubmit={handleTextSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={200}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setCharCount(e.target.value.length);
                  }}
                  placeholder="e.g., fever and severe sore throat since yesterday, or 胃の痛みと吐き気"
                  className="w-full pl-4 pr-24 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium rounded-lg text-sm flex items-center gap-1.5 transition"
                >
                  <span>Find</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                <span>Keyword-matched directly to Japanese clinic departments</span>
                <span className={charCount > 180 ? 'text-amber-600 font-semibold' : ''}>
                  {charCount}/200 characters
                </span>
              </div>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Or browse by body area
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* 13 Body-Area Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SYMPTOM_CATEGORIES.map((cat) => {
                const groupCount = getGroupsByCategory(cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setBrowsingCategory(cat)}
                    className="text-left p-3.5 border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl transition flex items-start gap-3 group"
                  >
                    <div className="p-2 bg-gray-50 group-hover:bg-white rounded-lg border border-gray-100 shadow-2xs">
                      {CATEGORY_ICONS[cat.id] || <Activity className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 flex items-center justify-between">
                        <span>{cat.name.en}</span>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <p className="text-xs font-japanese text-gray-600 truncate">{cat.name.ja}</p>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{cat.description.en}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            CATEGORY BROWSER MODAL / SUB-MENU
           ─────────────────────────────────────────────────────────────────── */}
        {browsingCategory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{browsingCategory.name.en}</h4>
                  <p className="text-xs font-japanese text-gray-600">{browsingCategory.name.ja}</p>
                </div>
                <button
                  onClick={() => setBrowsingCategory(null)}
                  className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                <p className="text-xs text-gray-500 mb-2 font-medium">Select the specific issue you want to address:</p>
                {getGroupsByCategory(browsingCategory.id).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => confirmGroup(g)}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/60 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">
                        {g.name.en}
                      </span>
                      <span className="text-xs bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-800 px-2 py-0.5 rounded font-japanese">
                        {g.primaryDept}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-japanese mt-0.5">{g.name.ja}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 2: CONFIRM MATCHED GROUP ("Is it X?")
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 2 && candidateGroup && (
          <div className="max-w-xl mx-auto space-y-6 text-center py-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-1">
                Keyword Match Found
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Is your main issue: &ldquo;{candidateGroup.name.en}&rdquo;?
              </h3>
              <p className="text-sm font-japanese text-gray-600">
                主訴の確認: {candidateGroup.name.ja}（推奨診療科: {candidateGroup.primaryDept}）
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => confirmGroup(candidateGroup)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Yes, that&apos;s correct</span>
              </button>
              <button
                onClick={() => {
                  setCandidateGroup(null);
                  setCurrentStep(1);
                  setBrowsingCategory(SYMPTOM_CATEGORIES[0]);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-3 rounded-xl text-sm transition"
              >
                No, choose from full list
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 3: ONE-TIME EMERGENCY TICK-LIST (Red Flags)
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 3 && selectedGroup && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Safety Triage
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Emergency Checklist for {selectedGroup.name.en}
                </h3>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Do you or the patient experience <strong>any</strong> of these critical warning signs right now?
            </p>

            <div className="space-y-2.5">
              {selectedGroup.redFlags.map((flag, idx) => {
                const checked = selectedRedFlags.includes(flag);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      checked
                        ? 'bg-red-50/80 border-red-300 text-red-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRedFlags([...selectedRedFlags, flag]);
                        } else {
                          setSelectedRedFlags(selectedRedFlags.filter((f) => f !== flag));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm leading-snug">{flag}</span>
                  </label>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {selectedRedFlags.length > 0 ? (
                <button
                  onClick={() => handleRedFlagSubmit(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>I have marked emergency symptoms</span>
                </button>
              ) : (
                <button
                  onClick={() => handleRedFlagSubmit(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>None of these apply — Continue</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 4: SHARED Q1 - DURATION
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600">Question 1 of 5</span>
                <h3 className="text-lg font-bold text-gray-900">
                  When did these symptoms first start?
                </h3>
                <p className="text-xs font-japanese text-gray-600">発症時期の確認</p>
              </div>
              <button
                onClick={() => setCurrentStep(selectedGroup?.redFlags.length ? 3 : 1)}
                className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { en: 'Started today (今日から)', ja: '今朝・数時間前から' },
                { en: 'Since yesterday (昨日から)', ja: '昨日から' },
                { en: '2 to 3 days ago (2〜3日前から)', ja: '2〜3日前から' },
                { en: 'About 1 week ago (約1週間前から)', ja: '約1週間前から' },
                { en: 'More than 2 weeks ago (2週間以上前から)', ja: '2週間以上前から' },
                { en: 'Several months (数ヶ月前から)', ja: '数ヶ月前から' }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDuration(opt.en);
                    setCurrentStep(5);
                  }}
                  className={`p-3 text-left rounded-xl border text-sm font-medium transition ${
                    duration === opt.en
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  {opt.en}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setDuration('Not specified / 未記載');
                  setCurrentStep(5);
                }}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Skip this question
              </button>
              {duration && (
                <button
                  onClick={() => setCurrentStep(5)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 5: SHARED Q2 - SEVERITY (1-10)
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 5 && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600">Question 2 of 5</span>
                <h3 className="text-lg font-bold text-gray-900">
                  How severe is your pain or discomfort?
                </h3>
                <p className="text-xs font-japanese text-gray-600">痛みの重症度（1: 軽度 〜 10: 激痛）</p>
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-blue-600">{severity}</span>
                <span className="text-gray-600 text-lg"> / 10</span>
                <p className="text-xs text-gray-500 mt-1">
                  {severity <= 3
                    ? 'Mild / 軽度 (Noticeable but does not disrupt daily routine)'
                    : severity <= 6
                    ? 'Moderate / 中等度 (Distracting, affects normal activities)'
                    : severity <= 8
                    ? 'Severe / 重度 (Severe discomfort, hard to concentrate or sleep)'
                    : 'Very Severe / 激痛 (Unbearable, urgent relief required)'}
                </p>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />

              <div className="flex justify-between text-xs text-gray-600 font-semibold px-1">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Unbearable)</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep(6)}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Skip this question
              </button>
              <button
                onClick={() => setCurrentStep(6)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 6: SHARED Q3 - AGE GROUP & PREGNANCY
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 6 && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600">Question 3 of 5</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Patient Age Group & Profile
                </h3>
                <p className="text-xs font-japanese text-gray-600">患者の年齢層・該当情報</p>
              </div>
              <button
                onClick={() => setCurrentStep(5)}
                className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-800">Select Age Group:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { en: 'Adult (18-64) / 成人', ja: '18〜64歳' },
                  { en: 'Senior (65+) / 高齢者', ja: '65歳以上' },
                  { en: 'Child (3-17) / 小児', ja: '3〜17歳' },
                  { en: 'Infant (under 3) / 乳幼児', ja: '3歳未満' }
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAgeGroup(opt.en)}
                    className={`p-3 text-left rounded-xl border text-sm font-medium transition ${
                      ageGroup === opt.en
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    {opt.en}
                  </button>
                ))}
              </div>

              {/* Show pregnancy option only when relevant (Adult or Women's health categories) */}
              {(ageGroup.includes('Adult') ||
                selectedGroup?.id === 'g11' ||
                selectedGroup?.id === 'g12' ||
                selectedGroup?.id === 'g10') && (
                <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 mt-3">
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-2">
                    Pregnancy Check (if applicable)
                  </p>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={isPregnant === 'Currently pregnant'}
                      onChange={(e) =>
                        setIsPregnant(e.target.checked ? 'Currently pregnant' : 'not_pregnant')
                      }
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span>Patient is currently pregnant (現在妊娠中)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep(7)}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Skip this question
              </button>
              <button
                onClick={() => setCurrentStep(7)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 7: SHARED Q4 - MEDICATIONS TAKEN
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 7 && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600">Question 4 of 5</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Have you taken any medicines for this?
                </h3>
                <p className="text-xs font-japanese text-gray-600">現在服用中の薬・市販薬の確認</p>
              </div>
              <button
                onClick={() => setCurrentStep(6)}
                className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">Quick options (click to select):</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'None (なし)',
                  'Paracetamol / Dolo',
                  'Calonal (カロナール)',
                  'Loxonin (ロキソニン)',
                  'Ibuprofen (イブプロフェン)'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (chip.includes('None')) {
                        setMedications('None (特になし)');
                      } else {
                        setMedications(medications ? `${medications}, ${chip}` : chip);
                      }
                    }}
                    className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-800 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={150}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Or type other medicines (e.g. Crocin, Blood pressure pills)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setMedications('None reported / 特になし');
                  setCurrentStep(8);
                }}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Skip this question
              </button>
              <button
                onClick={() => setCurrentStep(8)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 8: SHARED Q5 - ALLERGIES & CONDITIONS
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 8 && (
          <div className="max-w-xl mx-auto space-y-6 py-2">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600">Question 5 of 5</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Any drug allergies or chronic conditions?
                </h3>
                <p className="text-xs font-japanese text-gray-600">薬のアレルギー・持病の確認</p>
              </div>
              <button
                onClick={() => setCurrentStep(7)}
                className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">Quick options (click to select):</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'None (なし)',
                  'Penicillin allergy (ペニシリン)',
                  'Aspirin / NSAID allergy',
                  'Asthma (気管支喘息)',
                  'Diabetes (糖尿病)',
                  'Hypertension (高血圧)'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (chip.includes('None')) {
                        setAllergies('None (特になし)');
                      } else {
                        setAllergies(allergies ? `${allergies}, ${chip}` : chip);
                      }
                    }}
                    className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-800 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={150}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Or type other known allergies or existing health conditions"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setAllergies('None reported / 特になし');
                  finalizeIntake();
                }}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Skip and Generate Note
              </button>
              <button
                onClick={finalizeIntake}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Doctor Note</span>
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            STEP 9: RESULTS SCREEN (Department + Urgency + Trilingual Note)
           ─────────────────────────────────────────────────────────────────── */}
        {currentStep === 9 && selectedGroup && urgencyResult && doctorNotes && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Top Banner: Department Match */}
            <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 shadow-md border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                    Recommended Medical Department (推奨診療科)
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-japanese text-slate-900">
                    {primaryDeptInfo?.ja || selectedGroup.primaryDept}
                  </h3>
                  <p className="text-slate-700 text-sm font-medium mt-0.5">
                    {primaryDeptInfo?.romaji && `${primaryDeptInfo.romaji} • `}
                    {primaryDeptInfo?.en || selectedGroup.primaryDept}
                  </p>
                </div>

                {backupDeptInfo && (
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 sm:text-right">
                    <span className="text-2xs text-slate-500 uppercase font-bold tracking-wider block">
                      Backup Specialty (代替診療科)
                    </span>
                    <span className="font-bold text-sm font-japanese text-slate-600">{backupDeptInfo.ja}</span>
                    <span className="text-xs text-slate-600 block">{backupDeptInfo.en}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Urgency Badge */}
            <div
              className={`rounded-xl p-4 border flex items-start gap-3.5 ${
                urgencyResult.color === 'red'
                  ? 'bg-red-50 border-red-300 text-red-950'
                  : urgencyResult.color === 'amber'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : urgencyResult.color === 'emerald'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-blue-50 border-blue-300 text-blue-950'
              }`}
            >
              <div className="mt-0.5">
                <Clock className="w-5 h-5 shrink-0" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{urgencyResult.badge.en}</span>
                  <span className="text-xs font-japanese font-semibold opacity-80">
                    ({urgencyResult.badge.ja})
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {urgencyResult.description.en}
                </p>
              </div>
            </div>

            {/* Doctor Note Card */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Reception Intake Note
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-200 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setActiveNoteTab('ja')}
                    className={`px-3 py-1 rounded-md transition ${
                      activeNoteTab === 'ja'
                        ? 'bg-white text-gray-900 font-bold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    日本語 (Doctor)
                  </button>
                  <button
                    onClick={() => setActiveNoteTab('en')}
                    className={`px-3 py-1 rounded-md transition ${
                      activeNoteTab === 'en'
                        ? 'bg-white text-gray-900 font-bold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setActiveNoteTab('hi')}
                    className={`px-3 py-1 rounded-md transition ${
                      activeNoteTab === 'hi'
                        ? 'bg-white text-gray-900 font-bold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <pre className="font-mono text-xs sm:text-sm text-gray-900 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-gray-200">
                  {activeNoteTab === 'ja' && doctorNotes.noteJa}
                  {activeNoteTab === 'en' && doctorNotes.noteEn}
                  {activeNoteTab === 'hi' && doctorNotes.noteHi}
                </pre>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-600">
                    💡 Show the Japanese tab on your phone directly to the clinic receptionist or doctor.
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activeNoteTab === 'ja'
                          ? doctorNotes.noteJa
                          : activeNoteTab === 'en'
                          ? doctorNotes.noteEn
                          : doctorNotes.noteHi
                      )
                    }
                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Matching Clinics List (Sequential search: canonical -> aliases -> backup + In-Code Filter) */}
            <MatchingClinicsList
              department={primaryDeptInfo?.ja || selectedGroup.primaryDept}
              backupDepartment={backupDeptInfo?.ja || selectedGroup.backupDept}
            />

            {/* Restart Button */}
            <div className="text-center pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Check another symptom or start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
