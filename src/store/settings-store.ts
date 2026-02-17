'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  apskaitinisLaikotarpisMenesiai: number;
  defaultPietuPertrauka: number;
  imonesVardas: string;
  setSettings: (s: Partial<Omit<SettingsStore, 'setSettings'>>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apskaitinisLaikotarpisMenesiai: 1,
      defaultPietuPertrauka: 60,
      imonesVardas: '',

      setSettings: (s) => {
        set((state) => ({ ...state, ...s }));
      },
    }),
    {
      name: 'darbo-apskaita-settings',
    }
  )
);
