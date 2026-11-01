'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ClinicDataInput {
  id: string;
  name_ja: string;
  name_en?: string | null;
  address?: string;
  ward?: string | null;
  departments?: any;
}

interface SavedClinicsContextValue {
  isFavorite: (clinicId: string) => boolean;
  isWantToGo: (clinicId: string) => boolean;
  toggleSave: (clinic: ClinicDataInput, status: 'favorite' | 'want_to_go') => Promise<void>;
  loading: boolean;
}

const SavedClinicsContext = createContext<SavedClinicsContextValue | undefined>(undefined);

export function SavedClinicsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [wantToGoIds, setWantToGoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch saved clinic IDs once when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      let isCancelled = false;
      setLoading(true);

      fetch('/api/me/saved-clinics')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isCancelled && data?.ids) {
            setFavoriteIds(new Set(data.ids.favorite || []));
            setWantToGoIds(new Set(data.ids.want_to_go || []));
          }
        })
        .catch((err) => {
          console.warn('Failed to load saved clinics cache:', err);
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setFavoriteIds(new Set());
      setWantToGoIds(new Set());
    }
  }, [status]);

  const isFavorite = useCallback(
    (clinicId: string) => favoriteIds.has(clinicId),
    [favoriteIds]
  );

  const isWantToGo = useCallback(
    (clinicId: string) => wantToGoIds.has(clinicId),
    [wantToGoIds]
  );

  const toggleSave = useCallback(
    async (clinic: ClinicDataInput, targetStatus: 'favorite' | 'want_to_go') => {
      // If logged out, redirect to login with callback URL
      if (status !== 'authenticated') {
        const currentPath = typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/clinics';
        router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      const clinicId = clinic.id;
      const isFav = targetStatus === 'favorite';
      const currentSet = isFav ? favoriteIds : wantToGoIds;
      const setFunction = isFav ? setFavoriteIds : setWantToGoIds;
      const alreadySaved = currentSet.has(clinicId);

      // 1. Optimistic Update
      setFunction((prev) => {
        const next = new Set(prev);
        if (alreadySaved) {
          next.delete(clinicId);
        } else {
          next.add(clinicId);
        }
        return next;
      });

      // 2. Call API
      try {
        const res = await fetch('/api/me/saved-clinics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId,
            clinicName: clinic.name_en || clinic.name_ja,
            address: clinic.address || 'Tokyo, Japan',
            ward: clinic.ward || undefined,
            departments: clinic.departments || undefined,
            status: targetStatus,
          }),
        });

        if (!res.ok) {
          throw new Error('Save API returned error status');
        }

        const data = await res.json();
        if (data.saved === false && !alreadySaved) {
          // Revert if mismatch
          setFunction((prev) => {
            const next = new Set(prev);
            next.delete(clinicId);
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to toggle clinic save status, reverting:', err);
        // Rollback optimistic update
        setFunction((prev) => {
          const next = new Set(prev);
          if (alreadySaved) {
            next.add(clinicId);
          } else {
            next.delete(clinicId);
          }
          return next;
        });
        alert('Could not update saved clinic status. Please try again.');
      }
    },
    [status, router, favoriteIds, wantToGoIds]
  );

  return (
    <SavedClinicsContext.Provider value={{ isFavorite, isWantToGo, toggleSave, loading }}>
      {children}
    </SavedClinicsContext.Provider>
  );
}

export function useSavedClinics() {
  const context = useContext(SavedClinicsContext);
  if (!context) {
    throw new Error('useSavedClinics must be used within a SavedClinicsProvider');
  }
  return context;
}

