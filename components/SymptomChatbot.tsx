'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import MatchingClinicsList from './MatchingClinicsList';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResult {
  department: string;
  backupDepartment?: string;
  reason: string;
  noteEn: string;
  noteJa: string;
  fallbackNotice?: string;
}

const MAX_MESSAGE_LENGTH = 500;

export default function SymptomChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your Japanese Healthcare Navigation Assistant. I will ask you a few brief questions to help determine which medical department in Japan you should visit, and prepare an authentic bilingual doctor note for clinic reception. To start, what is the main symptom or problem you are experiencing today?',
    },
  ]);

  const [input, setInput] = useState('');
  const [step, setStep] = useState(1);
  const [quickChips, setQuickChips] = useState<string[]>([
    'Fever & Chills',
    'Stomach Ache & Nausea',
    'Sore Throat & Cough',
    'Headache & Dizziness',
    'Skin Rash & Itch',
    'Joint or Muscle Pain',
  ]);
  const [loading, setLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<{ active: boolean; reason?: string }>({
    active: false,
  });
  const [completedResult, setCompletedResult] = useState<ChatResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [copiedJa, setCopiedJa] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, emergencyAlert, completedResult]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading || emergencyAlert.active || completedResult) return;

    if (text.length > MAX_MESSAGE_LENGTH) {
      setErrorNotice(`Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    setErrorNotice(null);
    setInput('');

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/symptom-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newMessages,
          step,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.rateLimited) {
          setErrorNotice(data.error || 'Rate limit reached. Please wait a moment before sending.');
        } else {
          setErrorNotice(data.error || 'An error occurred while connecting to the triage service.');
        }
        return;
      }

      // 1. Emergency detected
      if (data.emergency) {
        setEmergencyAlert({
          active: true,
          reason: data.reason || 'Critical or urgent symptoms detected.',
        });
        return;
      }

      // 2. Intake complete
      if (data.done && data.department) {
        setCompletedResult({
          department: data.department,
          backupDepartment: data.backupDepartment,
          reason: data.reason,
          noteEn: data.noteEn,
          noteJa: data.noteJa,
          fallbackNotice: data.fallbackNotice,
        });
        return;
      }

      // 3. Next question
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        if (data.step) setStep(data.step);
        if (Array.isArray(data.quickChips)) {
          setQuickChips(data.quickChips);
        } else {
          setQuickChips([]);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setErrorNotice('Connection error. Please try again or switch to the form.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Hello! I am your Japanese Healthcare Navigation Assistant. I will ask you up to 8 brief questions to help determine which medical department in Japan you should visit, and prepare an authentic bilingual doctor note for clinic reception. To start, what is the main symptom or problem you are experiencing today?',
      },
    ]);
    setInput('');
    setStep(1);
    setQuickChips([
      'Fever & Chills',
      'Stomach Ache & Nausea',
      'Sore Throat & Cough',
      'Headache & Dizziness',
      'Skin Rash & Itch',
      'Joint or Muscle Pain',
    ]);
    setEmergencyAlert({ active: false });
    setCompletedResult(null);
    setErrorNotice(null);
  };

  const copyToClipboard = (text: string, isJa: boolean) => {
    navigator.clipboard.writeText(text);
    if (isJa) {
      setCopiedJa(true);
      setTimeout(() => setCopiedJa(false), 2000);
    } else {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-navy-200 shadow-card overflow-hidden flex flex-col">
      {/* Chatbot Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-heading font-bold text-sm text-white">
                Symptom Triage Copilot
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                Live AI
              </span>
            </div>
            <p className="text-[11px] text-navy-300">
              Department guidance &amp; bilingual doctor note (Non-diagnostic)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!completedResult && !emergencyAlert.active && (
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-navy-300 bg-navy-800/80 px-2.5 py-1 rounded-lg border border-navy-700">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Step {step} of 7</span>
            </div>
          )}

          <button
            onClick={handleReset}
            title="Start new consultation"
            className="p-1.5 text-navy-300 hover:text-white rounded-lg hover:bg-navy-700/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {!completedResult && !emergencyAlert.active && (
        <div className="w-full bg-navy-100 h-1">
          <div
            className="bg-brand-600 h-1 transition-all duration-300"
            style={{ width: `${Math.min(100, (step / 7) * 100)}%` }}
          />
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[460px] min-h-[380px] bg-slate-50/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-navy-800 border border-navy-200/80 shadow-subtle'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-bold tracking-wider text-brand-600 uppercase">
                  <Sparkles className="w-3 h-3" />
                  <span>MedNavi Navigator</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-navy-800 border border-navy-200/80 rounded-2xl px-4 py-3 text-xs flex items-center space-x-2 shadow-subtle">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-150" />
              <span className="text-[11px] text-navy-400 ml-1">Analyzing symptoms...</span>
            </div>
          </div>
        )}

        {/* 119 EMERGENCY TAKEOVER BANNER */}
        {emergencyAlert.active && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 text-red-950 space-y-4 shadow-md animate-in fade-in duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-black text-sm text-red-900 uppercase tracking-wide">
                  Emergency Medical Alert (救急要請)
                </h4>
                <p className="text-xs text-red-800 leading-relaxed">
                  {emergencyAlert.reason ||
                    'Symptoms of this nature may require immediate emergency medical care.'}
                </p>
                <p className="text-[11px] text-red-700 font-semibold pt-1">
                  Chatbot is paused. Please contact Japan Emergency Services immediately.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="tel:119"
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center flex items-center justify-center space-x-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>DIAL 119 (AMBULANCE)</span>
              </a>

              <Link
                href="/emergency"
                className="flex-1 py-3 px-4 rounded-xl bg-white border border-red-300 hover:bg-red-100/50 text-red-800 font-bold text-xs text-center flex items-center justify-center space-x-2 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>View 119 Emergency Guide</span>
              </Link>
            </div>
          </div>
        )}

        {/* FINAL COMPLETED TRIAGE RESULT (Suggested department + note only) */}
        {completedResult && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {completedResult.fallbackNotice && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2.5 font-semibold shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{completedResult.fallbackNotice}</span>
              </div>
            )}

            {/* Department Recommendation Banner */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 sm:p-5 text-brand-950 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-800 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Recommended Department to Visit</span>
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-lg sm:text-xl text-navy-950">
                  {completedResult.department}
                </h4>
                {completedResult.backupDepartment && (
                  <p className="text-xs text-navy-600 mt-0.5">
                    Backup / Alternative: <span className="font-semibold text-navy-800">{completedResult.backupDepartment}</span>
                  </p>
                )}
              </div>

              <div className="text-xs text-navy-700 bg-white/80 p-3 rounded-xl border border-brand-100 leading-relaxed">
                <span className="font-semibold text-navy-900">Why this department: </span>
                {completedResult.reason}
              </div>
            </div>

            {/* Doctor Note Cards */}
            <div className="space-y-3">
              {/* Japanese Reception Note */}
              <div className="bg-white border-2 border-navy-800 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-navy-900">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span>Japanese Clinic Reception Note (受付用・問診票)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(completedResult.noteJa, true)}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-navy-600 hover:text-navy-950 px-2 py-1 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                  >
                    {copiedJa ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy for Staff</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-navy-50/70 rounded-xl font-mono text-[11px] text-navy-900 whitespace-pre-wrap leading-relaxed border border-navy-200/50">
                  {completedResult.noteJa}
                </div>
              </div>

              {/* English Intake Note */}
              <div className="bg-white border border-navy-200 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-navy-900">
                    <HelpCircle className="w-4 h-4 text-navy-500" />
                    <span>English Intake Summary (For Your Reference)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(completedResult.noteEn, false)}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-navy-600 hover:text-navy-950 px-2 py-1 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                  >
                    {copiedEn ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-navy-800 whitespace-pre-wrap leading-relaxed border border-slate-200">
                  {completedResult.noteEn}
                </div>
              </div>
            </div>

            {/* Matching Clinics Filtered by Ward */}
            <MatchingClinicsList
              department={completedResult.department}
              backupDepartment={completedResult.backupDepartment}
            />

            <div className="pt-2 flex justify-center">
              <button
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Assessment</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips for Active Chat */}
      {!completedResult && !emergencyAlert.active && quickChips.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-100/80 border-t border-navy-100 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-navy-500 font-semibold mr-1">Quick Select:</span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-navy-200 text-navy-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-900 font-medium transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Error / Warning Notice */}
      {errorNotice && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{errorNotice}</span>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-amber-900 font-bold ml-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Form */}
      {!completedResult && !emergencyAlert.active && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-navy-100 flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={
                step >= 6
                  ? 'Type your answer or click "None / Skip"...'
                  : 'Describe your symptoms or answer the question...'
              }
              className="w-full px-3.5 py-2.5 pr-14 text-xs rounded-xl border border-navy-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white placeholder-navy-400 disabled:bg-slate-50"
            />
            <span
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] ${
                input.length > 450 ? 'text-amber-600 font-bold' : 'text-navy-400'
              }`}
            >
              {input.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      )}
    </div>
  );
}
