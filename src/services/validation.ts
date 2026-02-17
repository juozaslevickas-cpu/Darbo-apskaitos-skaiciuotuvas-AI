/**
 * DK ribų tikrinimas – 8 validacijos.
 *
 * | Kodas   | Tikrinimas                        | DK straipsnis        |
 * |---------|-----------------------------------|----------------------|
 * | ALERT_1 | Pamaina > 12h (be pietų)          | DK 114 str. 2 d.    |
 * | ALERT_2 | Vidurkis per 7d > 48h             | DK 114 str. 1 d.    |
 * | ALERT_3 | Su papildomu darbu per 7d > 60h   | DK 114 str. 2 d.    |
 * | ALERT_4 | > 6 darbo dienos iš eilės         | DK 114 str. 4 d.    |
 * | ALERT_5 | 2 pamainos iš eilės (be poilsio)  | DK 122 str. 2 d.    |
 * | ALERT_6 | Poilsis tarp pamainų < 11h        | DK 122 str. 2 d. 3p.|
 * | ALERT_7 | Savaitinis poilsis < 35h           | DK 122 str. 2 d. 3p.|
 * | ALERT_8 | Nakties vidurkis > 8h/d per 3 mėn.| DK 117 str.          |
 */

import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import type { ValidationAlert } from '@/models/validation-alert';
import { createValidationAlert } from '@/models/validation-alert';
import { DK_LIMITS } from '@/config/constants';
import { calculateShiftDuration, calculateRestBetweenEntries } from '@/services/shift-calculator';
import { calculateNightMinutes, calculateAverageNightHoursPerDay } from '@/services/night-calculator';
import { parseDate, formatDateLT } from '@/utils/date-utils';
import { addDays, differenceInCalendarDays } from 'date-fns';

/**
 * Vykdo visas 8 validacijas grafiko įrašams.
 *
 * @param entries Grafiko įrašai (turėtų būti surikiuoti pagal datą)
 * @param employee Darbuotojo duomenys
 * @returns Validacijos pranešimų masyvas
 */
export function validateSchedule(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];

  // Surikiuoti įrašus pagal datą
  const sorted = [...entries].sort((a, b) => a.data.localeCompare(b.data));

  alerts.push(...validateAlert1(sorted, employee));
  alerts.push(...validateAlert2(sorted, employee));
  alerts.push(...validateAlert3(sorted, employee));
  alerts.push(...validateAlert4(sorted, employee));
  alerts.push(...validateAlert5and6(sorted, employee));
  alerts.push(...validateAlert7(sorted, employee));
  alerts.push(...validateAlert8(sorted, employee));

  return alerts;
}

/**
 * ALERT_1: Pamaina > 12h (be pietų pertraukos).
 * DK 114 str. 2 d.
 */
function validateAlert1(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const maxShiftMinutes = DK_LIMITS.MAX_HOURS_PER_SHIFT * 60;

  for (const entry of entries) {
    const duration = calculateShiftDuration(entry);
    if (duration > maxShiftMinutes) {
      alerts.push(
        createValidationAlert({
          kodas: 'ALERT_1',
          pranesimas: `Pamainos trukmė (${(duration / 60).toFixed(1)} val.) viršija ${DK_LIMITS.MAX_HOURS_PER_SHIFT} val. ribą`,
          dkStraipsnis: 'DK 114 str. 2 d.',
          data: entry.data,
          darbuotojoId: employee.id,
        })
      );
    }
  }

  return alerts;
}

/**
 * ALERT_2: Vidutinis darbo laikas per bet kurį 7 dienų laikotarpį > 48h.
 * DK 114 str. 1 d.
 * Slenkantis 7 dienų langas.
 */
function validateAlert2(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];

  if (entries.length === 0) return alerts;

  const maxMinutes = DK_LIMITS.MAX_AVG_HOURS_PER_7_DAYS * 60;

  // Slenkantis 7 dienų langas
  for (let i = 0; i <= entries.length - 1; i++) {
    const windowStart = parseDate(entries[i].data);
    const windowEnd = addDays(windowStart, 6);
    const windowEndStr = formatDateLT(windowEnd);

    // Surinkti visus įrašus šiame 7 dienų lange
    const windowEntries = entries.filter((e) => {
      return e.data >= entries[i].data && e.data <= windowEndStr;
    });

    const totalMinutes = windowEntries.reduce(
      (sum, e) => sum + calculateShiftDuration(e),
      0
    );

    if (totalMinutes > maxMinutes) {
      // Patikrinti ar jau pridėtas alert šiai savaitei
      const alreadyReported = alerts.some(
        (a) =>
          a.kodas === 'ALERT_2' &&
          a.data === entries[i].data
      );

      if (!alreadyReported) {
        alerts.push(
          createValidationAlert({
            kodas: 'ALERT_2',
            pranesimas: `Per 7 dienų laikotarpį nuo ${entries[i].data} dirbta ${(totalMinutes / 60).toFixed(1)} val. (max ${DK_LIMITS.MAX_AVG_HOURS_PER_7_DAYS} val.)`,
            dkStraipsnis: 'DK 114 str. 1 d.',
            data: entries[i].data,
            darbuotojoId: employee.id,
          })
        );
      }
    }
  }

  return alerts;
}

