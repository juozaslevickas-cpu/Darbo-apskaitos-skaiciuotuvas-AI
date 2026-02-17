import { getDay, addDays, isSameDay } from 'date-fns';

/**
 * Lietuvos Respublikos švenčių dienų sąrašas ir skaičiavimo funkcijos.
 * Pagrindas: DK 123 str. 1 d.
 *
 * Statinės šventės: 12 fiksuotų datų
 * Dinaminės šventės: Velykos (sekmadienis + pirmadienis), Motinos diena, Tėvo diena
 * Iš viso: 16 švenčių dienų
 */

/** Statinės šventės: [mėnuo (1-12), diena] */
const STATIC_HOLIDAYS: readonly { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: 'Naujųjų metų diena' },
  { month: 2, day: 16, name: 'Lietuvos valstybės atkūrimo diena' },
  { month: 3, day: 11, name: 'Lietuvos nepriklausomybės atkūrimo diena' },
  { month: 5, day: 1, name: 'Tarptautinė darbo diena' },
  { month: 6, day: 24, name: 'Rasos ir Joninių diena' },
  { month: 7, day: 6, name: 'Valstybės (Mindaugo karūnavimo) diena' },
  { month: 8, day: 15, name: 'Žolinė (Švč. Mergelės Marijos ėmimo į dangų diena)' },
  { month: 11, day: 1, name: 'Visų Šventųjų diena' },
  { month: 11, day: 2, name: 'Mirusiųjų atminimo (Vėlinių) diena' },
  { month: 12, day: 24, name: 'Kūčių diena' },
  { month: 12, day: 25, name: 'Kalėdų pirma diena' },
  { month: 12, day: 26, name: 'Kalėdų antra diena' },
];

/**
 * Apskaičiuoja Velykų sekmadienio datą pagal Anonymous Gregorian Computus algoritmą.
 * Šis algoritmas tinka Grigaliaus kalendoriui (nuo 1583 m.).
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Grąžina pirmo mėnesio sekmadienio datą.
 * Naudojama Motinos dienai (gegužė) ir Tėvo dienai (birželis).
 */
function getFirstSundayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = getDay(firstDay); // 0 = sekmadienis
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return addDays(firstDay, daysUntilSunday);
}

/**
 * Grąžina visų Lietuvos švenčių dienų sąrašą nurodytais metais.
 * Apima 12 statinių + 4 dinamines šventes.
 */
export function getHolidays(year: number): Date[] {
  const holidays: Date[] = [];

  // 12 statinių švenčių
  for (const { month, day } of STATIC_HOLIDAYS) {
    holidays.push(new Date(year, month - 1, day));
  }

  // Velykų sekmadienis ir pirmadienis
  const easterSunday = getEasterSunday(year);
  holidays.push(easterSunday);
  holidays.push(addDays(easterSunday, 1));

  // Motinos diena: pirmas gegužės sekmadienis
  holidays.push(getFirstSundayOfMonth(year, 5));

  // Tėvo diena: pirmas birželio sekmadienis
  holidays.push(getFirstSundayOfMonth(year, 6));

  return holidays;
}

/**
 * Tikrina, ar nurodyta data yra Lietuvos šventė.
 */
export function isHoliday(date: Date): boolean {
  const holidays = getHolidays(date.getFullYear());
  return holidays.some((h) => isSameDay(h, date));
}

/**
 * Tikrina, ar nurodyta data yra prieššventinė darbo diena.
 *
 * Prieššventinė diena – tai darbo diena (Pr–Pn), kuri:
 * 1. Nėra pati šventė
 * 2. Po jos eina šventės diena
 *
 * Prieššventinę dieną darbo trukmė sutrumpinama 1 valanda (DK 112 str. 6 d.),
 * tik pilno etato darbuotojams.
 *
 * SVARBU: prieššventinė diena gali būti ankstesniame mėnesyje
 * (pvz., gruodžio 31 d. prieš sausio 1 d.).
 */
export function isPreHoliday(date: Date): boolean {
  const dayOfWeek = getDay(date);

  // Turi būti darbo diena (Pr=1 ... Pn=5)
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  // Pati diena neturi būti šventė
  if (isHoliday(date)) return false;

  // Kita diena turi būti šventė (gali būti kitų metų – pvz., gruodžio 31 → sausio 1)
  const nextDay = addDays(date, 1);
  return isHoliday(nextDay);
}

export { STATIC_HOLIDAYS };
