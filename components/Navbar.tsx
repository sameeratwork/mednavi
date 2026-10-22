'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HeartHandshake, 
  MapPin, 
  FileText, 
  CalendarCheck, 
  Receipt, 
  PhoneCall, 
  User, 
  Menu, 
  X,
  Languages,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ nationality?: string; city?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mednavi_profile');
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch (e) {
      // LocalStorage access safe guard
    }
  }, [pathname]);

  const navLinks = [
    { href: '/clinics', label: 'Find Clinics', icon: MapPin },
    { href: '/symptom-checker', label: 'Symptom Note (問診)', icon: FileText },
    { href: '/visit-planner', label: 'Visit Guide', icon: CalendarCheck },
    { href: '/explainer', label: 'Bill & Medicine', icon: Receipt },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-navy-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-heading font-bold text-xl tracking-tight text-navy-900">
                    Med<span className="text-brand-600">Navi</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded">
                    JAPAN
                  </span>
                </div>
                <p className="text-[10px] text-navy-500 font-medium tracking-wide -mt-0.5">
                  AI Healthcare Copilot for Foreign Residents
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 font-semibold'
                        : 'text-navy-600 hover:text-brand-600 hover:bg-navy-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-navy-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions & Emergency Pill */}
            <div className="flex items-center space-x-2.5">
              {/* Emergency Shortcut */}
              <Link
                href="/emergency"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emergency-50 hover:bg-emergency-100 text-emergency-700 border border-emergency-200 shadow-sm transition-all animate-pulse-subtle"
                title="Emergency 119 Guide & Triage"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-emergency-600" />
                <span>119 Emergency</span>
              </Link>

              {/* Profile Badge */}
              <Link
                href="/onboarding"
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-navy-200 hover:border-brand-300 text-navy-700 hover:bg-brand-50/50 text-xs font-medium transition-colors"
              >
                <span className="text-sm">🇮🇳</span>
                <span className="max-w-[100px] truncate">
                  {userProfile?.city || 'Tokyo'}
                </span>
                <User className="w-3.5 h-3.5 text-navy-400 ml-0.5" />
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-navy-600 hover:text-navy-900 hover:bg-navy-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-navy-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 font-semibold'
                      : 'text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-brand-600" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-navy-100 flex flex-col space-y-2">
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm text-navy-700 bg-navy-50 rounded-lg"
              >
                <span className="flex items-center space-x-2">
                  <span>🇮🇳 Profile & Constraints</span>
                </span>
                <span className="text-xs text-brand-600 font-medium">Edit</span>
              </Link>
              <Link
                href="/emergency"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold bg-emergency-600 text-white rounded-lg"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 119 / Emergency Triage Guide</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-navy-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand-700 font-semibold' : 'text-navy-500 hover:text-navy-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-600' : 'text-navy-400'}`} />
              <span>{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <Link
          href="/emergency"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold text-emergency-600"
        >
          <AlertTriangle className="w-5 h-5 mb-0.5 text-emergency-600" />
          <span>119 ER</span>
        </Link>
      </div>
    </>
  );
}
