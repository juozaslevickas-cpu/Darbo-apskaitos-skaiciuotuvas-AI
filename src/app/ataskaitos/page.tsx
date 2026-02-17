'use client';

import { useState } from 'react';
import { useEmployeeStore } from '@/store/employee-store';
import { useScheduleStore } from '@/store/schedule-store';
import BalanceCard from '@/components/reports/BalanceCard';
import ValidationAlerts from '@/components/schedule/ValidationAlerts';
import Header from '@/components/layout/Header';
import { calculateMonthlyBalance } from '@/services/balance';
import { calculateMonthlyNorm } from '@/services/norm-calculator';
import { validateSchedule } from '@/services/validation';
import { calculateNightMinutes } from '@/services/night-calculator';
import { hoursToDisplay } from '@/utils/format-utils';

export default function AtaskaitosPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const employees = useEmployeeStore((s) => s.employees);
  const getMonthEntries = useScheduleStore((s) => s.getMonthEntries);

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
        onToday={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); }}
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
                {employees.map((emp) => {
                  const entries = getMonthEntries(emp.id, year, month);
                  if (entries.length === 0) return null;
                  const balance = calculateMonthlyBalance(entries, emp, year, month);
                  const norm = calculateMonthlyNorm(year, month, emp.savaitineNorma, emp.etatas);
                  return (
                    <BalanceCard
                      key={emp.id}
                      employeeName={`${emp.vardas} ${emp.pavarde}`}
                      balance={balance}
                      norm={norm}
                    />
                  );
                })}
              </div>
            </section>

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
                    {employees.map((emp) => {
                      const entries = getMonthEntries(emp.id, year, month);
                      if (entries.length === 0) return null;
                      const balance = calculateMonthlyBalance(entries, emp, year, month);
                      const pct = balance.faktiskaiDirbta > 0
                        ? ((balance.naktiesValandos / balance.faktiskaiDirbta) * 100).toFixed(1)
                        : '0,0';
                      return (
                        <tr key={emp.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-900">{emp.vardas} {emp.pavarde}</td>
                          <td className="px-4 py-3 text-right text-violet-700 font-medium">{hoursToDisplay(balance.naktiesValandos)}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{hoursToDisplay(balance.faktiskaiDirbta)}</td>
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
              {employees.map((emp) => {
                const entries = getMonthEntries(emp.id, year, month);
                if (entries.length === 0) return null;
                const alerts = validateSchedule(entries, emp);
                if (alerts.length === 0) return null;
                return (
                  <div key={emp.id} className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">
                      {emp.vardas} {emp.pavarde}
                    </h3>
                    <ValidationAlerts alerts={alerts} />
                  </div>
                );
              })}
              {employees.every((emp) => {
                const entries = getMonthEntries(emp.id, year, month);
                return entries.length === 0 || validateSchedule(entries, emp).length === 0;
              }) && (
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
