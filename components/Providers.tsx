'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { SavedClinicsProvider } from '@/lib/savedClinicsContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SavedClinicsProvider>{children}</SavedClinicsProvider>
    </SessionProvider>
  );
}
