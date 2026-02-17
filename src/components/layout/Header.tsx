'use client';

import { getMonthNameLT } from '@/utils/date-utils';

interface HeaderProps {
  title: string;
  year?: number;
  month?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
  children?: React.ReactNode;
}

export default function Header({
  title,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
  children,
}: HeaderProps) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 md:gap-4">
        <h1 className="text-lg md:text-xl font-semibold text-slate-900">{title}</h1>
        {year && month && (
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={onPrevMonth}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Ankstesnis mėnuo"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="min-w-[140px] md:min-w-[160px] text-center text-sm font-medium text-slate-700">
              {year} m. {getMonthNameLT(month)}
            </span>
            <button
              onClick={onNextMonth}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Kitas mėnuo"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            {onToday && !isCurrentMonth && (
              <button
                onClick={onToday}
                className="ml-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Šiandien
              </button>
            )}
          </div>
        )}
      </div>
      {children && <div className="flex items-center gap-2 md:gap-3">{children}</div>}
    </header>
  );
}
