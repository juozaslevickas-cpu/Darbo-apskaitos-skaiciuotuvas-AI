import { describe, it, expect } from 'vitest';
import {
  calculateShiftDuration,
  calculateRestBetweenShifts,
  calculateRestBetweenEntries,
} from '@/services/shift-calculator';
import type { ScheduleEntry } from '@/models/schedule-entry';
import { v4 as uuidv4 } from 'uuid';

function makeEntry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return {
    id: uuidv4(),
    darbuotojoId: uuidv4(),
    data: '2026-01-05',
    tipas: 'DARBAS',
    pamainosPradzia: '08:00',
    pamainosPabaiga: '20:00',
    pietuPertraukaMin: 60,
    neatvykimoKodas: null,
    pastaba: null,
    ...overrides,
  };
}

// ============================================================================
// calculateShiftDuration
// ============================================================================

describe('calculateShiftDuration', () => {
  it('paprasta pamaina 08:00-20:00, 60 min pietūs → 660 min (11h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '08:00',
      pamainosPabaiga: '20:00',
      pietuPertraukaMin: 60,
    });
    expect(calculateShiftDuration(entry)).toBe(660);
  });

  it('vidurnaktį kertanti 22:00-06:00, 30 min pertrauka → 450 min (7.5h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '22:00',
      pamainosPabaiga: '06:00',
      pietuPertraukaMin: 30,
    });
    expect(calculateShiftDuration(entry)).toBe(450);
  });

  it('be pietų pertraukos → pilna trukmė', () => {
    const entry = makeEntry({
      pamainosPradzia: '08:00',
      pamainosPabaiga: '16:00',
      pietuPertraukaMin: 0,
    });
    expect(calculateShiftDuration(entry)).toBe(480); // 8h
  });

  it('tipas != DARBAS → 0', () => {
    const entry = makeEntry({ tipas: 'POILSIS' });
    expect(calculateShiftDuration(entry)).toBe(0);
  });

  it('tipas SVENTE → 0', () => {
    const entry = makeEntry({ tipas: 'SVENTE' });
    expect(calculateShiftDuration(entry)).toBe(0);
  });

  it('neatvykimo kodas A (atostogos) → 0', () => {
    const entry = makeEntry({ tipas: 'A' });
    expect(calculateShiftDuration(entry)).toBe(0);
  });

  it('be pradžios/pabaigos → 0', () => {
    const entry = makeEntry({
      pamainosPradzia: null,
      pamainosPabaiga: null,
    });
    expect(calculateShiftDuration(entry)).toBe(0);
  });

  it('06:00-19:00, 60 min pietūs → 720 min (12h) – ALERT_1 riba', () => {
    const entry = makeEntry({
      pamainosPradzia: '06:00',
      pamainosPabaiga: '19:00',
      pietuPertraukaMin: 60,
    });
    expect(calculateShiftDuration(entry)).toBe(720); // 13h - 1h = 12h
  });

  it('06:00-19:00 be pietų → 780 min (13h) – virš ALERT_1', () => {
    const entry = makeEntry({
      pamainosPradzia: '06:00',
      pamainosPabaiga: '19:00',
      pietuPertraukaMin: 0,
    });
    expect(calculateShiftDuration(entry)).toBe(780); // 13h
  });
});

// ============================================================================
// calculateRestBetweenShifts
// ============================================================================

describe('calculateRestBetweenShifts', () => {
  it('pamaina baigiasi 20:00, kita prasideda 08:00 kitą dieną → 12h (720 min)', () => {
    expect(
      calculateRestBetweenShifts('20:00', '2026-01-05', '08:00', '2026-01-06')
    ).toBe(720);
  });

  it('pamaina baigiasi 23:00, kita prasideda 08:00 kitą dieną → 9h (540 min)', () => {
    expect(
      calculateRestBetweenShifts('23:00', '2026-01-05', '08:00', '2026-01-06')
    ).toBe(540);
  });

  it('pamaina baigiasi 18:00, kita prasideda 06:00 kitą dieną → 12h (720 min)', () => {
    expect(
      calculateRestBetweenShifts('18:00', '2026-01-05', '06:00', '2026-01-06')
    ).toBe(720);
  });

  it('tos pačios dienos dvi pamainos: 08:00-12:00 ir 14:00 → 2h (120 min)', () => {
    expect(
      calculateRestBetweenShifts('12:00', '2026-01-05', '14:00', '2026-01-05')
    ).toBe(120);
  });
});

// ============================================================================
// calculateRestBetweenEntries
// ============================================================================

describe('calculateRestBetweenEntries', () => {
  it('grąžina poilsio trukmę tarp dviejų darbo įrašų', () => {
    const prev = makeEntry({
      data: '2026-01-05',
      pamainosPradzia: '08:00',
      pamainosPabaiga: '20:00',
    });
    const curr = makeEntry({
      data: '2026-01-06',
      pamainosPradzia: '08:00',
      pamainosPabaiga: '20:00',
    });

    expect(calculateRestBetweenEntries(prev, curr)).toBe(720); // 12h
  });

  it('naktinė pamaina su vidurnakčio kirtimu', () => {
    const prev = makeEntry({
      data: '2026-01-05',
      pamainosPradzia: '20:00',
      pamainosPabaiga: '08:00',
    });
    const curr = makeEntry({
      data: '2026-01-06',
      pamainosPradzia: '20:00',
      pamainosPabaiga: '08:00',
    });

    // Ankstesnė pamaina baigiasi 2026-01-06 08:00
    // Kita prasideda 2026-01-06 20:00
    // Poilsis = 12h (720 min)
    expect(calculateRestBetweenEntries(prev, curr)).toBe(720);
  });

  it('grąžina null jei ankstesnė nėra DARBAS', () => {
    const prev = makeEntry({ tipas: 'POILSIS' });
    const curr = makeEntry({ data: '2026-01-06' });
    expect(calculateRestBetweenEntries(prev, curr)).toBeNull();
  });

  it('grąžina null jei dabartinė nėra DARBAS', () => {
    const prev = makeEntry({ data: '2026-01-05' });
    const curr = makeEntry({ tipas: 'A', data: '2026-01-06' });
    expect(calculateRestBetweenEntries(prev, curr)).toBeNull();
  });
});
