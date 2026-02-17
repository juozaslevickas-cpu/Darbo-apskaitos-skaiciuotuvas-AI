'use client';

import { create } from 'zustand';
import type { ScheduleEntry } from '@/models/schedule-entry';

function monthKey(employeeId: string, year: number, month: number): string {
  return `${employeeId}_${year}_${month}`;
}

interface ScheduleStore {
  entries: Record<string, ScheduleEntry[]>;
  loading: Record<string, boolean>;
  fetchMonthEntries: (employeeId: string, year: number, month: number) => Promise<ScheduleEntry[]>;
  getMonthEntries: (employeeId: string, year: number, month: number) => ScheduleEntry[];
  setEntry: (entry: ScheduleEntry) => Promise<void>;
  deleteEmployeeEntries: (employeeId: string) => Promise<void>;
  initializeMonth: (employeeId: string, year: number, month: number, defaultPietuPertrauka?: number) => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>()((set, get) => ({
  entries: {},
  loading: {},

  fetchMonthEntries: async (employeeId, year, month) => {
    const key = monthKey(employeeId, year, month);

    set((state) => ({
      loading: { ...state.loading, [key]: true },
    }));

    try {
      const res = await fetch(`/api/schedule/${employeeId}?year=${year}&month=${month}`);
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const data: ScheduleEntry[] = await res.json();

      set((state) => ({
        entries: { ...state.entries, [key]: data },
        loading: { ...state.loading, [key]: false },
      }));

      return data;
    } catch (err) {
      console.error('fetchMonthEntries error:', err);
      set((state) => ({
        loading: { ...state.loading, [key]: false },
      }));
      return [];
    }
  },

  getMonthEntries: (employeeId, year, month) => {
    const key = monthKey(employeeId, year, month);
    return (get().entries[key] || []).sort((a, b) => a.data.localeCompare(b.data));
  },

  setEntry: async (entry) => {
    const res = await fetch('/api/schedule/entry', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to update entry');
    const updated: ScheduleEntry = await res.json();

    const date = new Date(updated.data);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = monthKey(updated.darbuotojoId, year, month);

    set((state) => {
      const current = state.entries[key] || [];
      const existingIdx = current.findIndex((e) => e.id === updated.id || e.data === updated.data);

      let newEntries: ScheduleEntry[];
      if (existingIdx >= 0) {
        newEntries = current.map((e, i) => (i === existingIdx ? updated : e));
      } else {
        newEntries = [...current, updated];
      }

      return {
        entries: { ...state.entries, [key]: newEntries },
      };
    });
  },

  deleteEmployeeEntries: async (employeeId) => {
    await fetch(`/api/schedule/${employeeId}`, { method: 'DELETE' });

    set((state) => {
      const prefix = `${employeeId}_`;
      const filtered: Record<string, ScheduleEntry[]> = {};
      for (const [k, v] of Object.entries(state.entries)) {
        if (!k.startsWith(prefix)) {
          filtered[k] = v;
        }
      }
      return { entries: filtered };
    });
  },

  initializeMonth: async (employeeId, year, month, defaultPietuPertrauka = 60) => {
    const key = monthKey(employeeId, year, month);

    const res = await fetch('/api/schedule/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, year, month, defaultPietuPertrauka }),
    });
    if (!res.ok) throw new Error('Failed to initialize month');
    const entries: ScheduleEntry[] = await res.json();

    set((state) => ({
      entries: { ...state.entries, [key]: entries },
    }));
  },
}));
