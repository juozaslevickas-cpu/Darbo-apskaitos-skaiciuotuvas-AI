import type { DeviationCode, AbsenceAsWorkCode } from '@/config/work-codes';

/**
 * Žiniaraščio modelis – 4 eilučių struktūra vienam darbuotojui per mėnesį.
 *
 * Struktūra pagal DARBO_LAIKO_TAISYKLES.md §11:
 * 1 eil. – Dirbta valandų / neatvykimo kodas
 * 2 eil. – (tuščia / papildoma info)
 * 3 eil. – Nukrypimai (VD, DP, DN, PD, BN, BĮ)
 * 4 eil. – Neatvykimai, prilyginami darbo laikui (K, KV, MD, D, M, PR, SŽ)
 */

/** Vienos dienos duomenys 1-oje eilutėje */
export interface TimesheetRow1Cell {
  /** Dirbtos valandos (minutėmis) arba null jei nebuvo darbo */
  dirbtaMin: number | null;
  /** Neatvykimo kodas (pvz., 'P', 'S', 'A', 'L') arba null jei buvo darbas */
  neatvykimoKodas: string | null;
}

/** Vienos dienos duomenys 3-ioje eilutėje (nukrypimai) */
export interface TimesheetRow3Cell {
  /** Nukrypimo kodas ir valandos (minutėmis) */
  entries: {
    kodas: DeviationCode;
    minutes: number;
  }[];
}

/** Vienos dienos duomenys 4-oje eilutėje (neatvykimai = darbo laikas) */
export interface TimesheetRow4Cell {
  /** Neatvykimo kodas ir valandos (minutėmis) */
  entries: {
    kodas: AbsenceAsWorkCode;
    minutes: number;
  }[];
}

/** Žiniaraščio suvestinė (dešinioji pusė) */
export interface TimesheetSummary {
  /** Iš viso dirbta valandų (minutėmis) */
  isVisoDirbta: number;
  /** Nakties valandos (minutėmis) */
  naktiesValandos: number;
  /** Viršvalandžiai (minutėmis) */
  virsvalandziai: number;
  /** Nukrypimai pagal kodą (minutėmis) */
  nukrypimai: Record<DeviationCode, number>;
  /** Neatvykimai prilyginami darbo laikui (minutėmis) */
  neatvykimaiKaiDarbas: Record<AbsenceAsWorkCode, number>;
  /** Atostogų dienų skaičius */
  atostoguDienos: number;
  /** Ligos dienų skaičius */
  ligosDienos: number;
  /** Kiti neatvykimai (dienomis, pagal kodą) */
  kitiNeatvykimai: Record<string, number>;
}

/** Pilnas žiniaraštis vienam darbuotojui per mėnesį */
export interface Timesheet {
  darbuotojoId: string;
  metai: number;
  menuo: number; // 1-12

  /** Mėnesio dienų skaičius (28/29/30/31) */
  dienuSkaicius: number;

  /**
   * 1 eilutė: dirbtos valandos arba neatvykimo kodas.
   * Indeksas 0 = 1 diena, indeksas 1 = 2 diena, …
   */
  eilute1: TimesheetRow1Cell[];

  /**
   * 2 eilutė: papildoma informacija (tuščia pagal nutylėjimą).
   * Rezervuota ateičiai.
   */
  eilute2: (string | null)[];

  /**
   * 3 eilutė: nukrypimai (VD, DP, DN ir kt.).
   */
  eilute3: TimesheetRow3Cell[];

  /**
   * 4 eilutė: neatvykimai, prilyginami darbo laikui.
   */
  eilute4: TimesheetRow4Cell[];

  /** Suvestinės duomenys */
  suvestine: TimesheetSummary;
}
