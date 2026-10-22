'use client';

import React, { useState } from 'react';
import { Copy, Check, Printer, Smartphone, FileText, AlertCircle, Share2 } from 'lucide-react';

interface DoctorNoteCardProps {
  summaryJa: string;
  summaryEn: string;
  summaryHi?: string;
  suggestedDepartment?: string;
  patientName?: string;
  urgencyLevel?: string;
}

export default function DoctorNoteCard({
  summaryJa,
  summaryEn,
  summaryHi,
  suggestedDepartment,
  patientName,
  urgencyLevel,
}: DoctorNoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'doctor' | 'english' | 'hindi'>('doctor');

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryJa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-navy-200 shadow-card overflow-hidden">
      
      {/* Top Header Controls */}
      <div className="bg-navy-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
              Bilingual Intake Assistant
            </span>
            <h3 className="font-heading font-bold text-base text-white">
              Doctor Consultation Note (問診票)
            </h3>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-navy-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'doctor'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-300 hover:text-white'
            }`}
          >
            🇯🇵 Doctor Mode (日本語)
          </button>
          <button
            onClick={() => setActiveTab('english')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'english'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-300 hover:text-white'
            }`}
          >
            🇬🇧 English
          </button>
          {summaryHi && (
            <button
              onClick={() => setActiveTab('hindi')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'hindi'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              🇮🇳 हिन्दी
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        
        {/* DOCTOR MODE (HIGH CONTRAST LARGE JAPANESE TEXT FOR CLINIC RECEPTION) */}
        {activeTab === 'doctor' && (
          <div className="space-y-4">
            {/* Reception Instruction Banner */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="font-bold text-amber-900 text-sm font-jp">
                  【受付・医師への提示画面】
                </h4>
                <p className="text-xs text-amber-800 font-jp mt-0.5 leading-relaxed">
                  この画面をそのまま受付のスタッフまたは医師にお見せください。<br className="hidden sm:inline" />
                  （Show this screen directly to the receptionist or doctor in Japan）
                </p>
              </div>
            </div>

            {/* High-Contrast Japanese Intake Note */}
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-6 font-jp text-navy-950 shadow-inner">
              <div className="border-b-2 border-navy-900/20 pb-3 mb-4 flex justify-between items-center">
                <span className="text-xs font-bold text-navy-600 tracking-wide uppercase">
                  問診票サマリー（外国人居住者）
                </span>
                {suggestedDepartment && (
                  <span className="px-2.5 py-1 bg-brand-100 text-brand-900 font-bold text-xs rounded-lg">
                    推奨受診科: {suggestedDepartment}
                  </span>
                )}
              </div>

              <div className="whitespace-pre-wrap text-base sm:text-lg leading-relaxed font-medium text-navy-950 font-jp">
                {summaryJa}
              </div>
            </div>
          </div>
        )}

        {/* ENGLISH PATIENT GUIDE */}
        {activeTab === 'english' && (
          <div className="space-y-4">
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-900 leading-relaxed">
              <p className="font-bold mb-1">How to use this at the clinic:</p>
              <p>
                When entering the clinic, hand over your Health Insurance Card (健康保険証) or My Number Card, and switch to <strong>Doctor Mode (日本語)</strong> to show your phone to the receptionist.
              </p>
            </div>

            <div className="bg-white border border-navy-200 rounded-2xl p-6 prose prose-navy max-w-none text-navy-800 text-sm leading-relaxed whitespace-pre-wrap">
              {summaryEn}
            </div>
          </div>
        )}

        {/* HINDI PATIENT GUIDE */}
        {activeTab === 'hindi' && summaryHi && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">क्लिनिक में इसका उपयोग कैसे करें:</p>
              <p>
                क्लिनिक में काउंटर पर अपना हेल्थ इंश्योरेंस कार्ड (Hokensho) देते समय, ऊपर दिए गए <strong>Doctor Mode (日本語)</strong> बटन को दबाकर जापानी स्क्रीन सीधे रिसेप्शनिस्ट को दिखाएं।
              </p>
            </div>

            <div className="bg-white border border-navy-200 rounded-2xl p-6 text-navy-900 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {summaryHi}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-navy-100">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs font-semibold shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-navy-500" />
                  <span>Copy Japanese Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-navy-200 hover:bg-navy-50 text-navy-700 text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-navy-500" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <p className="text-[11px] text-navy-400">
            Tip: Take a screenshot so you can access it offline.
          </p>
        </div>

      </div>
    </div>
  );
}
