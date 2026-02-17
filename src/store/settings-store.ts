'use client';

import { create } from 'zustand';

interface SettingsStore {
  apskaitinisLaikotarpisMenesiai: number;
  defaultPietuPertrauka: number;
  imonesVardas: string;
  loaded: boolean;
  fetchSettings: () => Promise<void>;
  setSettings: (s: Partial<Omit<SettingsStore, 'setSettings' | 'fetchSettings' | 'loaded'>>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  apskaitinisLaikotarpisMenesiai: 1,
  defaultPietuPertrauka: 60,
  imonesVardas: '',
  loaded: false,

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      set({
        imonesVardas: data.imonesVardas ?? '',
        defaultPietuPertrauka: data.defaultPietuPertrauka ?? 60,
        apskaitinisLaikotarpisMenesiai: data.apskaitinisLaikotarpisMenesiai ?? 1,
        loaded: true,
      });
    } catch (err) {
      console.error('fetchSettings error:', err);
      set({ loaded: true });
    }
  },

  setSettings: async (s) => {
    set((state) => ({ ...state, ...s }));

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
    } catch (err) {
      console.error('setSettings error:', err);
    }
  },
}));
