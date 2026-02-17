/**
 * Pamainos trukmės ir poilsio tarp pamainų skaičiavimas.
 */

import type { ScheduleEntry } from '@/models/schedule-entry';
import { shiftDurationMinutes, timeToMinutes } from '@/utils/time-overlap';
import { parseDate } from '@/utils/date-utils';
import { differenceInMinutes } from 'date-fns';

/**
 * Apskaičiuoja pamainos trukmę minutėmis (be pietų pertraukos).
 *
 * Jei tipas != 'DARBAS' arba nėra pradžios/pabaigos → grąžina 0.
 *
 * @example entry: 08:00-20:00, 60min pietūs → 660 min (11h)
 * @example entry: 22:00-06:00, 30min pertrauka → 450 min (7.5h)
 */
export function calculateShiftDuration(entry: ScheduleEntry): number {
  if (entry.tipas !== 'DARBAS') return 0;
  if (!entry.pamainosPradzia || !entry.pamainosPabaiga) return 0;

  const totalMinutes = shiftDurationMinutes(
    entry.pamainosPradzia,
    entry.pamainosPabaiga
  );

  return totalMinutes - (entry.pietuPertraukaMin ?? 0);
}

/**
 * Apskaičiuoja poilsio trukmę minutėmis tarp dviejų pamainų.
 *
 * Atsižvelgia į:
 * - Vidurnakčio kirtimą (pamaina, kuri baigiasi po vidurnakčio)
 * - Datų skirtumą tarp pamainų
 *
 * @param previousEnd Ankstesnės pamainos pabaigos laikas (HH:MM)
 * @param previousDate Ankstesnės pamainos data (YYYY-MM-DD)
 * @param currentStart Dabartinės pamainos pradžios laikas (HH:MM)
 * @param currentDate Dabartinės pamainos data (YYYY-MM-DD)
 * @returns Poilsio trukmė minutėmis
 *
 * @example
 * // Pamaina baigiasi 20:00, kita prasideda 08:00 kitą dieną → 12h (720 min)
 * calculateRestBetweenShifts("20:00", "2026-01-05", "08:00", "2026-01-06") → 720
 *
 * @example
 * // Pamaina baigiasi 23:00, kita prasideda 08:00 kitą dieną → 9h (540 min)
 * calculateRestBetweenShifts("23:00", "2026-01-05", "08:00", "2026-01-06") → 540
 */
export function calculateRestBetweenShifts(
  previousEnd: string,
  previousDate: string,
  currentStart: string,
  currentDate: string
): number {
  const prevDate = parseDate(previousDate);
  const currDate = parseDate(currentDate);

  const prevEndMin = timeToMinutes(previousEnd);
  const currStartMin = timeToMinutes(currentStart);

  // Sukonstruoti tikslias datas su laikais
  const prevEndDateTime = new Date(prevDate);
  prevEndDateTime.setHours(Math.floor(prevEndMin / 60), prevEndMin % 60, 0, 0);

  const currStartDateTime = new Date(currDate);
  currStartDateTime.setHours(
    Math.floor(currStartMin / 60),
    currStartMin % 60,
    0,
    0
  );

  // Jei ankstesnė pamaina kerta vidurnaktį (pabaiga < pradžia laiku),
  // tai faktinė pabaiga yra kitą dieną
  // Tačiau data nurodyta kaip pamainos pradžios data,
  // todėl pabaiga yra +1 diena nuo nurodytos datos
  // Bet mes gauname previousEnd jau kaip baigties laiką su previousDate,
  // kur previousDate yra pamainos diena.
  // Jei pamaina kerta vidurnaktį, pabaigos laikas (pvz., 06:00) yra kitą dieną.
  // Tam tikrinkime ar previousEnd laiku yra mažesnis už tipinę pamainos pradžią.

  // Paprastesnis būdas: skaičiuoti naudojant Date objektus
  // Jei prevEndMin yra mažas (< 12:00) ir previousDate != currentDate-1,
  // tikėtina kad pamaina kerta vidurnaktį

  return differenceInMinutes(currStartDateTime, prevEndDateTime);
}

/**
 * Apskaičiuoja poilsio trukmę tarp dviejų ScheduleEntry objektų.
 * Naudoja calculateRestBetweenShifts su tinkamais parametrais.
 *
 * @returns Poilsio trukmė minutėmis, arba null jei negalima apskaičiuoti
 */
export function calculateRestBetweenEntries(
  previous: ScheduleEntry,
  current: ScheduleEntry
): number | null {
  if (previous.tipas !== 'DARBAS' || !previous.pamainosPabaiga) return null;
  if (current.tipas !== 'DARBAS' || !current.pamainosPradzia) return null;

  // Nustatyti ar ankstesnė pamaina kerta vidurnaktį
  const prevStartMin = previous.pamainosPradzia
    ? timeToMinutes(previous.pamainosPradzia)
    : 0;
  const prevEndMin = timeToMinutes(previous.pamainosPabaiga);

  let prevEndDate = previous.data;
  if (prevEndMin <= prevStartMin && previous.pamainosPradzia) {
    // Pamaina kerta vidurnaktį – pabaiga yra kitą dieną
    const date = parseDate(previous.data);
    date.setDate(date.getDate() + 1);
    prevEndDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  return calculateRestBetweenShifts(
    previous.pamainosPabaiga,
    prevEndDate,
    current.pamainosPradzia,
    current.data
  );
}
