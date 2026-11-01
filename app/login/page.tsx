'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import {
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Languages,
  AlertCircle,
  Sparkles
} from 'lucide-react';

type Lang = 'en' | 'ja' | 'hi';

const CONTENT: Record<Lang, {
  welcome: string;
  subtitleJa: string;
  subtitleHi: string;
  googleBtn: string;
  guestBtn: string;
  demoBtn: string;
  consent: string;
  disclaimer: string;
  tagline: string;
  devNotice: string;
}> = {
  en: {
    welcome: 'Welcome to MedNavi',
    subtitleJa: 'メドナビへようこそ — 外国人住民のための医療ナビゲーション',
    subtitleHi: 'मेड्नवी में आपका स्वागत है — जापान में स्वास्थ्य साथी',
    googleBtn: 'Continue with Google',
    guestBtn: 'Continue as guest',
    demoBtn: 'Quick Demo Sign In (Dev)',
    consent: 'By continuing you agree that MedNavi saves your history, such as symptom notes and saved clinics, so you can see it later. You can delete it any time.',
    disclaimer: 'MedNavi gives suggestions, not a medical diagnosis.',
    tagline: 'AI Healthcare Copilot for Foreign Residents in Japan',
    devNotice: 'Development mode active — quick demo sign in available below.',
  },
  ja: {
    welcome: 'メドナビへようこそ',
    subtitleJa: '外国人住民のための医療機関ナビゲーション',
    subtitleHi: 'जापान में आपका विश्वसनीय स्वास्थ्य मार्गदर्शक',
    googleBtn: 'Google でログイン',
    guestBtn: 'ゲストとして利用する',
    demoBtn: 'クイックデモログイン（開発環境）',
    consent: '続行することにより、後で確認できるように症状問診票や保存したクリニック履歴が保存されることに同意したとみなされます。履歴はいつでも削除できます。',
    disclaimer: 'メドナビが提供する情報は提案であり、医師の診断ではありません。',
    tagline: '外国人住民のためのAIヘルスケアナビゲーション',
    devNotice: '開発環境モード — デモログインを利用できます。',
  },
  hi: {
    welcome: 'मेड्नवी में आपका स्वागत है',
    subtitleJa: 'メドナビへようこそ — 日本の病院ナビゲーション',
    subtitleHi: 'विदेशी नागरिकों के लिए जापान में विश्वसनीय स्वास्थ्य सेवा',
    googleBtn: 'Google से जारी रखें',
    guestBtn: 'अतिथि के रूप में आगे बढ़ें',
    demoBtn: 'क्विक डेमो लॉगिन (डेवलपमेंट)',
    consent: 'जारी रखकर आप सहमति देते हैं कि मेड्नवी आपकी पिछली जानकारी जैसे लक्षण पर्ची और सहेजे गए क्लिनिक सुरक्षित रखता है ताकि आप उन्हें बाद में देख सकें। आप इसे कभी भी हटा सकते हैं।',
    disclaimer: 'मेड्नवी केवल सुझाव देता है, यह चिकित्सकीय निदान (diagnosis) नहीं है।',
    tagline: 'जापान में विदेशी नागरिकों के लिए AI स्वास्थ्य साथी',
    devNotice: 'डेवलपमेंट मोड सक्रिय — डेमो लॉगिन नीचे उपलब्ध है।',
  },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const callbackUrl = searchParams.get('callbackUrl') || '/profile';
  const [lang, setLang] = useState<Lang>('en');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoEmail, setDemoEmail] = useState('resident@example.com');
  const [demoName, setDemoName] = useState('Aarav Sharma');

  // Check if Google OAuth credentials are configured
  const hasGoogle = Boolean(
    process.env.NEXT_PUBLIC_HAS_GOOGLE !== 'false'
  );
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (e) {
      console.error('Google sign in error:', e);
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDemo(true);
    try {
      const res = await signIn('credentials', {
        email: demoEmail,
        name: demoName,
        redirect: false,
        callbackUrl,
      });
      if (res?.ok) {
        router.push(callbackUrl);
      }
    } catch (e) {
      console.error('Demo sign in error:', e);
    } finally {
      setLoadingDemo(false);
    }
  };

  const t = CONTENT[lang] || CONTENT.en;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#031d17]">
      
      {/* ───────────────────────────────────────────────────────────────────
          LEFT: LIGHT ORGANIC BLOB PANEL WITH ANIMATED JAPAN HOSPITAL SCENE
         ─────────────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-lg lg:max-w-xl aspect-[4/3] sm:aspect-square bg-gradient-to-b from-[#e6f7f2] via-[#e0f4ee] to-[#d3ede4] rounded-[2.5rem] sm:rounded-[3.5rem] p-4 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between border-4 border-emerald-100/60">
          
          {/* Inline CSS Keyframe Animations with Prefers-Reduced-Motion */}
          <style jsx>{`
            @keyframes pulseCross {
              0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 2px rgba(220, 38, 38, 0.4));
              }
              50% {
                transform: scale(1.12);
                filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.8));
              }
            }
            @keyframes petalDrift1 {
              0% { transform: translate(0, -20px) rotate(0deg); opacity: 0; }
              20% { opacity: 0.9; }
              85% { opacity: 0.9; }
              100% { transform: translate(60px, 340px) rotate(280deg); opacity: 0; }
            }
            @keyframes petalDrift2 {
              0% { transform: translate(0, -10px) rotate(30deg); opacity: 0; }
              25% { opacity: 0.8; }
              80% { opacity: 0.8; }
              100% { transform: translate(-50px, 320px) rotate(360deg); opacity: 0; }
            }
            @keyframes petalDrift3 {
              0% { transform: translate(0, -30px) rotate(60deg); opacity: 0; }
              30% { opacity: 0.9; }
              80% { opacity: 0.9; }
              100% { transform: translate(80px, 360px) rotate(420deg); opacity: 0; }
            }
            @keyframes ambulanceMove {
              0% { transform: translateX(-100px); }
              100% { transform: translateX(540px); }
            }
            @keyframes cloudFloat {
              0% { transform: translateX(-20px); }
              50% { transform: translateX(25px); }
              100% { transform: translateX(-20px); }
            }
            .animate-cross {
              transform-origin: 250px 222px;
              animation: pulseCross 2.5s ease-in-out infinite;
            }
            .animate-petal-1 {
              animation: petalDrift1 7s linear infinite;
            }
            .animate-petal-2 {
              animation: petalDrift2 9s linear infinite 2s;
            }
            .animate-petal-3 {
              animation: petalDrift3 8s linear infinite 4.5s;
            }
            .animate-ambulance {
              animation: ambulanceMove 11s linear infinite;
            }
            .animate-cloud-slow {
              animation: cloudFloat 16s ease-in-out infinite;
            }
            .animate-cloud-fast {
              animation: cloudFloat 11s ease-in-out infinite reverse;
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-cross,
              .animate-petal-1,
              .animate-petal-2,
              .animate-petal-3,
              .animate-ambulance,
              .animate-cloud-slow,
              .animate-cloud-fast {
                animation: none !important;
              }
            }
          `}</style>

          {/* Top Header pill inside illustration */}
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-xs font-bold text-teal-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Care Everywhere in Japan</span>
            </span>
            <span className="text-[11px] font-semibold text-teal-700 bg-white/70 px-2.5 py-0.5 rounded-full">
              安心・安全
            </span>
          </div>

          {/* Inline SVG Hospital & Japan Landscape */}
          <div className="w-full flex-1 flex items-center justify-center my-2">
            <svg
              viewBox="0 0 500 400"
              className="w-full h-full max-h-[340px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Golden Rising Sun */}
              <circle cx="250" cy="190" r="95" fill="#fde68a" fillOpacity="0.55" />
              <circle cx="250" cy="190" r="70" fill="#fef08a" fillOpacity="0.75" />

              {/* Mt Fuji Background */}
              <g id="mt-fuji">
                <path
                  d="M120 280 L250 110 L380 280 Z"
                  fill="#5eead4"
                  fillOpacity="0.45"
                />
                {/* Fuji Snow Cap */}
                <path
                  d="M250 110 L220 150 Q235 158 250 150 Q265 158 280 150 Z"
                  fill="#ffffff"
                  fillOpacity="0.95"
                />
              </g>

              {/* Floating Clouds */}
              <g className="animate-cloud-slow" fill="#ffffff" fillOpacity="0.85">
                <circle cx="90" cy="90" r="22" />
                <circle cx="115" cy="85" r="28" />
                <circle cx="140" cy="90" r="20" />
                <rect x="90" y="86" width="50" height="24" rx="10" />
              </g>

              <g className="animate-cloud-fast" fill="#ffffff" fillOpacity="0.75">
                <circle cx="370" cy="115" r="18" />
                <circle cx="392" cy="110" r="24" />
                <circle cx="414" cy="115" r="16" />
                <rect x="370" y="112" width="44" height="20" rx="9" />
              </g>

              {/* Green Foothills / Trees */}
              <ellipse cx="140" cy="285" rx="120" ry="40" fill="#99f6e4" />
              <ellipse cx="360" cy="285" rx="130" ry="42" fill="#a7f3d0" />
              <ellipse cx="250" cy="295" rx="160" ry="35" fill="#6ee7b7" />

              {/* Main Hospital Building */}
              <g id="hospital-building">
                {/* Main Body */}
                <rect x="180" y="190" width="140" height="110" rx="8" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
                {/* Roof top accent */}
                <rect x="200" y="180" width="100" height="12" rx="4" fill="#0d9488" />

                {/* Windows Grid */}
                <rect x="195" y="240" width="22" height="18" rx="3" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
                <rect x="225" y="240" width="22" height="18" rx="3" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
                <rect x="255" y="240" width="22" height="18" rx="3" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
                <rect x="285" y="240" width="22" height="18" rx="3" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />

                {/* Ground floor entrance */}
                <rect x="230" y="268" width="40" height="32" rx="3" fill="#0f766e" />
                <rect x="234" y="273" width="14" height="27" fill="#99f6e4" />
                <rect x="252" y="273" width="14" height="27" fill="#99f6e4" />

                {/* Softly Pulsing Red Cross */}
                <g className="animate-cross">
                  <circle cx="250" cy="216" r="16" fill="#fee2e2" />
                  <rect x="246" y="206" width="8" height="20" rx="2" fill="#ef4444" />
                  <rect x="240" y="212" width="20" height="8" rx="2" fill="#ef4444" />
                </g>
              </g>

              {/* Sakura Branch & Drifting Petals */}
              <g id="sakura-blossoms">
                <path d="M0 60 Q60 50 110 80 Q140 100 170 95" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="70" cy="62" r="7" fill="#fbcfe8" />
                <circle cx="95" cy="72" r="8" fill="#f472b6" />
                <circle cx="115" cy="80" r="6" fill="#fda4af" />
                <circle cx="140" cy="98" r="7" fill="#fbcfe8" />
                <circle cx="160" cy="94" r="8" fill="#f472b6" />

                {/* Falling Petals */}
                <g className="animate-petal-1">
                  <path d="M120 40 Q126 36 128 44 Q124 50 120 40 Z" fill="#f472b6" />
                </g>
                <g className="animate-petal-2">
                  <path d="M220 30 Q228 26 230 36 Q224 42 220 30 Z" fill="#fbcfe8" />
                </g>
                <g className="animate-petal-3">
                  <path d="M330 50 Q338 46 340 56 Q334 62 330 50 Z" fill="#fda4af" />
                </g>
              </g>

              {/* Road Ground */}
              <rect x="0" y="300" width="500" height="40" fill="#334155" />
              <line x1="0" y1="320" x2="500" y2="320" stroke="#f1f5f9" strokeWidth="3" strokeDasharray="16 16" />

              {/* Driving Ambulance Looping Across Bottom */}
              <g className="animate-ambulance">
                {/* Ambulance Body */}
                <rect x="0" y="292" width="60" height="26" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                {/* Red stripe */}
                <rect x="0" y="304" width="60" height="4" fill="#ef4444" />
                {/* Front Cab Window */}
                <path d="M46 295 L56 295 L58 304 L46 304 Z" fill="#38bdf8" />
                {/* Red Cross on side */}
                <rect x="25" y="296" width="3" height="9" fill="#ef4444" />
                <rect x="22" y="299" width="9" height="3" fill="#ef4444" />
                {/* Flashing light on roof */}
                <circle cx="16" cy="289" r="3" fill="#ef4444" />
                {/* Wheels */}
                <circle cx="15" cy="318" r="6" fill="#1e293b" />
                <circle cx="15" cy="318" r="2.5" fill="#cbd5e1" />
                <circle cx="48" cy="318" r="6" fill="#1e293b" />
                <circle cx="48" cy="318" r="2.5" fill="#cbd5e1" />
              </g>
            </svg>
          </div>

          {/* Bottom Caption */}
          <div className="flex items-center justify-between text-xs text-teal-900 font-medium z-10 pt-2 border-t border-teal-200/60">
            <span>Hospital &amp; Clinic Navigation</span>
            <span>Tokyo, Japan 🌸</span>
          </div>

        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          RIGHT: DARK GREEN PANEL WITH FORM & AUTH BUTTONS
         ─────────────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center text-white">
        <div className="w-full max-w-md mx-auto space-y-6">

          {/* Top Bar: MedNavi Logo + Language Selector */}
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-heading font-bold text-xl tracking-tight text-white">
                    Med<span className="text-teal-400">Navi</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded">
                    JAPAN
                  </span>
                </div>
              </div>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-950/90 border border-emerald-800/80 rounded-xl p-1 text-xs font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'en'
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ja')}
                className={`px-2.5 py-1 rounded-lg transition font-japanese ${
                  lang === 'ja'
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                日本語
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'hi'
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <p className="text-xs text-emerald-300/80 font-medium">
            {t.tagline}
          </p>

          {/* Heading & Subtitles */}
          <div className="space-y-1.5 pt-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {t.welcome}
            </h1>
            <p className="text-xs font-japanese text-emerald-200">
              {t.subtitleJa}
            </p>
            <p className="text-xs text-emerald-300/90">
              {t.subtitleHi}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3.5 pt-4">

            {/* Google Login Button */}
            {hasGoogle && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-bold px-5 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {/* Multicolored Google 'G' icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loadingGoogle ? 'Connecting...' : t.googleBtn}</span>
              </button>
            )}

            {/* Continue as Guest Link */}
            <Link
              href="/symptom-checker"
              className="w-full flex items-center justify-center gap-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-100 hover:text-white font-semibold px-5 py-3 rounded-2xl transition-all text-sm"
            >
              <span>{t.guestBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Dev-only demo login section */}
            {isDev && (
              <div className="pt-2">
                <form
                  onSubmit={handleDemoSignIn}
                  className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{t.devNotice}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-emerald-300 font-semibold block mb-0.5">
                        Demo Name
                      </label>
                      <input
                        type="text"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-900/80 border border-emerald-700 text-white placeholder-emerald-400 text-xs focus:ring-1 focus:ring-teal-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-300 font-semibold block mb-0.5">
                        Demo Email
                      </label>
                      <input
                        type="email"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-900/80 border border-emerald-700 text-white placeholder-emerald-400 text-xs focus:ring-1 focus:ring-teal-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loadingDemo}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {loadingDemo ? 'Signing in...' : t.demoBtn}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Consent and Disclaimer Lines */}
          <div className="pt-4 border-t border-emerald-900/80 space-y-2 text-xs text-emerald-300/80 leading-relaxed">
            <p className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{t.consent}</span>
            </p>
            <p className="text-[11px] text-emerald-400/90 italic pl-6">
              {t.disclaimer}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#031d17] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

