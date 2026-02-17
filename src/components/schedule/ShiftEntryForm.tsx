'use client';

import { useEffect, useRef } from 'react';
import type { ScheduleEntry } from '@/models/schedule-entry';

const SHIFT_TEMPLATES = [
  { label: 'Dieninė 08:00-20:00', start: '08:00', end: '20:00' },
  { label: 'Naktinė 20:00-08:00', start: '20:00', end: '08:00' },
  { label: 'Ryto 06:00-18:00', start: '06:00', end: '18:00' },
  { label: 'Vakarinė 14:00-22:00', start: '14:00', end: '22:00' },
  { label: 'Trumpa 08:00-16:00', start: '08:00', end: '16:00' },
];

interface ShiftEntryFormProps {
  entry: ScheduleEntry;
  onUpdate: (updated: ScheduleEntry) => void;
  onClose: () => void;
}

export default function ShiftEntryForm({
  entry,
  onUpdate,
  onClose,
}: ShiftEntryFormProps) {
  const startInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleTemplate = (start: string, end: string) => {
    onUpdate({
      ...entry,
      pamainosPradzia: start,
      pamainosPabaiga: end,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-form-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="shift-form-title" className="text-lg font-semibold text-slate-900">
            Pamaina: {entry.data}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Uždaryti">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Greiti šablonai</p>
          <div className="flex flex-wrap gap-2">
            {SHIFT_TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => handleTemplate(t.start, t.end)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pradžia</label>
            <input
              ref={startInputRef}
              type="time"
              value={entry.pamainosPradzia ?? ''}
              onChange={(e) => onUpdate({ ...entry, pamainosPradzia: e.target.value || null })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pabaiga</label>
            <input
              type="time"
              value={entry.pamainosPabaiga ?? ''}
              onChange={(e) => onUpdate({ ...entry, pamainosPabaiga: e.target.value || null })}
              className="input"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pietų pertrauka (min.)
          </label>
          <input
            type="number"
            value={entry.pietuPertraukaMin}
            onChange={(e) => onUpdate({ ...entry, pietuPertraukaMin: Number(e.target.value) })}
            className="input w-32"
            min={0}
            max={120}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Pastaba</label>
          <input
            type="text"
            value={entry.pastaba ?? ''}
            onChange={(e) => onUpdate({ ...entry, pastaba: e.target.value || null })}
            className="input"
            placeholder="Papildoma informacija..."
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
}
