'use client';

import { useState, useCallback } from 'react';
import { useEmployeeStore } from '@/store/employee-store';
import { useScheduleStore } from '@/store/schedule-store';
import { useSettingsStore } from '@/store/settings-store';
import { useToastStore } from '@/store/toast-store';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import Header from '@/components/layout/Header';
import type { ScheduleEntry } from '@/models/schedule-entry';

export default function GrafikasPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const employees = useEmployeeStore((s) => s.employees);
  const getMonthEntries = useScheduleStore((s) => s.getMonthEntries);
  const setEntry = useScheduleStore((s) => s.setEntry);
  const initializeMonth = useScheduleStore((s) => s.initializeMonth);
  const defaultPietuPertrauka = useSettingsStore((s) => s.defaultPietuPertrauka);
  const addToast = useToastStore((s) => s.addToast);

  const employee = employees.find((e) => e.id === selectedEmployeeId) ?? employees[0];
  const effectiveId = employee?.id ?? null;

  const entries = effectiveId ? getMonthEntries(effectiveId, year, month) : [];

  const handlePrevMonth = useCallback(() => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const handleInitialize = () => {
    if (effectiveId) {
      initializeMonth(effectiveId, year, month, defaultPietuPertrauka);
      addToast('Mėnuo inicializuotas');
    }
  };

  const handleUpdateEntry = (updated: ScheduleEntry) => {
    setEntry(updated);
  };

  return (
    <>
      <Header
        title="Grafikas"
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={() => { const n = new Date(); setYear(n.getFullYear()); setMonth(n.getMonth() + 1); }}
      >
        <select
          value={effectiveId ?? ''}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="input max-w-xs"
        >
          {employees.length === 0 && (
            <option value="">Nėra darbuotojų</option>
          )}
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.vardas} {emp.pavarde}
            </option>
          ))}
        </select>

        <button
          onClick={handleInitialize}
          disabled={!effectiveId}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Inicializuoti mėnesį
        </button>
      </Header>

      <div className="p-6">
        {!employee ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              Pirmiausia pridėkite darbuotoją, tada galėsite pildyti grafiką.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              Šis mėnuo dar neinicializuotas.
            </p>
            <button
              onClick={handleInitialize}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Inicializuoti mėnesį
            </button>
          </div>
        ) : (
          <ScheduleGrid
            entries={entries}
            employee={employee}
            year={year}
            month={month}
            onUpdateEntry={handleUpdateEntry}
          />
        )}
      </div>
    </>
  );
}
