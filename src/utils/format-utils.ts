/**
 * Formatavimo pagalbinės funkcijos.
 * Lietuviškas formatas: kablelis kaip dešimtainis skirtukas.
 */

/**
 * Konvertuoja minutes į valandas su kableliu (lietuviškas formatas).
 * @example hoursToDisplay(480) → "8,00"
 * @example hoursToDisplay(470) → "7,83"
 * @example hoursToDisplay(0) → "0,00"
 * @example hoursToDisplay(90) → "1,50"
 */
export function hoursToDisplay(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(2).replace('.', ',');
}

/**
 * Konvertuoja minutes į HH:MM formatą.
 * @example minutesToHHMM(480) → "08:00"
 * @example minutesToHHMM(470) → "07:50"
 * @example minutesToHHMM(90) → "01:30"
 * @example minutesToHHMM(0) → "00:00"
 */
export function minutesToHHMM(minutes: number): string {
  const totalMinutes = Math.abs(Math.round(minutes));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const sign = minutes < 0 ? '-' : '';
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Formatuoja skaičių su kableliu kaip dešimtainiu skirtuku.
 * @example formatDecimalLT(8.5) → "8,50"
 * @example formatDecimalLT(0) → "0,00"
 */
export function formatDecimalLT(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace('.', ',');
}

/**
 * Formatuoja skirtumą su + arba - ženklu.
 * @example formatDifference(120) → "+2,00"
 * @example formatDifference(-60) → "-1,00"
 * @example formatDifference(0) → "0,00"
 */
export function formatDifference(minutes: number): string {
  const hours = minutes / 60;
  const formatted = Math.abs(hours).toFixed(2).replace('.', ',');
  if (minutes > 0) return `+${formatted}`;
  if (minutes < 0) return `-${formatted}`;
  return '0,00';
}
