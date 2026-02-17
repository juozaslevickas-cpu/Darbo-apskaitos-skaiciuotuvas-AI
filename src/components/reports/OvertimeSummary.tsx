'use client';

import type { OvertimeResult } from '@/services/overtime-calculator';
import { hoursToDisplay } from '@/utils/format-utils';

interface OvertimeSummaryProps {
  employeeName: string;
  overtime: OvertimeResult;
  periodLabel: string;
}

export default function OvertimeSummary({
  employeeName,
  overtime,
  periodLabel,
}: OvertimeSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">{employeeName}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{periodLabel}</p>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Laikotarpio norma</span>
          <span className="font-medium">{hoursToDisplay(overtime.laikotarpioNorma)} val.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Faktiškai dirbta</span>
          <span className="font-medium">{hoursToDisplay(overtime.faktiskaiDirbta)} val.</span>
        </div>

        {overtime.virsvalandziai > 0 && (
          <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
            <span className="text-red-600 font-medium">Viršvalandžiai</span>
            <span className="font-bold text-red-600">
              {hoursToDisplay(overtime.virsvalandziai)} val.
            </span>
          </div>
        )}

        {overtime.neisdirbtaNorma > 0 && (
          <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
            <span className="text-amber-600 font-medium">Neišdirbtą norma</span>
            <span className="font-bold text-amber-600">
              {hoursToDisplay(overtime.neisdirbtaNorma)} val.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
