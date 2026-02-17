'use client';

import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculateNightMinutes } from '@/services/night-calculator';
import { hoursToDisplay } from '@/utils/format-utils';
import { DEVIATION_CODES, ABSENCE_AS_WORK_CODES } from '@/config/work-codes';
import { getDaysInMonthCount } from '@/utils/date-utils';

interface TimesheetTableProps {
  entries: ScheduleEntry[];
  employee: Employee;
  year: number;
  month: number;
}

export default function TimesheetTable({
  entries,
  employee,
  year,
  month,
}: TimesheetTableProps) {
  const daysInMonth = getDaysInMonthCount(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const entryByDay: Record<number, ScheduleEntry> = {};
  for (const e of entries) {
    const day = parseInt(e.data.split('-')[2], 10);
    entryByDay[day] = e;
  }

  let totalWorked = 0;
  let totalNight = 0;
  const deviationTotals: Record<string, number> = {};
  const absenceWorkTotals: Record<string, number> = {};
  let atostoguDienos = 0;
  let ligosDienos = 0;

  for (const day of days) {
    const entry = entryByDay[day];
    if (!entry) continue;
    const worked = calculateShiftDuration(entry);
    const night = calculateNightMinutes(entry);
    totalWorked += worked;
    totalNight += night;

    if (night > 0) {
      deviationTotals['DN'] = (deviationTotals['DN'] || 0) + night;
    }
    if (entry.tipas === 'A') atostoguDienos++;
    if (entry.tipas === 'L') ligosDienos++;

    for (const code of ABSENCE_AS_WORK_CODES) {
      if (entry.tipas === code) {
        absenceWorkTotals[code] = (absenceWorkTotals[code] || 0) + 1;
      }
    }
  }

  const getRow1Cell = (day: number): string => {
    const entry = entryByDay[day];
    if (!entry) return '';
    if (entry.tipas === 'DARBAS') {
      const worked = calculateShiftDuration(entry);
      return worked > 0 ? hoursToDisplay(worked) : '';
    }
    if (entry.tipas === 'POILSIS') return 'P';
    if (entry.tipas === 'SVENTE') return 'S';
    return entry.tipas;
  };

  const getRow3Cell = (day: number): string => {
    const entry = entryByDay[day];
    if (!entry || entry.tipas !== 'DARBAS') return '';
    const night = calculateNightMinutes(entry);
    if (night > 0) return `DN ${hoursToDisplay(night)}`;
    return '';
  };

  const getRow4Cell = (day: number): string => {
    const entry = entryByDay[day];
    if (!entry) return '';
    for (const code of ABSENCE_AS_WORK_CODES) {
      if (entry.tipas === code) return `${code} 8`;
    }
    return '';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="sticky left-0 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 min-w-[180px] z-10">
              {employee.vardas} {employee.pavarde}
            </th>
            {days.map((d) => (
              <th key={d} className="px-1.5 py-2 text-center font-semibold text-slate-600 min-w-[40px]">
                {d}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-semibold text-slate-600 min-w-[80px]">Iš viso</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="sticky left-0 bg-white px-3 py-2 font-medium text-slate-700 z-10">
              1. Dirbta / neatv.
            </td>
            {days.map((d) => {
              const val = getRow1Cell(d);
              const entry = entryByDay[d];
              const isNonWork = entry && entry.tipas !== 'DARBAS';
              return (
                <td
                  key={d}
                  className={`px-1 py-1.5 text-center ${isNonWork ? 'font-medium text-blue-600' : 'text-slate-700'}`}
                >
                  {val}
                </td>
              );
            })}
            <td className="px-3 py-1.5 text-center font-bold text-slate-900">
              {hoursToDisplay(totalWorked)}
            </td>
          </tr>

          <tr className="border-b border-slate-100">
            <td className="sticky left-0 bg-white px-3 py-2 font-medium text-slate-700 z-10">
              2. Nukrypimai
            </td>
            {days.map((d) => (
              <td key={d} className="px-1 py-1.5 text-center text-violet-600">
                {getRow3Cell(d)}
              </td>
            ))}
            <td className="px-3 py-1.5 text-center font-bold text-violet-700">
              {totalNight > 0 ? `DN ${hoursToDisplay(totalNight)}` : ''}
            </td>
          </tr>

          <tr className="border-b border-slate-100">
            <td className="sticky left-0 bg-white px-3 py-2 font-medium text-slate-700 z-10">
              3. Neatvyk. = darbas
            </td>
            {days.map((d) => (
              <td key={d} className="px-1 py-1.5 text-center text-emerald-600">
                {getRow4Cell(d)}
              </td>
            ))}
            <td className="px-3 py-1.5 text-center font-bold text-emerald-700">
              {Object.entries(absenceWorkTotals)
                .map(([code, count]) => `${code}: ${count}d.`)
                .join(', ')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
