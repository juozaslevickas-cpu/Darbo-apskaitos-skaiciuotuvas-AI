'use client';

import type { MonthlyBalance } from '@/services/balance';
import type { MonthlyNorm } from '@/services/norm-calculator';
import { hoursToDisplay, formatDifference } from '@/utils/format-utils';
import { getWorkCode } from '@/config/work-codes';

interface TimesheetSummaryProps {
  balance: MonthlyBalance;
  norm: MonthlyNorm;
}

export default function TimesheetSummary({ balance, norm }: TimesheetSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Mėnesio suvestinė</h3>

      <div className="space-y-3">
        <SummaryRow label="Mėnesio norma" value={`${hoursToDisplay(norm.normaDarbuotojui)} val.`} />
        <SummaryRow label="Darbo dienų" value={`${norm.darbodienuSk} d.`} />
        <SummaryRow label="Faktiškai dirbta" value={`${hoursToDisplay(balance.faktiskaiDirbta)} val.`} bold />

        <div className="border-t border-slate-100 pt-3">
          <SummaryRow
            label="Skirtumas"
            value={`${formatDifference(balance.skirtumas)} val.`}
            color={balance.skirtumas >= 0 ? 'emerald' : 'red'}
            bold
          />
        </div>

        {balance.naktiesValandos > 0 && (
          <SummaryRow label="Nakties valandos" value={`${hoursToDisplay(balance.naktiesValandos)} val.`} color="violet" />
        )}
        {balance.darbasPoilsioDienomis > 0 && (
          <SummaryRow label="Darbas poilsio d." value={`${hoursToDisplay(balance.darbasPoilsioDienomis)} val.`} />
        )}
        {balance.darbasSvenciu > 0 && (
          <SummaryRow label="Darbas švenčių d." value={`${hoursToDisplay(balance.darbasSvenciu)} val.`} color="red" />
        )}
        {balance.virsvalandziai > 0 && (
          <SummaryRow label="Viršvalandžiai" value={`${hoursToDisplay(balance.virsvalandziai)} val.`} color="red" bold />
        )}

        {balance.neatvykimai.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-600 mb-2">Neatvykimai</p>
            {balance.neatvykimai.map((n) => {
              const code = getWorkCode(n.kodas);
              return (
                <SummaryRow
                  key={n.kodas}
                  label={code?.pavadinimas ?? n.kodas}
                  value={`${n.dienos} d. (${hoursToDisplay(n.valandos)} val.)`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  color = 'slate',
  bold = false,
}: {
  label: string;
  value: string;
  color?: 'slate' | 'emerald' | 'red' | 'violet';
  bold?: boolean;
}) {
  const colors = {
    slate: 'text-slate-900',
    emerald: 'text-emerald-700',
    red: 'text-red-600',
    violet: 'text-violet-700',
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`${colors[color]} ${bold ? 'font-semibold' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}
