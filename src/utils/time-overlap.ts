/**
 * Intervalų persidengimo ir laiko konvertavimo pagalbinės funkcijos.
 * Palaikomas vidurnakčio kirtimas (pvz., pamaina 22:00–06:00).
 *
 * Visos funkcijos dirba su minutėmis nuo vidurnakčio (0–1440).
 * Intervalai yra pusatviri: [pradžia, pabaiga) – pradžia įtraukta, pabaiga ne.
 */

/**
 * Konvertuoja laiko eilutę "HH:MM" į minutes nuo vidurnakčio.
 * @example timeToMinutes("08:00") → 480
 * @example timeToMinutes("22:30") → 1350
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Konvertuoja minutes nuo vidurnakčio atgal į "HH:MM" formatą.
 * @example minutesToTime(480) → "08:00"
 */
export function minutesToTime(minutes: number): string {
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalizedMinutes / 60);
  const m = normalizedMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Apskaičiuoja pamainos trukmę minutėmis.
 * Palaiko vidurnakčio kirtimą (jei end < start).
 *
 * @example shiftDurationMinutes("08:00", "20:00") → 720 (12h)
 * @example shiftDurationMinutes("22:00", "06:00") → 480 (8h)
 */
export function shiftDurationMinutes(start: string, end: string): number {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  if (endMin > startMin) {
    return endMin - startMin;
  }
  // Kerta vidurnaktį
  return 1440 - startMin + endMin;
}

/**
 * Dviejų intervalų [a1, a2] ir [b1, b2] persidengimas minutėmis.
 * Abu intervalai turi būti tame pačiame 0–1440 diapazone (nekertant vidurnakčio).
 */
export function overlapMinutes(
  a1: number,
  a2: number,
  b1: number,
  b2: number
): number {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

/**
 * Apskaičiuoja nakties valandų skaičių (minutėmis) pamainos metu.
 *
 * Nakties laikas: 22:00 (1320 min) – 06:00 (360 min).
 * Intervalai pusatviri [pradžia, pabaiga) – jei pamaina baigiasi 22:00,
 * tai 22:00 minutė nėra dirbama, todėl nakties val. = 0.
 *
 * Algoritmas:
 * 1. Konvertuoti pamainą į segmentus (jei kerta vidurnaktį → du segmentai)
 * 2. Nakties intervalai: [1320, 1440] ir [0, 360] minutėmis
 * 3. Susumuoti kiekvieno pamainos segmento persidengimą su nakties intervalais
 *
 * @example nightMinutes("08:00", "20:00") → 0
 * @example nightMinutes("22:00", "06:00") → 480 (8h)
 * @example nightMinutes("18:00", "06:00") → 480 (8h)
 * @example nightMinutes("20:00", "08:00") → 480 (8h)
 * @example nightMinutes("14:00", "23:00") → 60 (1h)
 * @example nightMinutes("23:00", "03:00") → 240 (4h)
 */
export function nightMinutes(shiftStart: string, shiftEnd: string): number {
  const startMin = timeToMinutes(shiftStart);
  const endMin = timeToMinutes(shiftEnd);

  // Nakties intervalai (minutėmis nuo vidurnakčio)
  const NIGHT_EVENING_START = 1320; // 22:00
  const NIGHT_EVENING_END = 1440; // 24:00 (vidurnaktis)
  const NIGHT_MORNING_START = 0; // 00:00
  const NIGHT_MORNING_END = 360; // 06:00

  // Sukurti pamainos segmentus
  const segments: [number, number][] = [];

  if (endMin > startMin) {
    // Pamaina nekerta vidurnakčio
    segments.push([startMin, endMin]);
  } else {
    // Pamaina kerta vidurnaktį → du segmentai
    segments.push([startMin, 1440]); // Nuo pradžios iki vidurnakčio
    segments.push([0, endMin]); // Nuo vidurnakčio iki pabaigos
  }

  let totalNight = 0;

  for (const [segStart, segEnd] of segments) {
    // Persidengimas su vakarine nakties dalimi [22:00, 24:00]
    totalNight += overlapMinutes(
      segStart,
      segEnd,
      NIGHT_EVENING_START,
      NIGHT_EVENING_END
    );
    // Persidengimas su rytine nakties dalimi [00:00, 06:00]
    totalNight += overlapMinutes(
      segStart,
      segEnd,
      NIGHT_MORNING_START,
      NIGHT_MORNING_END
    );
  }

  return totalNight;
}
