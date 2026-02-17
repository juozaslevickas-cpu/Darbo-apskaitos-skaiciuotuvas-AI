'use client';

import { hoursToDisplay } from '@/utils/format-utils';

interface NightHoursSummaryProps {
  employeeName: string;
  totalNightMinutes: number;
  nightWorkDays: number;
  isNightWorker: boolean;
}

export default function NightHoursSummary({
  employeeName,
  totalNightMinutes,
  nightWorkDays,
  isNightWorker,
}: NightHoursSummaryProps) {
  const avgPerDay = nightWorkDays > 0 ? totalNightMinutes / nightWorkDays : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-slate-900">{employeeName}</h3>
        {isNightWorker && (
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
            Nakties darbuotojas
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Nakties valandos</span>
          <span className="font-medium text-violet-700">
            {hoursToDisplay(totalNightMinutes)} val.
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Nakties darbo dienų</span>
          <span className="font-medium">{nightWorkDays} d.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Vidurkis per dieną</span>
          <span className="font-medium">{hoursToDisplay(avgPerDay)} val.</span>
        </div>
      </div>
    </div>
  );
}
