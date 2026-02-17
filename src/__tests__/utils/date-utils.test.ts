import { describe, it, expect } from 'vitest';
import {
  getWeekdayName,
  getWeekdayShort,
  isWeekday,
  getFirstSundayOfMonth,
  getWorkDaysInMonth,
  getPreHolidayReductionHours,
  formatDateLT,
  formatTimeLT,
  parseDate,
  getMonthDays,
  getDaysInMonthCount,
} from '@/utils/date-utils';
import { getDay } from 'date-fns';

// ============================================================================
// Savaitės dienos
// ============================================================================

describe('getWeekdayName', () => {
  it('pirmadienis', () => {
    // 2026-01-05 = pirmadienis
    expect(getWeekdayName(new Date(2026, 0, 5))).toBe('pirmadienis');
  });

  it('sekmadienis', () => {
    // 2026-01-04 = sekmadienis
    expect(getWeekdayName(new Date(2026, 0, 4))).toBe('sekmadienis');
  });

  it('šeštadienis', () => {
    // 2026-01-03 = šeštadienis
    expect(getWeekdayName(new Date(2026, 0, 3))).toBe('šeštadienis');
  });
});

describe('getWeekdayShort', () => {
  it('pirmadienis → Pr', () => {
    expect(getWeekdayShort(new Date(2026, 0, 5))).toBe('Pr');
  });

  it('sekmadienis → Sk', () => {
    expect(getWeekdayShort(new Date(2026, 0, 4))).toBe('Sk');
  });
});

describe('isWeekday', () => {
  it('pirmadienis yra darbo diena', () => {
    expect(isWeekday(new Date(2026, 0, 5))).toBe(true);
  });

  it('penktadienis yra darbo diena', () => {
    expect(isWeekday(new Date(2026, 0, 9))).toBe(true);
  });

  it('šeštadienis nėra darbo diena', () => {
    expect(isWeekday(new Date(2026, 0, 3))).toBe(false);
  });

  it('sekmadienis nėra darbo diena', () => {
    expect(isWeekday(new Date(2026, 0, 4))).toBe(false);
  });
});

// ============================================================================
// getFirstSundayOfMonth
// ============================================================================

describe('getFirstSundayOfMonth', () => {
  it('2026 gegužė: pirmas sekmadienis = gegužės 3 d.', () => {
    const sunday = getFirstSundayOfMonth(2026, 5);
    expect(sunday.getDate()).toBe(3);
    expect(getDay(sunday)).toBe(0);
  });

  it('2026 birželis: pirmas sekmadienis = birželio 7 d.', () => {
    const sunday = getFirstSundayOfMonth(2026, 6);
    expect(sunday.getDate()).toBe(7);
    expect(getDay(sunday)).toBe(0);
  });

  it('kai mėnuo prasideda sekmadieniu', () => {
    // 2026 vasaris prasideda sekmadieniu
    const sunday = getFirstSundayOfMonth(2026, 2);
    expect(sunday.getDate()).toBe(1);
    expect(getDay(sunday)).toBe(0);
  });
});

// ============================================================================
// getWorkDaysInMonth – KRITINIAI TESTAI
// ============================================================================

describe('getWorkDaysInMonth', () => {
  it('2026 sausis: 22 Pr-Pn - 1 šventė (sausio 1 Kt) = 21 darbo dienų', () => {
    expect(getWorkDaysInMonth(2026, 1)).toBe(21);
  });

  it('2026 vasaris: 20 Pr-Pn - 1 šventė (vasario 16 Pr) = 19 darbo dienų', () => {
    expect(getWorkDaysInMonth(2026, 2)).toBe(19);
  });

  it('2026 kovas: 22 Pr-Pn - 1 šventė (kovo 11 Tr) = 21 darbo diena', () => {
    expect(getWorkDaysInMonth(2026, 3)).toBe(21);
  });

  it('2028 vasaris (keliamieji metai, 29 dienos)', () => {
    const workDays = getWorkDaysInMonth(2028, 2);
    // 2028 vasaris: prasideda antradienį, 29 dienos
    // Pr-Pn: 21 diena
    // Šventė: vasario 16 (trečiadienis) → -1
    expect(workDays).toBe(20);
  });

  it('šventė sekmadienį nemažina darbo dienų', () => {
    // 2026 gegužės 3 (Motinos diena) = sekmadienis → jau ne darbo diena
    // Gegužės 1 (Tarptautinė darbo diena) = penktadienis → -1
    // Gegužėje: 21 Pr-Pn - 1 šventė (geg 1 Pn) = 20
    const workDays = getWorkDaysInMonth(2026, 5);
    expect(workDays).toBe(20);
  });

  it('2026 balandis: Velykų pirmadienis (balandžio 6)', () => {
    // 2026 balandis: 22 Pr-Pn - 1 šventė (balandžio 6, Velykų Pr) = 21
    // Velykų sekmadienis (bal 5) = sekmadienis, nemažina
    expect(getWorkDaysInMonth(2026, 4)).toBe(21);
  });

  it('2026 gruodis: 3 šventės darbo dienomis (24 Kt, 25 Pn, 26 Šš→ne)', () => {
    // 2026 gruodis: prasideda antradienį
    // 23 Pr-Pn dienos
    // Šventės: gruodžio 24 (ketvirtadienis), 25 (penktadienis), 26 (šeštadienis – ne darbo d.)
    // 23 - 2 = 21
    expect(getWorkDaysInMonth(2026, 12)).toBe(21);
  });
});

