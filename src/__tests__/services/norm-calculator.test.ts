import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyNorm,
  calculatePeriodNorm,
} from '@/services/norm-calculator';

// ============================================================================
// Mėnesio normos skaičiavimas – KRITINIAI TESTAI
// ============================================================================

describe('calculateMonthlyNorm', () => {
  describe('2026 sausis', () => {
    it('pilnas etatas: 21 d.d. × 8h = 168h (10080 min), be prieššventinių', () => {
      const norm = calculateMonthlyNorm(2026, 1, 40, 1.0);
      expect(norm.darbodienuSk).toBe(21);
      expect(norm.dienosNorma).toBe(480); // 40/5 * 60 = 480 min
      expect(norm.priessventiniuSutrumpinimai).toBe(0);
      expect(norm.bendraNorma).toBe(21 * 480); // 10080
      expect(norm.normaDarbuotojui).toBe(10080);
    });
  });

  describe('2026 vasaris', () => {
    it('pilnas etatas: 19 d.d. × 8h = 152h (9120 min)', () => {
      // Vasario 16 = pirmadienis (šventė) → 20 - 1 = 19 d.d.
      // Vasario 15 = sekmadienis → nėra prieššventinės
      const norm = calculateMonthlyNorm(2026, 2, 40, 1.0);
      expect(norm.darbodienuSk).toBe(19);
      expect(norm.priessventiniuSutrumpinimai).toBe(0);
      expect(norm.normaDarbuotojui).toBe(19 * 480); // 9120
    });
  });

  describe('keliamieji metai', () => {
    it('2028 vasaris (29 d.): darbo dienos teisingai skaičiuojamos', () => {
      const norm = calculateMonthlyNorm(2028, 2, 40, 1.0);
      // 2028 vasaris: 29 dienos, prasideda antradienį
      // Pr-Pn: 21 diena
      // Vasario 16 = trečiadienis (šventė) → -1
      // = 20 d.d.
      expect(norm.darbodienuSk).toBe(20);
    });
  });

  describe('dalinis etatas', () => {
    it('0.5 etatas: norma × 0.5', () => {
      const normFull = calculateMonthlyNorm(2026, 1, 40, 1.0);
      const normHalf = calculateMonthlyNorm(2026, 1, 40, 0.5);

      expect(normHalf.normaDarbuotojui).toBe(normFull.bendraNorma * 0.5);
    });

    it('0.25 etatas: norma × 0.25', () => {
      const norm = calculateMonthlyNorm(2026, 1, 40, 0.25);
      expect(norm.normaDarbuotojui).toBe(21 * 480 * 0.25);
    });

    it('dalinis etatas neturi prieššventinių sutrumpinimų', () => {
      // Mėnuo su prieššventine
      const norm = calculateMonthlyNorm(2026, 3, 40, 0.5); // kovas turi prieššventinę
      expect(norm.priessventiniuSutrumpinimai).toBe(0);
    });
  });

  describe('prieššventiniai sutrumpinimai', () => {
    it('2026 kovas: 1 prieššventinė (kovo 10 prieš kovo 11)', () => {
      const norm = calculateMonthlyNorm(2026, 3, 40, 1.0);
      expect(norm.priessventiniuSutrumpinimai).toBe(60); // 1 × 60 min
      expect(norm.bendraNorma).toBe(21 * 480 - 60); // 10080 - 60 = 10020
    });

    it('2025 gruodis: 2 prieššventinės', () => {
      // Gruodžio 23 prieš Kūčias + gruodžio 31 prieš Naujuosius
      const norm = calculateMonthlyNorm(2025, 12, 40, 1.0);
      expect(norm.priessventiniuSutrumpinimai).toBe(120); // 2 × 60 min
    });
  });

  describe('dienos norma', () => {
    it('40h savaitinė → 8h dienos (480 min)', () => {
      const norm = calculateMonthlyNorm(2026, 1, 40, 1.0);
      expect(norm.dienosNorma).toBe(480);
    });

    it('36h savaitinė → 7.2h dienos (432 min)', () => {
      const norm = calculateMonthlyNorm(2026, 1, 36, 1.0);
      expect(norm.dienosNorma).toBe(432);
    });
  });
});

// ============================================================================
// Laikotarpio norma
// ============================================================================

describe('calculatePeriodNorm', () => {
  it('1 mėnuo = mėnesio norma', () => {
    const monthlyNorm = calculateMonthlyNorm(2026, 1, 40, 1.0);
    const periodNorm = calculatePeriodNorm(2026, 1, 1, 40, 1.0);
    expect(periodNorm).toBe(monthlyNorm.normaDarbuotojui);
  });

  it('3 mėnesiai susumuoja teisingai', () => {
    const jan = calculateMonthlyNorm(2026, 1, 40, 1.0);
    const feb = calculateMonthlyNorm(2026, 2, 40, 1.0);
    const mar = calculateMonthlyNorm(2026, 3, 40, 1.0);
    const periodNorm = calculatePeriodNorm(2026, 1, 3, 40, 1.0);

    expect(periodNorm).toBe(
      jan.normaDarbuotojui + feb.normaDarbuotojui + mar.normaDarbuotojui
    );
  });

  it('pereinant per metų ribą (2025 lapkritis → 2026 sausis)', () => {
    const nov2025 = calculateMonthlyNorm(2025, 11, 40, 1.0);
    const dec2025 = calculateMonthlyNorm(2025, 12, 40, 1.0);
    const jan2026 = calculateMonthlyNorm(2026, 1, 40, 1.0);
    const periodNorm = calculatePeriodNorm(2025, 11, 3, 40, 1.0);

    expect(periodNorm).toBe(
      nov2025.normaDarbuotojui + dec2025.normaDarbuotojui + jan2026.normaDarbuotojui
    );
  });
});