/**
 * ALERT_3: Su papildomu darbu per 7 dienas > 60h.
 * DK 114 str. 2 d.
 * Analogiška ALERT_2, bet su didesne riba.
 */
function validateAlert3(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];

  if (entries.length === 0) return alerts;

  const maxMinutes = DK_LIMITS.MAX_HOURS_WITH_ADDITIONAL_7_DAYS * 60;

  for (let i = 0; i <= entries.length - 1; i++) {
    const windowStart = parseDate(entries[i].data);
    const windowEnd = addDays(windowStart, 6);
    const windowEndStr = formatDateLT(windowEnd);

    const windowEntries = entries.filter((e) => {
      return e.data >= entries[i].data && e.data <= windowEndStr;
    });

    const totalMinutes = windowEntries.reduce(
      (sum, e) => sum + calculateShiftDuration(e),
      0
    );

    if (totalMinutes > maxMinutes) {
      const alreadyReported = alerts.some(
        (a) =>
          a.kodas === 'ALERT_3' &&
          a.data === entries[i].data
      );

      if (!alreadyReported) {
        alerts.push(
          createValidationAlert({
            kodas: 'ALERT_3',
            tipas: 'KLAIDA',
            pranesimas: `Per 7 dienų laikotarpį nuo ${entries[i].data} su papildomu darbu dirbta ${(totalMinutes / 60).toFixed(1)} val. (max ${DK_LIMITS.MAX_HOURS_WITH_ADDITIONAL_7_DAYS} val.)`,
            dkStraipsnis: 'DK 114 str. 2 d.',
            data: entries[i].data,
            darbuotojoId: employee.id,
          })
        );
      }
    }
  }

  return alerts;
}

/**
 * ALERT_4: > 6 darbo dienų iš eilės.
 * DK 114 str. 4 d.
 */
function validateAlert4(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const maxConsecutive = DK_LIMITS.MAX_CONSECUTIVE_WORK_DAYS;

  let consecutiveWorkDays = 0;
  let streakStart: string | null = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isWork = entry.tipas === 'DARBAS' && calculateShiftDuration(entry) > 0;

    if (isWork) {
      if (consecutiveWorkDays === 0) {
        streakStart = entry.data;
      }

      // Patikrinti ar tai iš eilės einanti diena
      if (i > 0) {
        const prevDate = parseDate(entries[i - 1].data);
        const currDate = parseDate(entry.data);
        const diff = differenceInCalendarDays(currDate, prevDate);

        if (diff === 1) {
          consecutiveWorkDays++;
        } else {
          consecutiveWorkDays = 1;
          streakStart = entry.data;
        }
      } else {
        consecutiveWorkDays = 1;
      }

      if (consecutiveWorkDays > maxConsecutive) {
        alerts.push(
          createValidationAlert({
            kodas: 'ALERT_4',
            pranesimas: `${consecutiveWorkDays} darbo dienos iš eilės nuo ${streakStart} (max ${maxConsecutive})`,
            dkStraipsnis: 'DK 114 str. 4 d.',
            data: entry.data,
            darbuotojoId: employee.id,
          })
        );
      }
    } else {
      consecutiveWorkDays = 0;
      streakStart = null;
    }
  }

  return alerts;
}

/**
 * ALERT_5: Dvi pamainos iš eilės (be jokio poilsio tarp jų).
 * ALERT_6: Poilsis tarp pamainų < 11h.
 * DK 122 str. 2 d. 3 p.
 *
 * ALERT_5 = griežtas draudimas (bet koks atvejis kai nėra poilsio).
 * ALERT_6 = poilsis egzistuoja, bet per trumpas (< 11h).
 */
function validateAlert5and6(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const minRestMinutes = DK_LIMITS.MIN_REST_BETWEEN_SHIFTS_HOURS * 60;

  const workEntries = entries.filter(
    (e) => e.tipas === 'DARBAS' && e.pamainosPradzia && e.pamainosPabaiga
  );

  for (let i = 1; i < workEntries.length; i++) {
    const rest = calculateRestBetweenEntries(workEntries[i - 1], workEntries[i]);

    if (rest === null) continue;

    if (rest <= 0) {
      // ALERT_5: Nėra poilsio tarp pamainų
      alerts.push(
        createValidationAlert({
          kodas: 'ALERT_5',
          pranesimas: `Dvi pamainos iš eilės be poilsio: ${workEntries[i - 1].data} ir ${workEntries[i].data}`,
          dkStraipsnis: 'DK 122 str. 2 d.',
          data: workEntries[i].data,
          darbuotojoId: employee.id,
        })
      );
    } else if (rest < minRestMinutes) {
      // ALERT_6: Poilsis per trumpas
      alerts.push(
        createValidationAlert({
          kodas: 'ALERT_6',
          tipas: 'KLAIDA',
          pranesimas: `Poilsis tarp pamainų tik ${(rest / 60).toFixed(1)} val. (min. ${DK_LIMITS.MIN_REST_BETWEEN_SHIFTS_HOURS} val.): ${workEntries[i - 1].data} → ${workEntries[i].data}`,
          dkStraipsnis: 'DK 122 str. 2 d. 3 p.',
          data: workEntries[i].data,
          darbuotojoId: employee.id,
        })
      );
    }
  }

  return alerts;
}

