/**
 * Viršvalandžių skaičiavimas.
 *
 * KRITINĖ TAISYKLĖ: Viršvalandžiai identifikuojami TIK apskaitinio laikotarpio
 * PABAIGOJE (ne kiekvieną mėnesį). Jei apskaitinis laikotarpis = 3 mėn.,
 * tai viršvalandžiai skaičiuojami sumuojant visus 3 mėnesius.
 */

import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculatePeriodNorm } from '@/services/norm-calculator';
import { parseDate } from '@/utils/date-utils';

export interface OvertimeResult {
  /** Faktiškai dirbta minutėmis per laikotarpį */
  faktiskaiDirbta: number;
  /** Laikotarpio norma minutėmis */
  laikotarpioNorma: number;
  /** Viršvalandžiai minutėmis (> 0 jei viršyta norma) */
  virsvalandziai: number;
  /** Neišdirba norma minutėmis (> 0 jei neišdirba) */
  neisdirbtaNorma: number;
}

/**
 * Apskaičiuoja viršvalandžius apskaitiniam laikotarpiui.
 *
 * @param entries Visi grafiko įrašai laikotarpiui
 * @param employee Darbuotojo duomenys
 * @param periodStart Laikotarpio pradžios data
 * @param periodEnd Laikotarpio pabaigos data
 * @returns OvertimeResult su viršvalandžiais arba neišdirbtą norma
 */
export function calculateOvertimeForPeriod(
  entries: ScheduleEntry[],
  employee: Employee,
  periodStart: Date,
  periodEnd: Date
): OvertimeResult {
  // Apskaičiuoti faktiškai dirbtą laiką
  const faktiskaiDirbta = entries.reduce((sum, entry) => {
    return sum + calculateShiftDuration(entry);
  }, 0);

  // Apskaičiuoti laikotarpio normą
  const startMonth = periodStart.getMonth() + 1;
  const startYear = periodStart.getFullYear();
  const endMonth = periodEnd.getMonth() + 1;
  const endYear = periodEnd.getFullYear();

  // Skaičiuoti mėnesių skaičių laikotarpyje
  const periodMonths =
    (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  const laikotarpioNorma = calculatePeriodNorm(
    startYear,
    startMonth,
    periodMonths,
    employee.savaitineNorma,
    employee.etatas
  );

  const difference = faktiskaiDirbta - laikotarpioNorma;

  return {
    faktiskaiDirbta,
    laikotarpioNorma,
    virsvalandziai: Math.max(0, difference),
    neisdirbtaNorma: Math.max(0, -difference),
  };
}

/**
 * Apskaičiuoja viršvalandžius 7 dienų laikotarpyje.
 * Naudojama ALERT_2 validacijai.
 *
 * @param entries 7 dienų grafiko įrašai
 * @returns Dirbtos minutės per 7 dienas
 */
export function calculateHoursIn7Days(entries: ScheduleEntry[]): number {
  return entries.reduce((sum, entry) => {
    return sum + calculateShiftDuration(entry);
  }, 0);
}
