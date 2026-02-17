'use client';

import { useMemo } from 'react';
import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import { calculateMonthlyBalance, type MonthlyBalance } from '@/services/balance';
import { calculateMonthlyNorm, type MonthlyNorm } from '@/services/norm-calculator';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculateNightMinutes } from '@/services/night-calculator';

export interface MonthData {
  norm: MonthlyNorm;
  balance: MonthlyBalance;
  totalWorked: number;
  totalNight: number;
  workDays: number;
}

/**
 * Hook: mėnesio duomenų agregavimas.
 * Grąžina normą, balansą ir suvestines reikšmes.
 */
export function useMonthData(
  entries: ScheduleEntry[],
  employee: Employee | undefined,
  year: number,
  month: number
): MonthData | null {
  return useMemo(() => {
    if (!employee) return null;

    const norm = calculateMonthlyNorm(
      year,
      month,
      employee.savaitineNorma,
      employee.etatas
    );

    const balance = calculateMonthlyBalance(entries, employee, year, month);

    let totalWorked = 0;
    let totalNight = 0;
    let workDays = 0;

    for (const entry of entries) {
      const duration = calculateShiftDuration(entry);
      if (duration > 0) {
        totalWorked += duration;
        workDays++;
      }
      totalNight += calculateNightMinutes(entry);
    }

    return { norm, balance, totalWorked, totalNight, workDays };
  }, [entries, employee, year, month]);
}