/**
 * ALERT_7: Savaitinis nepertraukiamas poilsis < 35h.
 * DK 122 str. 2 d. 3 p.
 *
 * Algoritmas:
 * - Per kiekvieną 7 dienų langą: surasti visus poilsio tarpus
 * - Ilgiausias nepertraukiamas poilsio periodas turi būti >= 35h
 * - Modeliuojami konkretūs laikai (ne tik dienos)
 */
function validateAlert7(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const minWeeklyRest = DK_LIMITS.MIN_WEEKLY_REST_HOURS * 60;

  if (entries.length < 7) return alerts;

  // Sustatyti darbo intervalus
  const workIntervals = entries
    .filter(
      (e) => e.tipas === 'DARBAS' && e.pamainosPradzia && e.pamainosPabaiga
    )
    .map((e) => {
      const date = parseDate(e.data);
      const startMin = timeToMinutesFromDate(date, e.pamainosPradzia!);
      let endMin = timeToMinutesFromDate(date, e.pamainosPabaiga!);

      // Jei pamaina kerta vidurnaktį
      const startTimeMin = e.pamainosPradzia!.split(':').map(Number);
      const endTimeMin = e.pamainosPabaiga!.split(':').map(Number);
      if (
        endTimeMin[0] * 60 + endTimeMin[1] <=
        startTimeMin[0] * 60 + startTimeMin[1]
      ) {
        endMin += 24 * 60; // Kita diena
      }

      return { start: startMin, end: endMin };
    })
    .sort((a, b) => a.start - b.start);

  if (workIntervals.length === 0) return alerts;

  // Slenkantis 7 dienų langas
  for (let i = 0; i < entries.length - 6; i++) {
    const windowStart = parseDate(entries[i].data);
    const windowEnd = addDays(windowStart, 6);
    const windowStartMin = windowStart.getTime() / 60000;
    const windowEndMin = windowEnd.getTime() / 60000 + 24 * 60;

    // Gauti darbo intervalus šiame lange
    const windowIntervals = workIntervals.filter(
      (w) => w.start < windowEndMin && w.end > windowStartMin
    );

    if (windowIntervals.length === 0) continue;

    // Rasti ilgiausią poilsio tarpą
    let maxRest = windowIntervals[0].start - windowStartMin;

    for (let j = 1; j < windowIntervals.length; j++) {
      const gap = windowIntervals[j].start - windowIntervals[j - 1].end;
      if (gap > maxRest) maxRest = gap;
    }

    // Poilsis po paskutinės pamainos
    const lastGap = windowEndMin - windowIntervals[windowIntervals.length - 1].end;
    if (lastGap > maxRest) maxRest = lastGap;

    if (maxRest < minWeeklyRest) {
      const alreadyReported = alerts.some(
        (a) =>
          a.kodas === 'ALERT_7' &&
          a.data === entries[i].data
      );

      if (!alreadyReported) {
        alerts.push(
          createValidationAlert({
            kodas: 'ALERT_7',
            tipas: 'ISPEJIMAS',
            pranesimas: `Ilgiausias savaitinis poilsis tik ${(maxRest / 60).toFixed(1)} val. per 7 d. nuo ${entries[i].data} (min. ${DK_LIMITS.MIN_WEEKLY_REST_HOURS} val.)`,
            dkStraipsnis: 'DK 122 str. 2 d. 3 p.',
            data: entries[i].data,
            darbuotojoId: employee.id,
          })
        );
      }
    }
  }

  return alerts;
}

/**
 * ALERT_8: Nakties darbo vidurkis > 8h per dieną per 3 mėnesių laikotarpį.
 * DK 117 str.
 */
function validateAlert8(
  entries: ScheduleEntry[],
  employee: Employee
): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const maxNightAvg = DK_LIMITS.MAX_NIGHT_AVG_HOURS_PER_DAY * 60;

  const avgNight = calculateAverageNightHoursPerDay(entries);

  if (avgNight > maxNightAvg) {
    alerts.push(
      createValidationAlert({
        kodas: 'ALERT_8',
        tipas: 'ISPEJIMAS',
        pranesimas: `Nakties darbo vidurkis ${(avgNight / 60).toFixed(1)} val./d. viršija ${DK_LIMITS.MAX_NIGHT_AVG_HOURS_PER_DAY} val./d. ribą`,
        dkStraipsnis: 'DK 117 str.',
        darbuotojoId: employee.id,
      })
    );
  }

  return alerts;
}

/**
 * Pagalbinė: konvertuoja datą ir laiką į absoliučias minutes nuo epoch.
 */
function timeToMinutesFromDate(date: Date, time: string): number {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.getTime() / 60000;
}
