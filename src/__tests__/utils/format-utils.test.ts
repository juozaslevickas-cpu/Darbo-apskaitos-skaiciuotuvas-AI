import { describe, it, expect } from 'vitest';
import {
  hoursToDisplay,
  minutesToHHMM,
  formatDecimalLT,
  formatDifference,
} from '@/utils/format-utils';

describe('hoursToDisplay', () => {
  it('480 min → "8,00"', () => {
    expect(hoursToDisplay(480)).toBe('8,00');
  });

  it('470 min → "7,83"', () => {
    expect(hoursToDisplay(470)).toBe('7,83');
  });

  it('0 → "0,00"', () => {
    expect(hoursToDisplay(0)).toBe('0,00');
  });

  it('90 min → "1,50"', () => {
    expect(hoursToDisplay(90)).toBe('1,50');
  });

  it('660 min → "11,00"', () => {
    expect(hoursToDisplay(660)).toBe('11,00');
  });

  it('naudoja kablelį kaip dešimtainį skirtuką', () => {
    expect(hoursToDisplay(100)).toContain(',');
    expect(hoursToDisplay(100)).not.toContain('.');
  });
});

describe('minutesToHHMM', () => {
  it('480 → "08:00"', () => {
    expect(minutesToHHMM(480)).toBe('08:00');
  });

  it('470 → "07:50"', () => {
    expect(minutesToHHMM(470)).toBe('07:50');
  });

  it('90 → "01:30"', () => {
    expect(minutesToHHMM(90)).toBe('01:30');
  });

  it('0 → "00:00"', () => {
    expect(minutesToHHMM(0)).toBe('00:00');
  });

  it('neigiamos minutės su minuso ženklu', () => {
    expect(minutesToHHMM(-60)).toBe('-01:00');
  });
});

describe('formatDecimalLT', () => {
  it('8.5 → "8,50"', () => {
    expect(formatDecimalLT(8.5)).toBe('8,50');
  });

  it('0 → "0,00"', () => {
    expect(formatDecimalLT(0)).toBe('0,00');
  });

  it('su pasirinktu tikslumu', () => {
    expect(formatDecimalLT(3.14159, 3)).toBe('3,142');
  });
});

describe('formatDifference', () => {
  it('teigiamas: 120 min → "+2,00"', () => {
    expect(formatDifference(120)).toBe('+2,00');
  });

  it('neigiamas: -60 min → "-1,00"', () => {
    expect(formatDifference(-60)).toBe('-1,00');
  });

  it('nulis: 0 → "0,00"', () => {
    expect(formatDifference(0)).toBe('0,00');
  });
});
