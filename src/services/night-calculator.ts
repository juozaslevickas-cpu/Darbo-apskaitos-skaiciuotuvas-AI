/**
 * Nakties valandų skaičiavimas.
 * Nakties laikas: 22:00–06:00 (DK 117 str.)
 */

import type { ScheduleEntry } from '@/models/schedule-entry';
import { nightMinutes } from '@/utils/time-overlap';
import { calculateShiftDuration } from '@/services/shift-calculator';

/**
 * Apskaičiuoja nakties minučių skaičių vienai pamainai.
 * Jei tipas != 'DARBAS' arba nėra pradžios/pabaigos → grąžina 0.
 *
 * @example entry 22:00-06:00 → 480 min (8h)
 * @example entry 08:00-20:00 → 0 min
 * @example entry 18:00-06:00 → 480 min (8h)
 */
export function calculateNightMinutes(entry: ScheduleEntry): number {
  if (entry.tipas !== 'DARBAS') return 0;
  if (!entry.pamainosPradzia || !entry.pamainosPabaiga) return 0;

  return nightMinutes(entry.pamainosPradzia, entry.pamainosPabaiga);
}

/**
 * Tikrina ar darbuotojas yra nakties darbuotojas.
 *
 * DK 117 str.: Darbuotojas laikomas dirbančiu naktį, jei:
 * 1. Bent 3 valandos per pamainą yra nakties metu, ARBA
 * 2. Bent 25% viso darbo laiko per metus yra nakties metu
 *
 * @param entries Grafiko įrašai laikotarpiui
 * @param period Laikotarpio pradžia ir pabaiga
 * @returns true jei darbuotojas kvalifikuojamas kaip nakties darbuotojas
 */
export function isNightWorker(
  entries: ScheduleEntry[],
  period: { start: Date; end: Date }
): boolean {
  const workEntries = entries.filter(
    (e) =>
      e.tipas === 'DARBAS' && e.pamainosPradzia && e.pamainosPabaiga
  );

  if (workEntries.length === 0) return false;

  // Kriterijus 1: bent 3 valandos per pamainą naktį
  const nightShiftsCount = workEntries.filter(
    (e) => calculateNightMinutes(e) >= 180
  ).length;

  // Jei dauguma pamainų turi ≥3h nakties darbo
  if (nightShiftsCount > workEntries.length / 2) return true;

  // Kriterijus 2: bent 25% viso darbo laiko per laikotarpį yra nakties
  let totalWorked = 0;
  let totalNight = 0;

  for (const entry of workEntries) {
    totalWorked += calculateShiftDuration(entry);
    totalNight += calculateNightMinutes(entry);
  }

  if (totalWorked > 0 && totalNight / totalWorked >= 0.25) return true;

  return false;
}

/**
 * Apskaičiuoja vidutinį nakties valandų skaičių per dieną per nurodytą laikotarpį.
 * Naudojama ALERT_8 validacijai (max 8h nakties vidurkis per 3 mėn.).
 *
 * @param entries Grafiko įrašai
 * @returns Vidutinis nakties valandų skaičius minutėmis per darbo dieną su nakties darbu
 */
export function calculateAverageNightHoursPerDay(
  entries: ScheduleEntry[]
): number {
  const nightWorkEntries = entries.filter(
    (e) =>
      e.tipas === 'DARBAS' &&
      e.pamainosPradzia &&
      e.pamainosPabaiga &&
      calculateNightMinutes(e) > 0
  );

  if (nightWorkEntries.length === 0) return 0;

  const totalNightMinutes = nightWorkEntries.reduce(
    (sum, e) => sum + calculateNightMinutes(e),
    0
  );

  return totalNightMinutes / nightWorkEntries.length;
}
