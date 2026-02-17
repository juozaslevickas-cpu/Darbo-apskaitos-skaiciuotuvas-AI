/**
 * Mėnesio darbo laiko normos skaičiavimas.
 *
 * Formulė (iš DARBO_LAIKO_TAISYKLES.md §2.4):
 * darbo_dienu_sk = Pr-Pn dienų sk. mėnesyje - švenčių dienų Pr-Pn sk.
 * dienos_norma = savaitine_norma / 5 (val.) × 60 (min.)
 * priessventiniu_sutrumpinimai = prieššventinių darbo dienų sk. × 60 (min.)
 *   // TIK jei etatas == 1.0; jei dalinis etatas → 0
 * bendra_norma = darbo_dienu_sk × dienos_norma - priessventiniu_sutrumpinimai
 * norma_darbuotojui = bendra_norma × etatas
 */

import { getWorkDaysInMonth, getPreHolidayReductionHours } from '@/utils/date-utils';

export interface MonthlyNorm {
  /** Darbo dienų skaičius mėnesyje (be švenčių) */
  darbodienuSk: number;
  /** Vienos dienos norma minutėmis (savaitineNorma / 5 * 60) */
  dienosNorma: number;
  /** Prieššventinių sutrumpinimų minutės */
  priessventiniuSutrumpinimai: number;
  /** Bendra mėnesio norma minutėmis (prieš etato koregavimą) */
  bendraNorma: number;
  /** Norma konkrečiam darbuotojui minutėmis (su etatu) */
  normaDarbuotojui: number;
}

/**
 * Apskaičiuoja mėnesio darbo laiko normą.
 *
 * @param year Metai
 * @param month Mėnuo (1-12)
 * @param weeklyNorm Savaitinė norma valandomis (numatytoji: 40)
 * @param etatas Darbuotojo etatas (0.25-1.0, numatytasis: 1.0)
 * @returns MonthlyNorm objektas su visomis normos dalimis
 */
export function calculateMonthlyNorm(
  year: number,
  month: number,
  weeklyNorm: number = 40,
  etatas: number = 1.0
): MonthlyNorm {
  const darbodienuSk = getWorkDaysInMonth(year, month);

  // Dienos norma minutėmis: savaitinė norma / 5 dienų * 60 min
  const dienosNorma = (weeklyNorm / 5) * 60;

  // Prieššventiniai sutrumpinimai tik pilnam etatui
  // DK 112 str. 6 d.: "Prieššventinę dieną darbo dienos trukmė sutrumpinama viena valanda"
  // Dalinio etato darbuotojai jau turi sutrumpintą darbo laiką
  const preHolidayHours = etatas === 1.0 ? getPreHolidayReductionHours(year, month) : 0;
  const priessventiniuSutrumpinimai = preHolidayHours * 60;

  // Bendra norma = darbo dienų × dienos norma - prieššventiniai sutrumpinimai
  const bendraNorma = darbodienuSk * dienosNorma - priessventiniuSutrumpinimai;

  // Darbuotojo norma = bendra norma × etatas
  const normaDarbuotojui = bendraNorma * etatas;

  return {
    darbodienuSk,
    dienosNorma,
    priessventiniuSutrumpinimai,
    bendraNorma,
    normaDarbuotojui,
  };
}

/**
 * Apskaičiuoja normą keliems mėnesiams (apskaitiniam laikotarpiui).
 * Susumuoja kiekvieno mėnesio normas.
 *
 * @param year Pradžios metai
 * @param startMonth Pradžios mėnuo (1-12)
 * @param periodMonths Laikotarpio mėnesių skaičius
 * @param weeklyNorm Savaitinė norma valandomis
 * @param etatas Darbuotojo etatas
 * @returns Bendra norma minutėmis visam laikotarpiui
 */
export function calculatePeriodNorm(
  year: number,
  startMonth: number,
  periodMonths: number,
  weeklyNorm: number = 40,
  etatas: number = 1.0
): number {
  let totalNorm = 0;
  let currentYear = year;
  let currentMonth = startMonth;

  for (let i = 0; i < periodMonths; i++) {
    const norm = calculateMonthlyNorm(currentYear, currentMonth, weeklyNorm, etatas);
    totalNorm += norm.normaDarbuotojui;

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return totalNorm;
}
