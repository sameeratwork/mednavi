import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Phone, ShieldAlert, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300 pt-12 pb-20 md:pb-12 border-t border-navy-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Hotline Banner */}
        <div className="bg-navy-900/80 border border-emergency-700/40 rounded-2xl p-4 sm:p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-emergency-600/20 text-emergency-400 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Immediate Emergency Numbers in Japan</h4>
              <p className="text-navy-300 text-xs mt-0.5">
                Ambulance / Fire: <span className="text-white font-bold text-sm">119</span> &bull; 
                Tokyo Emergency Medical Consultation: <span className="text-white font-bold text-sm">#7119</span> (or 03-3212-2323)
              </p>
            </div>
          </div>
          <Link
            href="/emergency"
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-semibold text-xs tracking-wide shadow-md transition-colors"
          >
            Emergency 119 Guide & Hospitals
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-lg text-white">MedNavi</span>
            </div>
            <p className="text-xs text-navy-400 leading-relaxed">
              Care navigation copilot helping foreign residents and Indian expatriates in Japan safely access medical clinics, translate symptoms, and navigate the healthcare system.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-navy-400">
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>English &bull; 日本語 &bull; हिन्दी</span>
            </div>
          </div>

          {/* Quick Features */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3 font-heading">Navigation Tools</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/clinics" className="hover:text-white transition-colors">Clinic & Hospital Finder (Map)</Link></li>
              <li><Link href="/symptom-checker" className="hover:text-white transition-colors">Bilingual Symptom Builder (問診)</Link></li>
              <li><Link href="/visit-planner" className="hover:text-white transition-colors">Visit Guide & Cost Estimator</Link></li>
              <li><Link href="/explainer" className="hover:text-white transition-colors">Bill & Medicine Explainer</Link></li>
              <li><Link href="/emergency" className="hover:text-white transition-colors">119 Emergency Triage Guide</Link></li>
            </ul>
          </div>

          {/* Official Open Data Sources */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3 font-heading">Verified Open Data Sources</h5>
            <ul className="space-y-2 text-xs text-navy-400">
              <li className="flex items-center space-x-1.5">
                <span>&bull;</span>
                <span className="text-navy-300">MHLW Medical Institution Open Data (厚生労働省)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>&bull;</span>
                <span className="text-navy-300">Tokyo Metropolitan Government "Himawari" (東京都 ひまわり)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>&bull;</span>
                <span className="text-navy-300">OpenStreetMap Japan Contributors</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>&bull;</span>
                <span className="text-navy-300">Edogawa & Minato Wards Public Registers</span>
              </li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-3 font-heading flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Medical Disclaimer</span>
            </h5>
            <p className="text-[11px] text-navy-400 leading-relaxed bg-navy-900/60 p-3 rounded-lg border border-navy-800">
              MedNavi provides navigational information and language translation assistance. It does not provide medical diagnosis or substitute professional doctor consultations. Always seek the advice of a licensed physician in Japan.
            </p>
          </div>

        </div>

        <div className="border-t border-navy-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-500">
          <p>&copy; {new Date().getFullYear()} MedNavi Japan. Built for international residents.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link href="/onboarding" className="hover:text-navy-300">User Profile</Link>
            <Link href="/emergency" className="hover:text-navy-300">Emergency Contacts</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
