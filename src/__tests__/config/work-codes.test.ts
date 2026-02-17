import { describe, it, expect } from 'vitest';
import {
  WORK_CODES,
  SCHEDULE_ENTRY_TYPES,
  DEVIATION_CODES,
  ABSENCE_AS_WORK_CODES,
  getWorkCode,
  getCodesByCategory,
  getDarboCodes,
  getNeatvykimoCodes,
  getPoilsioCodes,
} from '@/config/work-codes';

describe('WORK_CODES', () => {
  it('turi bent 34 kodus (9 pagrindinių + 25 neatvykimo)', () => {
    expect(WORK_CODES.length).toBeGreaterThanOrEqual(34);
  });

  it('kiekvienas kodas turi visus privalomus laukus', () => {
    for (const code of WORK_CODES) {
      expect(code.kodas).toBeTruthy();
      expect(code.pavadinimas).toBeTruthy();
      expect(code.dkStraipsnis).toBeTruthy();
      expect(['darbas', 'neatvykimas', 'poilsis']).toContain(code.kategorija);
    }
  });

  it('kodai yra unikalūs', () => {
    const kodai = WORK_CODES.map((wc) => wc.kodas);
    const unikalus = new Set(kodai);
    expect(unikalus.size).toBe(kodai.length);
  });

  it('apima visus pagrindinius darbo kodus', () => {
    const darboKodai = ['DN', 'VD', 'DP', 'PD', 'BN', 'BĮ'];
    for (const kodas of darboKodai) {
      expect(WORK_CODES.find((wc) => wc.kodas === kodas)).toBeDefined();
    }
  });

  it('apima visus poilsio kodus', () => {
    const poilsioKodai = ['V', 'P', 'S'];
    for (const kodas of poilsioKodai) {
      expect(WORK_CODES.find((wc) => wc.kodas === kodas)).toBeDefined();
    }
  });

  it('apima visus neatvykimo kodus', () => {
    const neatvykimoKodai = [
      'A', 'MA', 'NA', 'KA', 'G', 'PV', 'TA', 'L', 'N', 'NS',
      'K', 'KV', 'D', 'M', 'MD', 'ID', 'PB', 'ND', 'NP', 'NN',
      'ST', 'SŽ', 'PR', 'KT', 'KM',
    ];
    for (const kodas of neatvykimoKodai) {
      expect(WORK_CODES.find((wc) => wc.kodas === kodas)).toBeDefined();
    }
  });
});

describe('getWorkCode', () => {
  it('grąžina teisingą kodą pagal žymėjimą', () => {
    const dn = getWorkCode('DN');
    expect(dn).toBeDefined();
    expect(dn!.pavadinimas).toBe('Darbas naktį');
    expect(dn!.kategorija).toBe('darbas');
  });

  it('grąžina undefined nesant kodui', () => {
    expect(getWorkCode('NEEGZISTUOJANTIS')).toBeUndefined();
  });

  it('teisingai randa BĮ (su lietuviška raide)', () => {
    const bi = getWorkCode('BĮ');
    expect(bi).toBeDefined();
    expect(bi!.pavadinimas).toContain('budėjimas');
  });

  it('teisingai randa SŽ (su lietuviška raide)', () => {
    const sz = getWorkCode('SŽ');
    expect(sz).toBeDefined();
    expect(sz!.pavadinimas).toContain('Stažuotės');
  });
});

describe('getCodesByCategory', () => {
  it('filtruoja darbo kategorijos kodus', () => {
    const darbas = getCodesByCategory('darbas');
    expect(darbas.length).toBe(6); // DN, VD, DP, PD, BN, BĮ
    for (const code of darbas) {
      expect(code.kategorija).toBe('darbas');
    }
  });

  it('filtruoja poilsio kategorijos kodus', () => {
    const poilsis = getCodesByCategory('poilsis');
    expect(poilsis.length).toBe(3); // V, P, S
    for (const code of poilsis) {
      expect(code.kategorija).toBe('poilsis');
    }
  });

  it('filtruoja neatvykimo kategorijos kodus', () => {
    const neatvykimas = getCodesByCategory('neatvykimas');
    expect(neatvykimas.length).toBe(25);
    for (const code of neatvykimas) {
      expect(code.kategorija).toBe('neatvykimas');
    }
  });
});

describe('convenience functions', () => {
  it('getDarboCodes grąžina darbo kodus', () => {
    const codes = getDarboCodes();
    expect(codes.length).toBe(6);
    expect(codes.every((c) => c.kategorija === 'darbas')).toBe(true);
  });

  it('getNeatvykimoCodes grąžina neatvykimo kodus', () => {
    const codes = getNeatvykimoCodes();
    expect(codes.length).toBe(25);
    expect(codes.every((c) => c.kategorija === 'neatvykimas')).toBe(true);
  });

  it('getPoilsioCodes grąžina poilsio kodus', () => {
    const codes = getPoilsioCodes();
    expect(codes.length).toBe(3);
    expect(codes.every((c) => c.kategorija === 'poilsis')).toBe(true);
  });
});

describe('SCHEDULE_ENTRY_TYPES', () => {
  it('apima DARBAS, POILSIS, SVENTE', () => {
    expect(SCHEDULE_ENTRY_TYPES).toContain('DARBAS');
    expect(SCHEDULE_ENTRY_TYPES).toContain('POILSIS');
    expect(SCHEDULE_ENTRY_TYPES).toContain('SVENTE');
  });

  it('apima visus neatvykimo kodus', () => {
    const neatvykimoKodai = [
      'A', 'MA', 'NA', 'KA', 'G', 'PV', 'TA', 'L', 'N', 'NS',
      'K', 'KV', 'D', 'M', 'MD', 'ID', 'PB', 'ND', 'NP', 'NN',
      'ST', 'SŽ', 'PR', 'KT', 'KM',
    ];
    for (const kodas of neatvykimoKodai) {
      expect(SCHEDULE_ENTRY_TYPES).toContain(kodas);
    }
  });

  it('turi 28 tipų (3 baziniai + 25 neatvykimo)', () => {
    expect(SCHEDULE_ENTRY_TYPES).toHaveLength(28);
  });
});

describe('DEVIATION_CODES', () => {
  it('apima nukrypimų kodus žiniaraščio 3-iai eilutei', () => {
    expect(DEVIATION_CODES).toContain('VD');
    expect(DEVIATION_CODES).toContain('DP');
    expect(DEVIATION_CODES).toContain('DN');
  });

  it('turi 6 kodus', () => {
    expect(DEVIATION_CODES).toHaveLength(6);
  });
});

describe('ABSENCE_AS_WORK_CODES', () => {
  it('apima neatvykimus prilyginamus darbo laikui', () => {
    expect(ABSENCE_AS_WORK_CODES).toContain('K');
    expect(ABSENCE_AS_WORK_CODES).toContain('KV');
    expect(ABSENCE_AS_WORK_CODES).toContain('MD');
  });

  it('turi 7 kodus', () => {
    expect(ABSENCE_AS_WORK_CODES).toHaveLength(7);
  });
});
