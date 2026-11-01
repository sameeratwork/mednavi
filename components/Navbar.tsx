'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  AlertTriangle,
  LogIn,
  LogOut,
  ChevronDown,
  Bookmark,
  History,
  Clock,
  Compass
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<{ nationality?: string; city?: string; ward?: string } | null>(null);

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

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    }

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/clinics', label: 'Find Clinics', icon: MapPin },
    { href: '/symptom-checker', label: 'Symptom Note (問診)', icon: FileText },
    { href: '/visit-planner', label: 'Visit Guide', icon: CalendarCheck },
    { href: '/explainer', label: 'Bill & Medicine', icon: Receipt },
  ];

  const isLoggedIn = status === 'authenticated' && Boolean(session?.user);
  const user = session?.user;
  const firstName = user?.name ? user.name.split(' ')[0] : 'My Account';
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const homeWard = userProfile?.ward || userProfile?.city || 'Tokyo';

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

            {/* Actions & Auth / Profile */}
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

              {/* Logged Out: Log in Button */}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </Link>
              )}

              {/* Logged In: Avatar + First Name + Accessible Dropdown */}
              {isLoggedIn && (
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-navy-200 hover:border-brand-400 text-navy-800 hover:bg-brand-50/50 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-7 h-7 rounded-lg object-cover border border-brand-300"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                        {initials}
                      </div>
                    )}
                    <span className="font-semibold text-navy-900 max-w-[90px] truncate">
                      {firstName}
                    </span>
                    <span className="text-[10px] bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded font-medium max-w-[70px] truncate">
                      {homeWard}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-navy-400 ml-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-navy-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-navy-100">
                        <p className="text-xs font-bold text-navy-950 truncate">
                          {user?.name || 'MedNavi User'}
                        </p>
                        <p className="text-[11px] text-navy-500 truncate mt-0.5">
                          {user?.email || ''}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-2xs bg-brand-50 text-brand-800 border border-brand-200 font-semibold px-2 py-0.5 rounded-md">
                            📍 Ward: {homeWard}
                          </span>
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1 text-xs text-navy-700">
                        <Link
                          href="/profile?tab=details"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-navy-50 transition"
                        >
                          <User className="w-4 h-4 text-brand-600" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/profile?tab=symptoms"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-navy-50 transition"
                        >
                          <History className="w-4 h-4 text-teal-600" />
                          <span>Symptom History</span>
                        </Link>
                        <Link
                          href="/profile?tab=saved"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-navy-50 transition"
                        >
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          <span>Saved Clinics</span>
                        </Link>
                        <Link
                          href="/profile?tab=visits"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-navy-50 transition"
                        >
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span>Visit Log</span>
                        </Link>
                        <Link
                          href="/profile?tab=bills"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-navy-50 transition"
                        >
                          <Receipt className="w-4 h-4 text-emerald-600" />
                          <span>Bill &amp; Medicine History</span>
                        </Link>
                        <Link
                          href="/visit-planner"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-navy-50 transition text-navy-800 font-medium"
                        >
                          <Compass className="w-4 h-4 text-blue-600" />
                          <span>Visit Guide</span>
                        </Link>
                      </div>

                      {/* Log Out */}
                      <div className="pt-1 border-t border-navy-100">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-navy-600 hover:text-navy-900 hover:bg-navy-100 focus:outline-none cursor-pointer"
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
              {/* Logged in mobile links */}
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 bg-navy-50 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-navy-900">{user?.name || 'My Account'}</p>
                    <p className="text-[11px] text-navy-500">{user?.email}</p>
                    <p className="text-[10px] text-brand-700 font-medium">📍 Ward: {homeWard}</p>
                  </div>
                  <Link
                    href="/profile?tab=details"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 rounded-lg"
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/profile?tab=symptoms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 rounded-lg"
                  >
                    <History className="w-4 h-4 text-teal-600" />
                    <span>Symptom History</span>
                  </Link>
                  <Link
                    href="/profile?tab=saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 rounded-lg"
                  >
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>Saved Clinics</span>
                  </Link>
                  <Link
                    href="/profile?tab=visits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Visit Log</span>
                  </Link>
                  <Link
                    href="/profile?tab=bills"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 rounded-lg"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Bill &amp; Medicine History</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-bold bg-brand-600 text-white rounded-xl shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in / Sign up</span>
                </Link>
              )}

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
          href={isLoggedIn ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            pathname === '/profile' ? 'text-brand-700 font-semibold' : 'text-navy-500 hover:text-navy-800'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{isLoggedIn ? 'Profile' : 'Log in'}</span>
        </Link>
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
