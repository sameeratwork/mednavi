import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MedNavi Japan | AI Care-Navigation Copilot for Foreign Residents',
  description: 'Navigate Japanese clinics and hospitals with ease. Real clinic open data, bilingual Japanese-English-Hindi symptom intake notes, visit planning, insurance copay estimation, and 119 emergency guidance.',
  keywords: 'Japan healthcare, Tokyo clinics, foreign residents Japan, Indian expats Tokyo, Japanese doctor English, Monshinhyo, 119 emergency Japan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏥</text></svg>" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
