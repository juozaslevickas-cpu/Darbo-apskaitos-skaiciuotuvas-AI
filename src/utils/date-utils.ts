/**
 * Datos operacijos darbo laiko apskaitai.
 * Naudoja date-fns su lietuvišku locale.
 */

import {
  format,
  getDay,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDaysInMonth,
} from 'date-fns';
import { lt } from 'date-fns/locale';
import { getHolidays, isHoliday, isPreHoliday } from '@/config/holidays';

/**
 * Savaitės dienos pavadinimas lietuviškai.
 * getDay grąžina: 0=Sk, 1=Pr, 2=An, 3=Tr, 4=Kt, 5=Pn, 6=Šš
 */
const WEEKDAY_NAMES = [
  'sekmadienis',
  'pirmadienis',
  'antradienis',
  'trečiadienis',
  'ketvirtadienis',
  'penktadienis',
  'šeštadienis',
];

const WEEKDAY_SHORT = ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Šš'];

/**
 * Grąžina savaitės dienos pavadinimą lietuviškai.
 * @example getWeekdayName(new Date(2026, 0, 5)) → "pirmadienis"
 */
export function getWeekdayName(date: Date): string {
  return WEEKDAY_NAMES[getDay(date)];
}

/**
 * Grąžina trumpą savaitės dienos pavadinimą.
 * @example getWeekdayShort(new Date(2026, 0, 5)) → "Pr"
 */
export function getWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[getDay(date)];
}

/**
 * Tikrina ar data yra darbo diena (pirmadienis–penktadienis).
 */
export function isWeekday(date: Date): boolean {
  const day = getDay(date);
  return day >= 1 && day <= 5;
}

/**
 * Grąžina pirmo nurodyto mėnesio sekmadienio datą.
 * @param month 1-12
 */
export function getFirstSundayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = getDay(firstDay);
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return addDays(firstDay, daysUntilSunday);
}

/**
 * Skaičiuoja darbo dienų skaičių mėnesyje.
 * Darbo dienos = Pr-Pn dienų skaičius - švenčių, kurios sutampa su Pr-Pn.
 *
 * @param month 1-12
 */
export function getWorkDaysInMonth(year: number, month: number): number {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  const allDays = eachDayOfInterval({ start, end });

  const holidays = getHolidays(year);

  let workDays = 0;
  for (const day of allDays) {
    if (!isWeekday(day)) continue;
    // Patikrinti ar darbo diena yra šventė
    const isHol = holidays.some((h) => isSameDay(h, day));
    if (!isHol) {
      workDays++;
    }
  }

  return workDays;
}

/**
 * Skaičiuoja prieššventinių sutrumpinimų valandas mėnesyje.
 *
 * Kiekvienai šventei mėnesyje: jei diena PRIEŠ šventę yra darbo diena (Pr-Pn)
 * IR ta diena nėra pati šventė → +1 valanda sutrumpinimo.
 *
 * SVARBU: prieššventinė diena gali būti ankstesniame mėnesyje
 * (pvz., gruodžio 31 d. prieš sausio 1 d.) – šiuo atveju
 * sutrumpinimas priklauso ankstesniam mėnesiui.
 *
 * Ši funkcija skaičiuoja sutrumpinimus, PRIKLAUSANČIUS nurodytam mėnesiui.
 * T.y., ieškome prieššventinių dienų, kurios yra ŠIAME mėnesyje.
 *
 * @param month 1-12
 * @returns sutrumpinimo valandų skaičius
 */
export function getPreHolidayReductionHours(
  year: number,
  month: number
): number {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  const allDays = eachDayOfInterval({ start, end });

  let reductions = 0;
  for (const day of allDays) {
    if (isPreHoliday(day)) {
      reductions++;
    }
  }

  return reductions;
}

/**
 * Formatuoja datą lietuvišku formatu "YYYY-MM-DD".
 */
export function formatDateLT(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formatuoja minutes į valandas su kableliu (lietuviškas formatas).
 * @example formatTimeLT(480) → "8,00"
 * @example formatTimeLT(470) → "7,83"
 */
export function formatTimeLT(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(2).replace('.', ',');
}

/**
 * Parsina datos eilutę "YYYY-MM-DD" į Date objektą.
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Grąžina visas mėnesio dienas kaip Date masyvą.
 * @param month 1-12
 */
export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
}

/**
 * Grąžina dienų skaičių mėnesyje.
 * @param month 1-12
 */
export function getDaysInMonthCount(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1, 1));
}

/**
 * Formatuoja mėnesio pavadinimą lietuviškai.
 * @param month 1-12
 */
export function getMonthNameLT(month: number): string {
  const date = new Date(2026, month - 1, 1);
  return format(date, 'LLLL', { locale: lt });
}
