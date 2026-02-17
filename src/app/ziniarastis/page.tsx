'use client';

import { useState, useEffect } from 'react';
import { useEmployeeStore } from '@/store/employee-store';
import { useScheduleStore } from '@/store/schedule-store';
import { useSettingsStore } from '@/store/settings-store';
import { useToastStore } from '@/store/toast-store';
import TimesheetTable from '@/components/timesheet/TimesheetTable';
import TimesheetSummary from '@/components/timesheet/TimesheetSummary';
import Header from '@/components/layout/Header';
import { useMonthData } from '@/hooks/useMonthData';
import { exportTimesheetPDF } from '@/utils/export-pdf';
import { exportTimesheetExcel } from '@/utils/export-excel';

export default function ZiniarastisPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const employees = useEmployeeStore((s) => s.employees);
  const getMonthEntries = useScheduleStore((s) => s.getMonthEntries);
  const fetchMonthEntries = useScheduleStore((s) => s.fetchMonthEntries);
  const companyName = useSettingsStore((s) => s.imonesVardas);
  const addToast = useToastStore((s) => s.addToast);

  const employee = employees.find((e) => e.id === selectedEmployeeId) ?? employees[0];

  useEffect(() => {
    if (employee?.id) {
      fetchMonthEntries(employee.id, year, month);
    }
  }, [employee?.id, year, month, fetchMonthEntries]);

  const entries = employee ? getMonthEntries(employee.id, year, month) : [];
  const monthData = useMonthData(entries, employee, year, month);

  const handlePdfExport = async () => {
    if (!employee || entries.length === 0 || exporting) return;
    setExporting('pdf');
    try {
      await exportTimesheetPDF(entries, employee, year, month, companyName);
      addToast('PDF eksportuotas');
    } catch {
      addToast('Nepavyko eksportuoti PDF', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleExcelExport = async () => {
    if (!employee || entries.length === 0 || exporting) return;
    setExporting('excel');
    try {
      await exportTimesheetExcel(entries, employee, year, month, companyName);
      addToast('Excel eksportuotas');
    } catch {
      addToast('Nepavyko eksportuoti Excel', 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <Header
        title="Žiniaraštis"
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
      >
        <select
          value={employee?.id ?? ''}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="input max-w-xs"
        >
          {employees.length === 0 && <option value="">Nėra darbuotojų</option>}
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.vardas} {emp.pavarde}
            </option>
          ))}
        </select>

        {employee && entries.length > 0 && (
          <>
            <button
              onClick={handlePdfExport}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting === 'pdf' && <Spinner />}
              PDF
            </button>
            <button
              onClick={handleExcelExport}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting === 'excel' && <Spinner />}
              Excel
            </button>
          </>
        )}
      </Header>

      <div className="p-6 space-y-6">
        {!employee || entries.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">
              {!employee
                ? 'Pirmiausia pridėkite darbuotoją.'
                : 'Šiam mėnesiui nėra grafiko duomenų. Pirmiausia užpildykite grafiką.'}
            </p>
          </div>
        ) : (
          <>
            <TimesheetTable
              entries={entries}
              employee={employee}
              year={year}
              month={month}
            />
            {monthData && (
              <div className="max-w-sm">
                <TimesheetSummary
                  balance={monthData.balance}
                  norm={monthData.norm}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
