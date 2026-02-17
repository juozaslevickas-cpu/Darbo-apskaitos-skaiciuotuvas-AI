'use client';

import type { ScheduleEntry } from '@/models/schedule-entry';
import { SCHEDULE_ENTRY_TYPES, type ScheduleEntryType } from '@/config/work-codes';
import { getWeekdayShort, parseDate } from '@/utils/date-utils';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculateNightMinutes } from '@/services/night-calculator';
import { calculateRestBetweenEntries } from '@/services/shift-calculator';
import { hoursToDisplay } from '@/utils/format-utils';

const TYPE_LABELS: Record<string, string> = {
  DARBAS: 'Darbas',
  POILSIS: 'Poilsis',
  SVENTE: 'Šventė',
  A: 'Atostogos',
  L: 'Liga',
  K: 'Komandiruotė',
  MA: 'Mokym. atost.',
  NA: 'Nemok. atost.',
  KV: 'Kvalifik.',
};

const ROW_COLORS: Record<string, string> = {
  DARBAS: 'bg-white',
  POILSIS: 'bg-blue-50/60',
  SVENTE: 'bg-red-50/60',
  A: 'bg-green-50/60',
  L: 'bg-yellow-50/60',
  K: 'bg-purple-50/60',
};

interface DayCellProps {
  entry: ScheduleEntry;
  previousEntry?: ScheduleEntry;
  onUpdate: (updated: ScheduleEntry) => void;
  onEditShift: () => void;
  hasAlert: boolean;
}

export default function DayCell({
  entry,
  previousEntry,
  onUpdate,
  onEditShift,
  hasAlert,
}: DayCellProps) {
  const date = parseDate(entry.data);
  const weekday = getWeekdayShort(date);
  const isWork = entry.tipas === 'DARBAS';
  const shiftDuration = calculateShiftDuration(entry);
  const nightMins = calculateNightMinutes(entry);
  const restMins = previousEntry
    ? calculateRestBetweenEntries(previousEntry, entry)
    : null;

  const dayNum = date.getDate();
  const bgColor = ROW_COLORS[entry.tipas] || 'bg-slate-50/60';
  const isWeekend = weekday === 'Šš' || weekday === 'Sk';

  return (
    <tr className={`${bgColor} ${hasAlert ? 'ring-1 ring-inset ring-red-300' : ''} border-b border-slate-100 hover:bg-slate-50/80 transition-colors`}>
      <td className={`px-2 py-1.5 text-center text-sm font-medium ${isWeekend ? 'text-red-600' : 'text-slate-900'}`}>
        {dayNum}
      </td>
      <td className={`px-2 py-1.5 text-center text-xs font-medium ${isWeekend ? 'text-red-500' : 'text-slate-500'}`}>
        {weekday}
      </td>
      <td className="px-1 py-1">
        <select
          value={entry.tipas}
          onChange={(e) => {
            const tipas = e.target.value as ScheduleEntryType;
            onUpdate({
              ...entry,
              tipas,
              pamainosPradzia: tipas === 'DARBAS' ? entry.pamainosPradzia : null,
              pamainosPabaiga: tipas === 'DARBAS' ? entry.pamainosPabaiga : null,
              pietuPertraukaMin: tipas === 'DARBAS' ? entry.pietuPertraukaMin : 0,
            });
          }}
          className="w-full rounded border border-slate-200 bg-transparent px-1.5 py-1 text-xs focus:border-blue-400 focus:outline-none"
        >
          {SCHEDULE_ENTRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t] || t}
            </option>
          ))}
        </select>
      </td>
      <td className="px-1 py-1">
        {isWork ? (
          <input
            type="time"
            value={entry.pamainosPradzia ?? ''}
            onChange={(e) => onUpdate({ ...entry, pamainosPradzia: e.target.value || null })}
            className="w-full rounded border border-slate-200 bg-transparent px-1.5 py-1 text-xs focus:border-blue-400 focus:outline-none"
          />
        ) : (
          <span className="px-1.5 text-xs text-slate-300">—</span>
        )}
      </td>
      <td className="px-1 py-1">
        {isWork ? (
          <input
            type="time"
            value={entry.pamainosPabaiga ?? ''}
            onChange={(e) => onUpdate({ ...entry, pamainosPabaiga: e.target.value || null })}
            className="w-full rounded border border-slate-200 bg-transparent px-1.5 py-1 text-xs focus:border-blue-400 focus:outline-none"
          />
        ) : (
          <span className="px-1.5 text-xs text-slate-300">—</span>
        )}
      </td>
      <td className="px-1 py-1">
        {isWork ? (
          <input
            type="number"
            value={entry.pietuPertraukaMin}
            onChange={(e) => onUpdate({ ...entry, pietuPertraukaMin: Number(e.target.value) })}
            className="w-16 rounded border border-slate-200 bg-transparent px-1.5 py-1 text-xs text-center focus:border-blue-400 focus:outline-none"
            min={0}
            max={120}
          />
        ) : (
          <span className="px-1.5 text-xs text-slate-300">—</span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center text-xs font-medium text-slate-700">
        {shiftDuration > 0 ? hoursToDisplay(shiftDuration) : ''}
      </td>
      <td className="px-2 py-1.5 text-center text-xs font-medium text-violet-600">
        {nightMins > 0 ? hoursToDisplay(nightMins) : ''}
      </td>
      <td className="px-2 py-1.5 text-center text-xs text-slate-500">
        {restMins !== null && restMins > 0 ? hoursToDisplay(restMins) : ''}
      </td>
      <td className="px-1 py-1 text-center">
        {hasAlert && (
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" title="Yra pažeidimų" />
        )}
      </td>
      <td className="px-1 py-1">
        {isWork && (
          <button
            onClick={onEditShift}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Redaguoti pamainą"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}
