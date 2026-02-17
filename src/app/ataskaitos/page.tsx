'use client';

import { useState, useMemo } from 'react';
import { useEmployeeStore } from '@/store/employee-store';
import { useScheduleStore } from '@/store/schedule-store';
import BalanceCard from '@/components/reports/BalanceCard';
import ValidationAlerts from '@/components/schedule/ValidationAlerts';
import Header from '@/components/layout/Header';
import { calculateMonthlyBalance, type MonthlyBalance } from '@/services/balance';
import { calculateMonthlyNorm, type MonthlyNorm } from '@/services/norm-calculator';
import { calculateOvertimeForPeriod, type OvertimeResult } from '@/services/overtime-calculator';
import { validateSchedule } from '@/services/validation';
import type { ValidationAlert } from '@/models/validation-alert';
import type { Employee } from '@/models/employee';
import type { ScheduleEntry } from '@/models/schedule-entry';
import { hoursToDisplay } from '@/utils/format-utils';

interface EmployeeReportData {
  employee: Employee;
  entries: ScheduleEntry[];
  balance: MonthlyBalance;
  norm: MonthlyNorm;
  alerts: ValidationAlert[];
  overtime: OvertimeResult | null;
  periodLabel: string;
}

export default function AtaskaitosPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  const employees = useEmployeeStore((s) => s.employees);
  const getMonthEntries = useScheduleStore((s) => s.getMonthEntries);

  const reportData = useMemo<EmployeeReportData[]>(() => {
    return employees
      .map((emp) => {
        const entries = getMonthEntries(emp.id, year, month);
        if (entries.length === 0) return null;

        const balance = calculateMonthlyBalance(entries, emp, year, month);
        const norm = calculateMonthlyNorm(year, month, emp.savaitineNorma, emp.etatas);
        const alerts = validateSchedule(entries, emp);

        let overtime: OvertimeResult | null = null;
        let periodLabel = '';

        if (emp.apskaitinisLaikotarpisMenesiai > 1) {
          const periodLen = emp.apskaitinisLaikotarpisMenesiai;
          const periodIndex = Math.floor((month - 1) / periodLen);
          const periodStartMonth = periodIndex * periodLen + 1;
          const periodEndMonth = periodStartMonth + periodLen - 1;

          const isLastMonthOfPeriod = month === periodEndMonth;

          const allPeriodEntries: ScheduleEntry[] = [];
          for (let m = periodStartMonth; m <= periodEndMonth; m++) {
            allPeriodEntries.push(...getMonthEntries(emp.id, year, m));
          }

          if (allPeriodEntries.length > 0) {
            const periodStart = new Date(year, periodStartMonth - 1, 1);
            const periodEnd = new Date(year, periodEndMonth - 1, 1);
            overtime = calculateOvertimeForPeriod(
              allPeriodEntries,
              emp,
              periodStart,
              periodEnd
            );
            periodLabel = `${periodStartMonth}–${periodEndMonth} mėn.${isLastMonthOfPeriod ? ' (laikotarpio pabaiga)' : ''}`;
          }
        }

        return { employee: emp, entries, balance, norm, alerts, overtime, periodLabel };
      })
      .filter((d): d is EmployeeReportData => d !== null);
  }, [employees, getMonthEntries, year, month]);

  const hasAnyAlerts = reportData.some((d) => d.alerts.length > 0);

  return (
    <>
      <Header
        title="Ataskaitos"
        year={year}
        month={month}
        onPrevMonth={() => {
          if (month === 1) { setMonth(12); setYear((y) => y - 1); }
          else setMonth((m) => m - 1);
        }}
        onNextMonth={() => {
          if (month === 12) { setMonth(1); setYear((y) => y + 1); }
          else setMonth((m) => m + 1);
        }}
        onToday={() => { const n = new Date(); setYear(n.getFullYear()); setMonth(n.getMonth() + 1); }}
      />

      <div className="p-6 space-y-8">
        {employees.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">Nėra darbuotojų.</p>
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Mėnesio balansas</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reportData.map((d) => (
                  <BalanceCard
                    key={d.employee.id}
                    employeeName={`${d.employee.vardas} ${d.employee.pavarde}`}
                    balance={d.balance}
                    norm={d.norm}
                  />
                ))}
              </div>
            </section>

            {reportData.some((d) => d.overtime !== null) && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Viršvalandžiai (suminė apskaita)
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Darbuotojas</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Laikotarpis</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Norma</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Faktas</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Viršvalandžiai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData
                        .filter((d) => d.overtime !== null)
                        .map((d) => (
                          <tr key={d.employee.id} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {d.employee.vardas} {d.employee.pavarde}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500">
                              {d.periodLabel}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-700">
                              {hoursToDisplay(d.overtime!.laikotarpioNorma)} val.
                            </td>
                            <td className="px-4 py-3 text-right text-slate-700">
                              {hoursToDisplay(d.overtime!.faktiskaiDirbta)} val.
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${d.overtime!.virsvalandziai > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {d.overtime!.virsvalandziai > 0
                                ? `+${hoursToDisplay(d.overtime!.virsvalandziai)} val.`
                                : d.overtime!.neisdirbtaNorma > 0
                                ? `-${hoursToDisplay(d.overtime!.neisdirbtaNorma)} val.`
                                : '0,00 val.'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Nakties valandų suvestinė</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Darbuotojas</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Nakties val.</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Dirbta val.</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Naktis %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((d) => {
                      const pct = d.balance.faktiskaiDirbta > 0
                        ? ((d.balance.naktiesValandos / d.balance.faktiskaiDirbta) * 100).toFixed(1)
                        : '0,0';
                      return (
                        <tr key={d.employee.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-900">{d.employee.vardas} {d.employee.pavarde}</td>
                          <td className="px-4 py-3 text-right text-violet-700 font-medium">{hoursToDisplay(d.balance.naktiesValandos)}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{hoursToDisplay(d.balance.faktiskaiDirbta)}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{pct.replace('.', ',')}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Pažeidimai</h2>
              {reportData
                .filter((d) => d.alerts.length > 0)
                .map((d) => (
                  <div key={d.employee.id} className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">
                      {d.employee.vardas} {d.employee.pavarde}
                    </h3>
                    <ValidationAlerts alerts={d.alerts} />
                  </div>
                ))}
              {!hasAnyAlerts && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-700">
                    Pažeidimų nerasta.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