// ============================================================================
// getPreHolidayReductionHours
// ============================================================================

describe('getPreHolidayReductionHours', () => {
  it('2026 sausis: jokių prieššventinių (sausio 1 = ketvirtadienis, bet gruodžio 31 priklauso gruodžiui)', () => {
    expect(getPreHolidayReductionHours(2026, 1)).toBe(0);
  });

  it('2026 vasaris: vasario 15 = sekmadienis → nėra prieššventinės', () => {
    expect(getPreHolidayReductionHours(2026, 2)).toBe(0);
  });

  it('2026 kovas: kovo 10 = antradienis prieš kovo 11 → 1 prieššventinė', () => {
    expect(getPreHolidayReductionHours(2026, 3)).toBe(1);
  });

  it('2026 balandis: balandžio 5 = Velykos (sekmadienis), bal 3 = penktadienis → prieššventinė (prieš bal 6 Velykų Pr)', () => {
    // Velykų sekmadienis (bal 5): prieš jį bal 4 = šeštadienis → ne prieššventinė
    // Velykų pirmadienis (bal 6): prieš jį bal 5 = sekmadienis (ir šventė) → ne
    // Bet bal 3 penktadienis? Prieš jį yra bal 4 (šeštadienis), ne šventė.
    // Iš tikrųjų balandžio 3 penktadienis → kita diena balandžio 4 (šeštadienis) → ne šventė.
    // Velykos balandžio 5 → prieš jas balandžio 4 (šeštadienis) → ne darbo diena → ne prieššventinė
    // Velykų pirmadienis balandžio 6 → prieš jį balandžio 5 (Velykos, šventė pati) → ne prieššventinė
    // Balandžio 30 (ketvirtadienis) → kita diena gegužės 1 (šventė) → prieššventinė!
    // Todėl balandyje yra 1 prieššventinė diena
    expect(getPreHolidayReductionHours(2026, 4)).toBe(1);
  });

  it('2025 gruodis: gruodžio 23 (antradienis) prieš gruodžio 24 (Kūčios) → +1, gruodžio 31 prieš sausio 1 → +1', () => {
    // 2025-12-23 = antradienis, prieš gruodžio 24 (trečiadienis, Kūčios) → prieššventinė
    // 2025-12-31 = trečiadienis, prieš 2026-01-01 (ketvirtadienis, Naujieji) → prieššventinė
    // 2025-12-24 = Kūčios (šventė) – ne prieššventinė, nors prieš gruodžio 25
    expect(getPreHolidayReductionHours(2025, 12)).toBe(2);
  });
});

// ============================================================================
// Formatavimo funkcijos
// ============================================================================

describe('formatDateLT', () => {
  it('formatuoja datą', () => {
    expect(formatDateLT(new Date(2026, 0, 15))).toBe('2026-01-15');
  });

  it('su vienaženkliu mėnesiu/diena', () => {
    expect(formatDateLT(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('formatTimeLT', () => {
  it('480 min → "8,00"', () => {
    expect(formatTimeLT(480)).toBe('8,00');
  });

  it('470 min → "7,83"', () => {
    expect(formatTimeLT(470)).toBe('7,83');
  });

  it('0 → "0,00"', () => {
    expect(formatTimeLT(0)).toBe('0,00');
  });
});

describe('parseDate', () => {
  it('parsina "2026-01-15"', () => {
    const d = parseDate('2026-01-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });
});

// ============================================================================
// Pagalbinės
// ============================================================================

describe('getMonthDays', () => {
  it('2026 sausis turi 31 dieną', () => {
    expect(getMonthDays(2026, 1)).toHaveLength(31);
  });

  it('2026 vasaris turi 28 dienas', () => {
    expect(getMonthDays(2026, 2)).toHaveLength(28);
  });

  it('2028 vasaris turi 29 dienas (keliamieji)', () => {
    expect(getMonthDays(2028, 2)).toHaveLength(29);
  });
});

describe('getDaysInMonthCount', () => {
  it('sausis = 31', () => {
    expect(getDaysInMonthCount(2026, 1)).toBe(31);
  });

  it('vasaris 2026 = 28', () => {
    expect(getDaysInMonthCount(2026, 2)).toBe(28);
  });

  it('vasaris 2028 = 29', () => {
    expect(getDaysInMonthCount(2028, 2)).toBe(29);
  });
});
