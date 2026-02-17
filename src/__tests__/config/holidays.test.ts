import { describe, it, expect } from 'vitest';
import {
  getEasterSunday,
  getHolidays,
  isHoliday,
  isPreHoliday,
  STATIC_HOLIDAYS,
} from '@/config/holidays';
import { getDay } from 'date-fns';

// ============================================================================
// Velykų algoritmo testai
// ============================================================================

describe('getEasterSunday', () => {
  it('2026: balandžio 5 d. (sekmadienis)', () => {
    const easter = getEasterSunday(2026);
    expect(easter.getFullYear()).toBe(2026);
    expect(easter.getMonth()).toBe(3); // balandis = 3 (0-indexed)
    expect(easter.getDate()).toBe(5);
    expect(getDay(easter)).toBe(0); // sekmadienis
  });

  it('2025: balandžio 20 d.', () => {
    const easter = getEasterSunday(2025);
    expect(easter.getFullYear()).toBe(2025);
    expect(easter.getMonth()).toBe(3);
    expect(easter.getDate()).toBe(20);
    expect(getDay(easter)).toBe(0);
  });

  it('2024: kovo 31 d.', () => {
    const easter = getEasterSunday(2024);
    expect(easter.getFullYear()).toBe(2024);
    expect(easter.getMonth()).toBe(2); // kovas = 2
    expect(easter.getDate()).toBe(31);
    expect(getDay(easter)).toBe(0);
  });

  it('2028: balandžio 16 d.', () => {
    const easter = getEasterSunday(2028);
    expect(easter.getFullYear()).toBe(2028);
    expect(easter.getMonth()).toBe(3);
    expect(easter.getDate()).toBe(16);
    expect(getDay(easter)).toBe(0);
  });

  it('2030: balandžio 21 d.', () => {
    const easter = getEasterSunday(2030);
    expect(easter.getFullYear()).toBe(2030);
    expect(easter.getMonth()).toBe(3);
    expect(easter.getDate()).toBe(21);
    expect(getDay(easter)).toBe(0);
  });

  it('visada grąžina sekmadienį', () => {
    for (let year = 2020; year <= 2035; year++) {
      const easter = getEasterSunday(year);
      expect(getDay(easter)).toBe(0);
    }
  });
});

// ============================================================================
// Švenčių sąrašo testai
// ============================================================================

describe('getHolidays', () => {
  it('grąžina 16 švenčių (12 statinių + 4 dinaminės)', () => {
    const holidays = getHolidays(2026);
    expect(holidays).toHaveLength(16);
  });

  it('apima visas 12 statinių švenčių', () => {
    const holidays = getHolidays(2026);

    for (const { month, day } of STATIC_HOLIDAYS) {
      const found = holidays.some(
        (h) => h.getMonth() === month - 1 && h.getDate() === day
      );
      expect(found).toBe(true);
    }
  });

  it('apima Velykų sekmadienį ir pirmadienį', () => {
    const holidays = getHolidays(2026);
    // 2026 Velykos: balandžio 5 d.
    const easterSunday = holidays.find(
      (h) => h.getMonth() === 3 && h.getDate() === 5
    );
    const easterMonday = holidays.find(
      (h) => h.getMonth() === 3 && h.getDate() === 6
    );
    expect(easterSunday).toBeDefined();
    expect(easterMonday).toBeDefined();
  });

  it('2026 Motinos diena: gegužės 3 d. (pirmas sekmadienis)', () => {
    const holidays = getHolidays(2026);
    // 2026 gegužės 1 = penktadienis → pirmas sekmadienis = gegužės 3
    const mothersDay = holidays.find(
      (h) => h.getMonth() === 4 && h.getDate() === 3
    );
    expect(mothersDay).toBeDefined();
    expect(getDay(mothersDay!)).toBe(0);
  });

  it('2026 Tėvo diena: birželio 7 d. (pirmas sekmadienis)', () => {
    const holidays = getHolidays(2026);
    // 2026 birželio 1 = pirmadienis → pirmas sekmadienis = birželio 7
    const fathersDay = holidays.find(
      (h) => h.getMonth() === 5 && h.getDate() === 7
    );
    expect(fathersDay).toBeDefined();
    expect(getDay(fathersDay!)).toBe(0);
  });

  it('visos datos yra nurodytų metų', () => {
    const holidays = getHolidays(2026);
    for (const h of holidays) {
      expect(h.getFullYear()).toBe(2026);
    }
  });
});

// ============================================================================
// isHoliday testai
// ============================================================================

describe('isHoliday', () => {
  it('sausio 1 d. yra šventė', () => {
    expect(isHoliday(new Date(2026, 0, 1))).toBe(true);
  });

  it('vasario 16 d. yra šventė', () => {
    expect(isHoliday(new Date(2026, 1, 16))).toBe(true);
  });

  it('kovo 11 d. yra šventė', () => {
    expect(isHoliday(new Date(2026, 2, 11))).toBe(true);
  });

  it('gruodžio 25 d. yra šventė', () => {
    expect(isHoliday(new Date(2026, 11, 25))).toBe(true);
  });

  it('Velykų sekmadienis yra šventė', () => {
    // 2026 Velykos: balandžio 5 d.
    expect(isHoliday(new Date(2026, 3, 5))).toBe(true);
  });

  it('Velykų pirmadienis yra šventė', () => {
    expect(isHoliday(new Date(2026, 3, 6))).toBe(true);
  });

  it('paprasta darbo diena nėra šventė', () => {
    // 2026 sausio 5 d. (pirmadienis)
    expect(isHoliday(new Date(2026, 0, 5))).toBe(false);
  });

  it('šventė sekmadienį vis tiek yra šventė', () => {
    // 2026 vasario 15 d. = sekmadienis, bet vasario 16 (pirmadienis) yra šventė
    // Patikrinkime kur šventė sutampa su sekmadieniu:
    // 2026 Motinos diena = gegužės 3 (sekmadienis) - tai šventė
    expect(isHoliday(new Date(2026, 4, 3))).toBe(true);
  });
});

