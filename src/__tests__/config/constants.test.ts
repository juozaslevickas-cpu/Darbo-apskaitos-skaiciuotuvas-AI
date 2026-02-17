import { describe, it, expect } from 'vitest';
import { DK_LIMITS } from '@/config/constants';

describe('DK_LIMITS', () => {
  it('turi visas reikalingas konstantas', () => {
    expect(DK_LIMITS.MAX_HOURS_PER_SHIFT).toBeDefined();
    expect(DK_LIMITS.MAX_AVG_HOURS_PER_7_DAYS).toBeDefined();
    expect(DK_LIMITS.MAX_HOURS_WITH_ADDITIONAL_7_DAYS).toBeDefined();
    expect(DK_LIMITS.MAX_CONSECUTIVE_WORK_DAYS).toBeDefined();
    expect(DK_LIMITS.MIN_REST_BETWEEN_SHIFTS_HOURS).toBeDefined();
    expect(DK_LIMITS.MIN_WEEKLY_REST_HOURS).toBeDefined();
    expect(DK_LIMITS.MIN_LUNCH_BREAK_MINUTES).toBeDefined();
    expect(DK_LIMITS.MAX_LUNCH_BREAK_MINUTES).toBeDefined();
    expect(DK_LIMITS.MAX_WORK_BEFORE_LUNCH_HOURS).toBeDefined();
    expect(DK_LIMITS.NIGHT_START_HOUR).toBeDefined();
    expect(DK_LIMITS.NIGHT_END_HOUR).toBeDefined();
    expect(DK_LIMITS.MAX_NIGHT_AVG_HOURS_PER_DAY).toBeDefined();
    expect(DK_LIMITS.MAX_OVERTIME_PER_7_DAYS).toBeDefined();
    expect(DK_LIMITS.MAX_OVERTIME_WITH_CONSENT_7_DAYS).toBeDefined();
    expect(DK_LIMITS.MAX_OVERTIME_PER_YEAR).toBeDefined();
    expect(DK_LIMITS.PRE_HOLIDAY_REDUCTION_HOURS).toBeDefined();
    expect(DK_LIMITS.DEFAULT_WEEKLY_NORM).toBeDefined();
    expect(DK_LIMITS.DEFAULT_LUNCH_BREAK_MINUTES).toBeDefined();
  });

  describe('DK 114 str. – darbo laiko ribos', () => {
    it('max pamaina = 12h (DK 114 str. 2 d.)', () => {
      expect(DK_LIMITS.MAX_HOURS_PER_SHIFT).toBe(12);
    });

    it('max vidutinis per 7d = 48h (DK 114 str. 1 d.)', () => {
      expect(DK_LIMITS.MAX_AVG_HOURS_PER_7_DAYS).toBe(48);
    });

    it('max su papildomu darbu per 7d = 60h (DK 114 str. 2 d.)', () => {
      expect(DK_LIMITS.MAX_HOURS_WITH_ADDITIONAL_7_DAYS).toBe(60);
    });

    it('max darbo dienų iš eilės = 6 (DK 114 str. 4 d.)', () => {
      expect(DK_LIMITS.MAX_CONSECUTIVE_WORK_DAYS).toBe(6);
    });
  });

  describe('DK 122 str. – poilsio ribos', () => {
    it('min poilsis tarp pamainų = 11h', () => {
      expect(DK_LIMITS.MIN_REST_BETWEEN_SHIFTS_HOURS).toBe(11);
    });

    it('min savaitinis poilsis = 35h', () => {
      expect(DK_LIMITS.MIN_WEEKLY_REST_HOURS).toBe(35);
    });

    it('pietų pertrauka: min 30 min, max 120 min', () => {
      expect(DK_LIMITS.MIN_LUNCH_BREAK_MINUTES).toBe(30);
      expect(DK_LIMITS.MAX_LUNCH_BREAK_MINUTES).toBe(120);
    });

    it('max darbas iki pietų = 5h', () => {
      expect(DK_LIMITS.MAX_WORK_BEFORE_LUNCH_HOURS).toBe(5);
    });
  });

  describe('DK 117 str. – nakties darbas', () => {
    it('nakties laikas 22:00–06:00', () => {
      expect(DK_LIMITS.NIGHT_START_HOUR).toBe(22);
      expect(DK_LIMITS.NIGHT_END_HOUR).toBe(6);
    });

    it('max nakties vidurkis = 8h/d per 3 mėn.', () => {
      expect(DK_LIMITS.MAX_NIGHT_AVG_HOURS_PER_DAY).toBe(8);
    });
  });

  describe('DK 119 str. – viršvalandžiai', () => {
    it('max viršvalandžiai per 7d = 8h', () => {
      expect(DK_LIMITS.MAX_OVERTIME_PER_7_DAYS).toBe(8);
    });

    it('max viršvalandžiai per 7d su sutikimu = 12h', () => {
      expect(DK_LIMITS.MAX_OVERTIME_WITH_CONSENT_7_DAYS).toBe(12);
    });

    it('max viršvalandžiai per metus = 180h', () => {
      expect(DK_LIMITS.MAX_OVERTIME_PER_YEAR).toBe(180);
    });
  });

  describe('kitos konstantos', () => {
    it('prieššventinės sutrumpinimas = 1h', () => {
      expect(DK_LIMITS.PRE_HOLIDAY_REDUCTION_HOURS).toBe(1);
    });

    it('standartinė savaitinė norma = 40h', () => {
      expect(DK_LIMITS.DEFAULT_WEEKLY_NORM).toBe(40);
    });

    it('numatytoji pietų pertrauka = 60 min', () => {
      expect(DK_LIMITS.DEFAULT_LUNCH_BREAK_MINUTES).toBe(60);
    });
  });

  it('yra readonly (as const)', () => {
    // TypeScript compile-time check; at runtime, verify the values are numbers
    const keys = Object.keys(DK_LIMITS);
    expect(keys.length).toBe(18);
    for (const key of keys) {
      expect(typeof DK_LIMITS[key as keyof typeof DK_LIMITS]).toBe('number');
    }
  });
});
