'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true once all Zustand persist stores have rehydrated from localStorage.
 * Prevents hydration mismatch between server (empty) and client (stored data).
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