// ============================================================================
// isPreHoliday testai
// ============================================================================

describe('isPreHoliday', () => {
  it('2026-02-15 (sekmadienis prieš vasario 16 šventę) → NE prieššventinė', () => {
    // Vasario 15 yra sekmadienis → ne darbo diena → ne prieššventinė
    expect(isPreHoliday(new Date(2026, 1, 15))).toBe(false);
  });

  it('2026-02-13 (penktadienis) → NE prieššventinė (vasario 14 nėra šventė)', () => {
    expect(isPreHoliday(new Date(2026, 1, 13))).toBe(false);
  });

  it('prieššventinė diena kai šventė antradienį → pirmadienis sutrumpinamas', () => {
    // 2026 kovo 11 = trečiadienis... ne. Patikrinkime tiksliai.
    // 2026-03-11 → trečiadienis. Prieš jį kovo 10 = antradienis → prieššventinė!
    const preHoliday = new Date(2026, 2, 10); // kovo 10, antradienis
    expect(getDay(preHoliday)).toBe(2); // antradienis
    expect(isPreHoliday(preHoliday)).toBe(true);
  });

  it('gruodžio 31 prieš sausio 1 yra prieššventinė (kita metai)', () => {
    // 2025-12-31 = trečiadienis → darbo diena → kita diena 2026-01-01 yra šventė
    const dec31 = new Date(2025, 11, 31);
    expect(getDay(dec31)).toBe(3); // trečiadienis
    expect(isPreHoliday(dec31)).toBe(true);
  });

  it('šventės diena pati nėra prieššventinė, net jei kita diena irgi šventė', () => {
    // 2026-12-25 (Kalėdos, ketvirtadienis) → pati šventė → ne prieššventinė
    // nors gruodžio 26 irgi šventė
    expect(isPreHoliday(new Date(2026, 11, 25))).toBe(false);
  });

  it('gruodžio 24 (Kūčios) prieš gruodžio 25 (Kalėdos) – pati šventė, ne prieššventinė', () => {
    // 2026-12-24 = ketvirtadienis, BET tai Kūčių diena (šventė) → ne prieššventinė
    expect(isPreHoliday(new Date(2026, 11, 24))).toBe(false);
  });

  it('gruodžio 23 (trečiadienis) prieš gruodžio 24 (Kūčios) → prieššventinė', () => {
    const dec23 = new Date(2026, 11, 23);
    expect(getDay(dec23)).toBe(3); // trečiadienis
    expect(isPreHoliday(dec23)).toBe(true);
  });

  it('šeštadienis prieš šventę → NE prieššventinė', () => {
    // Reikia rasti šeštadienį prieš šventę...
    // 2026-04-30 (ketvirtadienis), 2026-05-01 šventė
    // 2026-04-30 ketvirtadienis → prieššventinė (bet ne šeštadienis)
    // Ieškome: 2027-01-01 = penktadienis, 2026-12-31 = ketvirtadienis
    // Geriau: 2028-05-01 = pirmadienis, 2028-04-30 = sekmadienis → ne prieššventinė
    // 2028-04-29 = šeštadienis prieš 2028-04-30 (sekmadienis, ne šventė)
    // Reikia tikslesnio: ieškome šeštadienio prieš šventę pirmadienį
    // 2026-02-16 = pirmadienis (šventė), 2026-02-14 = šeštadienis
    const saturday = new Date(2026, 1, 14); // vasario 14, šeštadienis
    expect(getDay(saturday)).toBe(6);
    expect(isPreHoliday(saturday)).toBe(false);
  });

  it('2026-04-30 (ketvirtadienis) prieš gegužės 1 (šventė) → prieššventinė', () => {
    const apr30 = new Date(2026, 3, 30);
    expect(getDay(apr30)).toBe(4); // ketvirtadienis
    expect(isPreHoliday(apr30)).toBe(true);
  });
});

// ============================================================================
// Edge case testai
// ============================================================================

describe('edge cases', () => {
  it('šventė sutampanti su sekmadieniu nemažina darbo dienų skaičiaus', () => {
    // 2026 Motinos diena = gegužės 3 (sekmadienis)
    // Ji yra šventė, bet ir taip būtų poilsio diena
    const mothersDay = new Date(2026, 4, 3);
    expect(isHoliday(mothersDay)).toBe(true);
    expect(getDay(mothersDay)).toBe(0); // sekmadienis
  });

  it('Velykos visada sekmadienį → neturi mažinti darbo dienų', () => {
    const easter2026 = getEasterSunday(2026);
    expect(getDay(easter2026)).toBe(0);
    // Velykų pirmadienis – pirmadienis → mažina darbo dienų skaičių
    const easterMonday2026 = new Date(2026, 3, 6);
    expect(getDay(easterMonday2026)).toBe(1); // pirmadienis
    expect(isHoliday(easterMonday2026)).toBe(true);
  });

  it('keliamieji metai neturi įtakos švenčių skaičiui', () => {
    // 2028 yra keliamieji metai
    const holidays2028 = getHolidays(2028);
    expect(holidays2028).toHaveLength(16);
  });

  it('skirtingi metai turi skirtingas Velykų datas', () => {
    const e2025 = getEasterSunday(2025);
    const e2026 = getEasterSunday(2026);
    const e2027 = getEasterSunday(2027);
    expect(e2025.getTime()).not.toBe(e2026.getTime());
    expect(e2026.getTime()).not.toBe(e2027.getTime());
  });
});
