import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  shiftDurationMinutes,
  overlapMinutes,
  nightMinutes,
} from '@/utils/time-overlap';

// ============================================================================
// timeToMinutes
// ============================================================================

describe('timeToMinutes', () => {
  it('konvertuoja 08:00 → 480', () => {
    expect(timeToMinutes('08:00')).toBe(480);
  });

  it('konvertuoja 22:30 → 1350', () => {
    expect(timeToMinutes('22:30')).toBe(1350);
  });

  it('konvertuoja 00:00 → 0', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('konvertuoja 23:59 → 1439', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('konvertuoja 06:00 → 360', () => {
    expect(timeToMinutes('06:00')).toBe(360);
  });

  it('konvertuoja 12:30 → 750', () => {
    expect(timeToMinutes('12:30')).toBe(750);
  });
});

// ============================================================================
// minutesToTime
// ============================================================================

describe('minutesToTime', () => {
  it('konvertuoja 480 → "08:00"', () => {
    expect(minutesToTime(480)).toBe('08:00');
  });

  it('konvertuoja 0 → "00:00"', () => {
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('konvertuoja 1350 → "22:30"', () => {
    expect(minutesToTime(1350)).toBe('22:30');
  });

  it('konvertuoja 1440 → "00:00" (vidurnaktis)', () => {
    expect(minutesToTime(1440)).toBe('00:00');
  });
});

// ============================================================================
// shiftDurationMinutes
// ============================================================================

describe('shiftDurationMinutes', () => {
  it('paprasta dieninė pamaina 08:00-20:00 → 720 min (12h)', () => {
    expect(shiftDurationMinutes('08:00', '20:00')).toBe(720);
  });

  it('naktinė pamaina 22:00-06:00 → 480 min (8h)', () => {
    expect(shiftDurationMinutes('22:00', '06:00')).toBe(480);
  });

  it('mišri pamaina 18:00-06:00 → 720 min (12h)', () => {
    expect(shiftDurationMinutes('18:00', '06:00')).toBe(720);
  });

  it('mišri pamaina 20:00-08:00 → 720 min (12h)', () => {
    expect(shiftDurationMinutes('20:00', '08:00')).toBe(720);
  });

  it('trumpa pamaina 08:00-12:00 → 240 min (4h)', () => {
    expect(shiftDurationMinutes('08:00', '12:00')).toBe(240);
  });

  it('pamaina 06:00-18:00 → 720 min (12h)', () => {
    expect(shiftDurationMinutes('06:00', '18:00')).toBe(720);
  });

  it('pamaina 23:00-03:00 → 240 min (4h)', () => {
    expect(shiftDurationMinutes('23:00', '03:00')).toBe(240);
  });
});

// ============================================================================
// overlapMinutes
// ============================================================================

describe('overlapMinutes', () => {
  it('pilnas persidengimas', () => {
    expect(overlapMinutes(100, 200, 100, 200)).toBe(100);
  });

  it('dalinis persidengimas', () => {
    expect(overlapMinutes(100, 200, 150, 250)).toBe(50);
  });

  it('jokio persidengimo', () => {
    expect(overlapMinutes(100, 200, 300, 400)).toBe(0);
  });

  it('vienas intervalas viduje kito', () => {
    expect(overlapMinutes(100, 400, 200, 300)).toBe(100);
  });

  it('gretimai (liečia bet nesikerta)', () => {
    expect(overlapMinutes(100, 200, 200, 300)).toBe(0);
  });
});

// ============================================================================
// nightMinutes – KRITINIAI TESTAI
// ============================================================================

describe('nightMinutes', () => {
  it('dieninė pamaina 08:00-20:00 → 0 nakties val.', () => {
    expect(nightMinutes('08:00', '20:00')).toBe(0);
  });

  it('naktinė pamaina 22:00-06:00 → 480 min (8h)', () => {
    expect(nightMinutes('22:00', '06:00')).toBe(480);
  });

  it('mišri pamaina 18:00-06:00 → 480 min (8h)', () => {
    expect(nightMinutes('18:00', '06:00')).toBe(480);
  });

  it('mišri pamaina 20:00-08:00 → 480 min (8h)', () => {
    expect(nightMinutes('20:00', '08:00')).toBe(480);
  });

  it('vakarinė pamaina 14:00-23:00 → 60 min (1h)', () => {
    expect(nightMinutes('14:00', '23:00')).toBe(60);
  });

  it('trumpa naktinė 23:00-03:00 → 240 min (4h)', () => {
    expect(nightMinutes('23:00', '03:00')).toBe(240);
  });

  it('pamaina baigiasi tiksliai 22:00 → 0 nakties (pusatviras intervalas)', () => {
    // [14:00, 22:00) – 22:00 nėra dirbama
    expect(nightMinutes('14:00', '22:00')).toBe(0);
  });

  it('pamaina 21:00-23:00 → 60 min (tik 22:00-23:00)', () => {
    expect(nightMinutes('21:00', '23:00')).toBe(60);
  });

  it('pilna naktis 22:00-06:00 → 480 min', () => {
    expect(nightMinutes('22:00', '06:00')).toBe(480);
  });

  it('ankstyvo ryto pamaina 04:00-08:00 → 120 min (04:00-06:00)', () => {
    expect(nightMinutes('04:00', '08:00')).toBe(120);
  });

  it('ryto pamaina 06:00-14:00 → 0 min', () => {
    expect(nightMinutes('06:00', '14:00')).toBe(0);
  });

  it('00:00-00:00 (pradžia === pabaiga) → 0 min (nėra pamainos)', () => {
    // Kai pradžia ir pabaiga sutampa, pamainos trukmė = 0, todėl nakties val. = 0.
    // Tai apsaugo nuo klaidingo 24h skaičiavimo, kai vartotojas nurodo vienodą laiką.
    const result = nightMinutes('00:00', '00:00');
    expect(result).toBe(0);
  });
});
