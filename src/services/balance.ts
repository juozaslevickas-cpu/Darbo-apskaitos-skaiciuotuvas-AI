/**
 * Mėnesio balanso skaičiavimas.
 *
 * Sujungia visus skaičiavimus į vieną suvestinę:
 * - Mėnesio normą
 * - Faktiškai dirbtą laiką
 * - Nakties valandas
 * - Darbą poilsio/švenčių dienomis
 * - Viršvalandžius
 * - Neatvykimų suvestinę
 */

import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import { calculateMonthlyNorm } from '@/services/norm-calculator';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculateNightMinutes } from '@/services/night-calculator';
import { calculateOvertimeForPeriod } from '@/services/overtime-calculator';
import { parseDate, getMonthDays } from '@/utils/date-utils';
import { isHoliday } from '@/config/holidays';
import { getDay } from 'date-fns';

export interface NeatvykimoSuvestine {
  /** Neatvykimo kodas */
  kodas: string;
  /** Neatvykimo valandos minutėmis */
  valandos: number;
  /** Neatvykimo dienų skaičius */
  dienos: number;
}

export interface MonthlyBalance {
  /** Mėnesio norma minutėmis */
  menesioNorma: number;
  /** Faktiškai dirbta minutėmis */
  faktiskaiDirbta: number;
  /** Nakties valandos minutėmis */
  naktiesValandos: number;
  /** Darbas poilsio dienomis (šeštadieniais/sekmadieniais) minutėmis */
  darbasPoilsioDienomis: number;
  /** Darbas švenčių dienomis minutėmis */
  darbasSvenciu: number;
  /** Viršvalandžiai minutėmis */
  virsvalandziai: number;
  /** Skirtumas: faktiškai dirbta - norma (minutėmis) */
  skirtumas: number;
  /** Neatvykimų suvestinė grupuota pagal kodą */
  neatvykimai: NeatvykimoSuvestine[];
}

/**
 * Apskaičiuoja mėnesio balansą vienam darbuotojui.
 *
 * @param entries Grafiko įrašai konkrečiam mėnesiui
 * @param employee Darbuotojo duomenys
 * @param year Metai
 * @param month Mėnuo (1-12)
 * @returns MonthlyBalance suvestinė
 */
export function calculateMonthlyBalance(
  entries: ScheduleEntry[],
  employee: Employee,
  year: number,
  month: number
): MonthlyBalance {
  // 1. Mėnesio norma
  const norm = calculateMonthlyNorm(
    year,
    month,
    employee.savaitineNorma,
    employee.etatas
  );
  const menesioNorma = norm.normaDarbuotojui;

  // 2. Faktiškai dirbta
  let faktiskaiDirbta = 0;
  let naktiesValandos = 0;
  let darbasPoilsioDienomis = 0;
  let darbasSvenciu = 0;

  for (const entry of entries) {
    const shiftDuration = calculateShiftDuration(entry);
    faktiskaiDirbta += shiftDuration;

    // Nakties valandos
    naktiesValandos += calculateNightMinutes(entry);

    // Darbas poilsio dienomis (šeštadienis = 6, sekmadienis = 0)
    if (entry.tipas === 'DARBAS' && shiftDuration > 0) {
      const date = parseDate(entry.data);
      const dayOfWeek = getDay(date);

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        darbasPoilsioDienomis += shiftDuration;
      }

      // Darbas švenčių dienomis
      if (isHoliday(date)) {
        darbasSvenciu += shiftDuration;
      }
    }
  }

  // 3. Skirtumas
  const skirtumas = faktiskaiDirbta - menesioNorma;

  // 4. Viršvalandžiai (tik jei apskaitinis laikotarpis = 1 mėnuo)
  let virsvalandziai = 0;
  if (employee.apskaitinisLaikotarpisMenesiai === 1) {
    virsvalandziai = Math.max(0, skirtumas);
  }

  // 5. Neatvykimų suvestinė
  const neatvykimuMap: Record<string, { valandos: number; dienos: number }> =
    {};

  for (const entry of entries) {
    if (
      entry.tipas !== 'DARBAS' &&
      entry.tipas !== 'POILSIS' &&
      entry.tipas !== 'SVENTE'
    ) {
      const kodas = entry.tipas;
      if (!neatvykimuMap[kodas]) {
        neatvykimuMap[kodas] = { valandos: 0, dienos: 0 };
      }
      neatvykimuMap[kodas].dienos++;

      // Neatvykimo valandos = darbuotojo individualios dienos norma
      // (pagal grafiką, ne kalendorinė)
      neatvykimuMap[kodas].valandos += norm.dienosNorma * employee.etatas;
    }
  }

  const neatvykimai: NeatvykimoSuvestine[] = Object.entries(neatvykimuMap).map(
    ([kodas, { valandos, dienos }]) => ({
      kodas,
      valandos,
      dienos,
    })
  );

  return {
    menesioNorma,
    faktiskaiDirbta,
    naktiesValandos,
    darbasPoilsioDienomis,
    darbasSvenciu,
    virsvalandziai,
    skirtumas,
    neatvykimai,
  };
}
