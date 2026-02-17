'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ScheduleEntry } from '@/models/schedule-entry';
import { getMonthDays, formatDateLT, isWeekday } from '@/utils/date-utils';
import { isHoliday } from '@/config/holidays';
import { getDay } from 'date-fns';

function monthKey(employeeId: string, year: number, month: number): string {
  return `${employeeId}_${year}_${month}`;
}

interface ScheduleStore {
  entries: Record<string, ScheduleEntry[]>;
  setEntry: (entry: ScheduleEntry) => void;
  getMonthEntries: (employeeId: string, year: number, month: number) => ScheduleEntry[];
  deleteEntry: (entryId: string, employeeId: string, year: number, month: number) => void;
  deleteEmployeeEntries: (employeeId: string) => void;
  bulkSetEntries: (employeeId: string, year: number, month: number, entries: ScheduleEntry[]) => void;
  initializeMonth: (employeeId: string, year: number, month: number, defaultPietuPertrauka?: number) => void;
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      entries: {},

      setEntry: (entry) => {
        const date = new Date(entry.data);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = monthKey(entry.darbuotojoId, year, month);

        set((state) => {
          const current = state.entries[key] || [];
          const existing = current.findIndex((e) => e.id === entry.id);

          let updated: ScheduleEntry[];
          if (existing >= 0) {
            updated = current.map((e) => (e.id === entry.id ? entry : e));
          } else {
            const byDate = current.findIndex((e) => e.data === entry.data);
            if (byDate >= 0) {
              updated = current.map((e) => (e.data === entry.data ? entry : e));
            } else {
              updated = [...current, entry];
            }
          }

          return {
            entries: { ...state.entries, [key]: updated },
          };
        });
      },

      getMonthEntries: (employeeId, year, month) => {
        const key = monthKey(employeeId, year, month);
        return (get().entries[key] || []).sort((a, b) => a.data.localeCompare(b.data));
      },

      deleteEntry: (entryId, employeeId, year, month) => {
        const key = monthKey(employeeId, year, month);
        set((state) => ({
          entries: {
            ...state.entries,
            [key]: (state.entries[key] || []).filter((e) => e.id !== entryId),
          },
        }));
      },

      deleteEmployeeEntries: (employeeId) => {
        set((state) => {
          const prefix = `${employeeId}_`;
          const filtered: Record<string, ScheduleEntry[]> = {};
          for (const [key, value] of Object.entries(state.entries)) {
            if (!key.startsWith(prefix)) {
              filtered[key] = value;
            }
          }
          return { entries: filtered };
        });
      },

      bulkSetEntries: (employeeId, year, month, newEntries) => {
        const key = monthKey(employeeId, year, month);
        set((state) => ({
          entries: { ...state.entries, [key]: newEntries },
        }));
      },

      initializeMonth: (employeeId, year, month, defaultPietuPertrauka = 60) => {
        const key = monthKey(employeeId, year, month);
        const existing = get().entries[key];
        if (existing && existing.length > 0) return;

        const days = getMonthDays(year, month);
        const newEntries: ScheduleEntry[] = days.map((day) => {
          const dateStr = formatDateLT(day);
          const dayOfWeek = getDay(day);
          const holiday = isHoliday(day);
          const weekday = isWeekday(day);

          let tipas: ScheduleEntry['tipas'] = 'DARBAS';
          if (holiday) {
            tipas = 'SVENTE';
          } else if (!weekday) {
            tipas = 'POILSIS';
          }

          return {
            id: uuidv4(),
            darbuotojoId: employeeId,
            data: dateStr,
            tipas,
            pamainosPradzia: null,
            pamainosPabaiga: null,
            pietuPertraukaMin: tipas === 'DARBAS' ? defaultPietuPertrauka : 0,
            neatvykimoKodas: null,
            pastaba: null,
          };
        });

        set((state) => ({
          entries: { ...state.entries, [key]: newEntries },
        }));
      },
    }),
    {
      name: 'darbo-apskaita-schedule',
    }
  )
);
