'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Phone,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';
import { EMERGENCY_NUMBERS, EmergencyService } from '@/lib/emergencyNumbers';

export default function EmergencyPhoneDirectory() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ja' | 'hi'>('en');

  const handleCopy = (id: string, number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Directory Title & Verification Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emergency-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Official Japan Emergency &amp; Crisis Directory</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-navy-950">
            Emergency &amp; Helpline Numbers
          </h2>
          <p className="text-xs text-navy-500 mt-0.5">
            Tap to call directly from your phone. On desktop, copy the number to dial.
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-navy-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              lang === 'en' ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            type="button"
            onClick={() => setLang('ja')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              lang === 'ja' ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇯🇵 日本語
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              lang === 'hi' ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            🇮🇳 हिन्दी
          </button>
        </div>
      </div>

      {/* Grid of Emergency Number Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMERGENCY_NUMBERS.map((service) => {
          const isPrimary = service.isPrimary;
          const isCopied = copiedId === service.id;

          return (
            <div
              key={service.id}
              className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                isPrimary
                  ? 'border-red-500 bg-gradient-to-b from-red-50 to-white shadow-lg ring-2 ring-red-500/20'
                  : service.category === 'police'
                  ? 'border-blue-300 bg-blue-50/30 hover:border-blue-400'
                  : service.category === 'consultation'
                  ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                  : 'border-navy-200 bg-white hover:border-brand-300 shadow-subtle'
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isPrimary
                        ? 'bg-red-600 text-white animate-pulse'
                        : service.category === 'police'
                        ? 'bg-blue-100 text-blue-800'
                        : service.category === 'consultation'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-navy-100 text-navy-700'
                    }`}
                  >
                    {service.badge[lang]}
                  </span>

                  <span className="text-[10px] text-navy-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{service.hours[lang]}</span>
                  </span>
                </div>

                {/* Service Name */}
                <div>
                  <h3 className="font-heading font-black text-base text-navy-950">
                    {service.name[lang]}
                  </h3>
                  <p className="text-[11px] text-navy-600 mt-1 leading-relaxed">
                    {service.description[lang]}
                  </p>
                </div>
              </div>

              {/* Call & Copy Actions */}
              <div className="pt-4 mt-3 border-t border-navy-100/80 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Big Tap to Call Button */}
                  <a
                    href={service.telUri}
                    className={`flex-1 py-3 px-4 rounded-2xl font-heading font-black text-sm flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-md ${
                      isPrimary
                        ? 'bg-red-600 hover:bg-red-700 text-white text-base shadow-red-600/30'
                        : 'bg-navy-900 hover:bg-navy-800 text-white'
                    }`}
                  >
                    <PhoneCall className={`w-4 h-4 ${isPrimary ? 'animate-bounce' : ''}`} />
                    <span>CALL {service.number}</span>
                  </a>

                  {/* Desktop Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(service.id, service.number)}
                    className="p-3 rounded-2xl border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 transition-colors shrink-0 shadow-sm"
                    title={`Copy ${service.number}`}
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Alternative Number if available (e.g. #7119 landline) */}
                {service.altNumber && service.altTelUri && (
                  <div className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-xl border border-navy-100">
                    <span className="text-navy-500 font-medium">
                      Landline alt: <strong className="text-navy-900">{service.altNumber}</strong>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <a
                        href={service.altTelUri}
                        className="px-2 py-1 rounded-lg bg-navy-100 hover:bg-navy-200 text-navy-800 font-bold transition-colors"
                      >
                        Call
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${service.id}-alt`, service.altNumber!)}
                        className="p-1 text-navy-500 hover:text-navy-800"
                        title="Copy alternative number"
                      >
                        {copiedId === `${service.id}-alt` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Disclaimer Note */}
      <div className="p-3.5 rounded-2xl bg-navy-50 border border-navy-200 text-xs text-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="font-semibold text-navy-900">
            Check official sources before relying on these numbers.
          </span>
          <span className="text-navy-500">
            Hotlines and hours are maintained by Tokyo Metropolitan and national agencies.
          </span>
        </div>
        <span className="text-[11px] font-mono text-navy-400 shrink-0">
          Last verified: June 2026
        </span>
      </div>
    </div>
  );
}
