'use client';

import type { MonthlyBalance } from '@/services/balance';
import type { MonthlyNorm } from '@/services/norm-calculator';
import { hoursToDisplay, formatDifference } from '@/utils/format-utils';

interface BalanceCardProps {
  employeeName: string;
  balance: MonthlyBalance;
  norm: MonthlyNorm;
}

export default function BalanceCard({ employeeName, balance, norm }: BalanceCardProps) {
  const isPositive = balance.skirtumas >= 0;
  const borderColor = balance.skirtumas === 0
    ? 'border-slate-200'
    : isPositive
    ? 'border-emerald-200'
    : 'border-red-200';
  const bgColor = balance.skirtumas === 0
    ? 'bg-white'
    : isPositive
    ? 'bg-emerald-50/30'
    : 'bg-red-50/30';

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5`}>
      <h3 className="font-semibold text-slate-900">{employeeName}</h3>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Norma</p>
          <p className="text-lg font-bold text-slate-900">
            {hoursToDisplay(balance.menesioNorma)}
            <span className="text-sm font-normal text-slate-400"> val.</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Faktas</p>
          <p className="text-lg font-bold text-slate-900">
            {hoursToDisplay(balance.faktiskaiDirbta)}
            <span className="text-sm font-normal text-slate-400"> val.</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Skirtumas</p>
          <p className={`text-lg font-bold ${isPositive ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatDifference(balance.skirtumas)}
            <span className="text-sm font-normal opacity-70"> val.</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Nakties val.</p>
          <p className="text-lg font-bold text-violet-700">
            {hoursToDisplay(balance.naktiesValandos)}
            <span className="text-sm font-normal text-slate-400"> val.</span>
          </p>
        </div>
      </div>

      {balance.virsvalandziai > 0 && (
        <div className="mt-3 rounded-lg bg-red-100 px-3 py-2">
          <p className="text-sm font-medium text-red-700">
            Viršvalandžiai: {hoursToDisplay(balance.virsvalandziai)} val.
          </p>
        </div>
      )}

      {balance.neatvykimai.length > 0 && (
        <div className="mt-3 space-y-1">
          {balance.neatvykimai.map((n) => (
            <p key={n.kodas} className="text-xs text-slate-500">
              {n.kodas}: {n.dienos} d. ({hoursToDisplay(n.valandos)} val.)
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
