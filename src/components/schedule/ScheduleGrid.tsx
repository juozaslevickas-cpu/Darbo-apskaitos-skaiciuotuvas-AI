'use client';

import { useState } from 'react';
import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import DayCell from './DayCell';
import ShiftEntryForm from './ShiftEntryForm';
import ValidationAlerts from './ValidationAlerts';
import { useScheduleValidation } from '@/hooks/useScheduleValidation';
import { useMonthData } from '@/hooks/useMonthData';
import { hoursToDisplay, formatDifference } from '@/utils/format-utils';

interface ScheduleGridProps {
  entries: ScheduleEntry[];
  employee: Employee;
  year: number;
  month: number;
  onUpdateEntry: (entry: ScheduleEntry) => void;
}

export default function ScheduleGrid({
  entries,
  employee,
  year,
  month,
  onUpdateEntry,
}: ScheduleGridProps) {
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const { alerts } = useScheduleValidation(entries, employee);
  const monthData = useMonthData(entries, employee, year, month);

  const alertDates = new Set(alerts.map((a) => a.data).filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-2 py-2.5 text-center text-xs font-semibold text-slate-600 w-10">D.</th>
              <th className="px-2 py-2.5 text-center text-xs font-semibold text-slate-600 w-10">Sd.</th>
              <th className="px-1 py-2.5 text-xs font-semibold text-slate-600 w-28">Tipas</th>
              <th className="px-1 py-2.5 text-xs font-semibold text-slate-600 w-24">Pradžia</th>
              <th className="px-1 py-2.5 text-xs font-semibold text-slate-600 w-24">Pabaiga</th>
              <th className="px-1 py-2.5 text-xs font-semibold text-slate-600 w-16">Pietūs</th>
              <th className="px-2 py-2.5 text-center text-xs font-semibold text-slate-600 w-16">Dirbta</th>
              <th className="px-2 py-2.5 text-center text-xs font-semibold text-slate-600 w-16">Naktis</th>
              <th className="px-2 py-2.5 text-center text-xs font-semibold text-slate-600 w-16">Poilsis</th>
              <th className="px-1 py-2.5 w-8"></th>
              <th className="px-1 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <DayCell
                key={entry.id}
                entry={entry}
                previousEntry={i > 0 ? entries[i - 1] : undefined}
                onUpdate={(updated) => {
                  onUpdateEntry(updated);
                  if (editingEntry?.id === updated.id) {
                    setEditingEntry(updated);
                  }
                }}
                onEditShift={() => setEditingEntry(entry)}
                hasAlert={alertDates.has(entry.data)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {monthData && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Mėnesio norma" value={hoursToDisplay(monthData.norm.normaDarbuotojui)} unit="val." />
          <SummaryCard label="Faktiškai dirbta" value={hoursToDisplay(monthData.totalWorked)} unit="val." />
          <SummaryCard
            label="Skirtumas"
            value={formatDifference(monthData.balance.skirtumas)}
            unit="val."
            color={monthData.balance.skirtumas >= 0 ? 'emerald' : 'red'}
          />
          <SummaryCard label="Nakties valandos" value={hoursToDisplay(monthData.totalNight)} unit="val." color="violet" />
          <SummaryCard label="Darbo dienų" value={monthData.workDays.toString()} unit="d." />
        </div>
      )}

      <ValidationAlerts alerts={alerts} />

      {editingEntry && (
        <ShiftEntryForm
          entry={editingEntry}
          onUpdate={(updated) => {
            onUpdateEntry(updated);
            setEditingEntry(updated);
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  color = 'slate',
}: {
  label: string;
  value: string;
  unit: string;
  color?: 'slate' | 'emerald' | 'red' | 'violet';
}) {
  const colors = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    red: 'text-red-600',
    violet: 'text-violet-700',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${colors[color]}`}>
        {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
