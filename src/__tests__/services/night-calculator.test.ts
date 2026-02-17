import { describe, it, expect } from 'vitest';
import {
  calculateNightMinutes,
  isNightWorker,
  calculateAverageNightHoursPerDay,
} from '@/services/night-calculator';
import type { ScheduleEntry } from '@/models/schedule-entry';
import { v4 as uuidv4 } from 'uuid';

const empId = uuidv4();

function makeEntry(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return {
    id: uuidv4(),
    darbuotojoId: empId,
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
// calculateNightMinutes – KRITINIAI TESTAI (iš plano §6)
// ============================================================================

describe('calculateNightMinutes', () => {
  it('dieninė pamaina 08:00-20:00 → 0 nakties val.', () => {
    const entry = makeEntry({
      pamainosPradzia: '08:00',
      pamainosPabaiga: '20:00',
    });
    expect(calculateNightMinutes(entry)).toBe(0);
  });

  it('naktinė pamaina 22:00-06:00 → 480 min (8h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '22:00',
      pamainosPabaiga: '06:00',
    });
    expect(calculateNightMinutes(entry)).toBe(480);
  });

  it('mišri pamaina 18:00-06:00 → 480 min (8h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '18:00',
      pamainosPabaiga: '06:00',
    });
    expect(calculateNightMinutes(entry)).toBe(480);
  });

  it('mišri pamaina 20:00-08:00 → 480 min (8h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '20:00',
      pamainosPabaiga: '08:00',
    });
    expect(calculateNightMinutes(entry)).toBe(480);
  });

  it('vakarinė pamaina 14:00-23:00 → 60 min (1h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '14:00',
      pamainosPabaiga: '23:00',
    });
    expect(calculateNightMinutes(entry)).toBe(60);
  });

  it('trumpa naktinė 23:00-03:00 → 240 min (4h)', () => {
    const entry = makeEntry({
      pamainosPradzia: '23:00',
      pamainosPabaiga: '03:00',
    });
    expect(calculateNightMinutes(entry)).toBe(240);
  });

  it('tipas != DARBAS → 0', () => {
    const entry = makeEntry({ tipas: 'POILSIS' });
    expect(calculateNightMinutes(entry)).toBe(0);
  });

  it('be pradžios/pabaigos → 0', () => {
    const entry = makeEntry({
      pamainosPradzia: null,
      pamainosPabaiga: null,
    });
    expect(calculateNightMinutes(entry)).toBe(0);
  });

  it('pamaina 14:00-22:00 → 0 nakties (pabaiga = ribos pradžia, pusatviras)', () => {
    const entry = makeEntry({
      pamainosPradzia: '14:00',
      pamainosPabaiga: '22:00',
    });
    expect(calculateNightMinutes(entry)).toBe(0);
  });
});

// ============================================================================
// isNightWorker
// ============================================================================

describe('isNightWorker', () => {
  const period = {
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 31),
  };

  it('darbuotojas su dauguma naktinių pamainų = nakties darbuotojas', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry({
        data: `2026-01-${String(i + 5).padStart(2, '0')}`,
        pamainosPradzia: '22:00',
        pamainosPabaiga: '06:00',
      })
    );
    expect(isNightWorker(entries, period)).toBe(true);
  });

  it('darbuotojas su dieninėmis pamainomis != nakties darbuotojas', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry({
        data: `2026-01-${String(i + 5).padStart(2, '0')}`,
        pamainosPradzia: '08:00',
        pamainosPabaiga: '16:00',
      })
    );
    expect(isNightWorker(entries, period)).toBe(false);
  });

  it('tuščias įrašų masyvas → false', () => {
    expect(isNightWorker([], period)).toBe(false);
  });

  it('daugiau nei 25% nakties darbo → nakties darbuotojas', () => {
    // 8 dieninės + 4 naktinės = 12 pamainų
    // Naktinės: 4 × 8h = 32h nakties
    // Dieninės: 8 × 11h = 88h dienos
    // Iš viso: ~120h, nakties ~32h = 26.7% > 25%
    const entries = [
      ...Array.from({ length: 8 }, (_, i) =>
        makeEntry({
          data: `2026-01-${String(i + 5).padStart(2, '0')}`,
          pamainosPradzia: '08:00',
          pamainosPabaiga: '20:00',
        })
      ),
      ...Array.from({ length: 4 }, (_, i) =>
        makeEntry({
          data: `2026-01-${String(i + 15).padStart(2, '0')}`,
          pamainosPradzia: '22:00',
          pamainosPabaiga: '06:00',
        })
      ),
    ];
    expect(isNightWorker(entries, period)).toBe(true);
  });
});

// ============================================================================
// calculateAverageNightHoursPerDay
// ============================================================================

describe('calculateAverageNightHoursPerDay', () => {
  it('tik naktinės pamainos 22:00-06:00 → vidurkis 480 min (8h)', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry({
        data: `2026-01-${String(i + 5).padStart(2, '0')}`,
        pamainosPradzia: '22:00',
        pamainosPabaiga: '06:00',
      })
    );
    expect(calculateAverageNightHoursPerDay(entries)).toBe(480);
  });

  it('mišrios pamainos – skaičiuojamos tik tos, kuriose yra nakties', () => {
    const entries = [
      makeEntry({
        data: '2026-01-05',
        pamainosPradzia: '08:00',
        pamainosPabaiga: '16:00',
      }), // 0 nakties
      makeEntry({
        data: '2026-01-06',
        pamainosPradzia: '22:00',
        pamainosPabaiga: '06:00',
      }), // 480 min nakties
      makeEntry({
        data: '2026-01-07',
        pamainosPradzia: '14:00',
        pamainosPabaiga: '23:00',
      }), // 60 min nakties
    ];
    // Vidurkis tik iš nakties pamainų: (480 + 60) / 2 = 270 min
    expect(calculateAverageNightHoursPerDay(entries)).toBe(270);
  });

  it('jokių nakties valandų → 0', () => {
    const entries = [
      makeEntry({
        data: '2026-01-05',
        pamainosPradzia: '08:00',
        pamainosPabaiga: '16:00',
      }),
    ];
    expect(calculateAverageNightHoursPerDay(entries)).toBe(0);
  });
});
