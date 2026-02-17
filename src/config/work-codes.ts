/**
 * Darbo laiko apskaitos žiniaraščio sutartiniai žymėjimai.
 * Pagrindas: DK ir žiniaraščio pildymo tvarkos aprašas (§10).
 *
 * Kategorijos:
 * - 'darbas'      – darbo laiko žymėjimai (pamainų tipai, viršvalandžiai, budėjimai)
 * - 'neatvykimas'  – neatvykimo priežastys (atostogos, liga, komandiruotės ir kt.)
 * - 'poilsis'      – poilsio ir švenčių dienos
 */

export type WorkCodeCategory = 'darbas' | 'neatvykimas' | 'poilsis';

export interface WorkCode {
  /** Sutartinis žymėjimas (pvz., 'DN', 'A', 'P') */
  kodas: string;
  /** Pilnas lietuviškas pavadinimas */
  pavadinimas: string;
  /** DK straipsnio nuoroda */
  dkStraipsnis: string;
  /** Kategorija: darbas, neatvykimas arba poilsis */
  kategorija: WorkCodeCategory;
}

// ---------------------------------------------------------------------------
// Pagrindiniai darbo kodai (§10.1)
// ---------------------------------------------------------------------------

export const WORK_CODES: readonly WorkCode[] = [
  // --- Darbo kodai ---
  {
    kodas: 'DN',
    pavadinimas: 'Darbas naktį',
    dkStraipsnis: 'DK 117 str.',
    kategorija: 'darbas',
  },
  {
    kodas: 'VD',
    pavadinimas: 'Viršvalandinis darbas',
    dkStraipsnis: 'DK 119 str.',
    kategorija: 'darbas',
  },
  {
    kodas: 'DP',
    pavadinimas: 'Darbas poilsio ir švenčių dienomis',
    dkStraipsnis: 'DK 123 str. 2 d., 124 str. 2 d.',
    kategorija: 'darbas',
  },
  {
    kodas: 'PD',
    pavadinimas: 'Papildomo darbo laikas',
    dkStraipsnis: 'DK 35 str. 4 d.',
    kategorija: 'darbas',
  },
  {
    kodas: 'BN',
    pavadinimas: 'Pasyvus budėjimas (namuose)',
    dkStraipsnis: 'DK 118 str. 2 d.',
    kategorija: 'darbas',
  },
  {
    kodas: 'BĮ',
    pavadinimas: 'Aktyvus budėjimas darbe (darbovietėje)',
    dkStraipsnis: 'DK 118 str. 1 d.',
    kategorija: 'darbas',
  },

  // --- Poilsio kodai ---
  {
    kodas: 'V',
    pavadinimas: 'Papildomas poilsio laikas (už viršvalandžius/poilsio/švenčių d.)',
    dkStraipsnis: 'DK 107 str. 4 d.',
    kategorija: 'poilsis',
  },
  {
    kodas: 'P',
    pavadinimas: 'Poilsio dienos',
    dkStraipsnis: 'DK 124 str. 1 d.',
    kategorija: 'poilsis',
  },
  {
    kodas: 'S',
    pavadinimas: 'Švenčių dienos',
    dkStraipsnis: 'DK 123 str. 1 d.',
    kategorija: 'poilsis',
  },

  // --- Neatvykimo kodai (§10.2) ---
  {
    kodas: 'A',
    pavadinimas: 'Kasmetinės atostogos',
    dkStraipsnis: 'DK 126 str. 1 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'MA',
    pavadinimas: 'Mokymosi atostogos',
    dkStraipsnis: 'DK 135 str.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'NA',
    pavadinimas: 'Nemokamos atostogos',
    dkStraipsnis: 'DK 137 str. 1 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'KA',
    pavadinimas: 'Kūrybinės atostogos',
    dkStraipsnis: 'DK 136 str.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'G',
    pavadinimas: 'Nėštumo ir gimdymo atostogos',
    dkStraipsnis: 'DK 132 str.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'PV',
    pavadinimas: 'Atostogos vaikui prižiūrėti (iki 3 m.)',
    dkStraipsnis: 'DK 134 str.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'TA',
    pavadinimas: 'Tėvystės atostogos',
    dkStraipsnis: 'DK 133 str.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'L',
    pavadinimas: 'Nedarbingumas dėl ligos ar traumų',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'N',
    pavadinimas: 'Neapmokamas nedarbingumas',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'NS',
    pavadinimas: 'Nedarbingumas ligoniams slaugyti',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'K',
    pavadinimas: 'Tarnybinės komandiruotės',
    dkStraipsnis: 'DK 107 str. 1 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'KV',
    pavadinimas: 'Kvalifikacijos kėlimas',
    dkStraipsnis: 'DK 111 str. 2 d. 5 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'D',
    pavadinimas: 'Kraujo davimo dienos donorams',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'M',
    pavadinimas: 'Papildomas poilsis (neįgalus vaikas iki 18 m. / 2+ vaikai iki 12 m.)',
    dkStraipsnis: 'DK 138 str. 3 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'MD',
    pavadinimas: 'Privalomų medicininių apžiūrų laikas',
    dkStraipsnis: 'DK 111 str. 2 d. 6 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'ID',
    pavadinimas: 'Laikas naujo darbo paieškoms',
    dkStraipsnis: 'DK 64 str. 6 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'PB',
    pavadinimas: 'Pravaikštos (neatvykimas be svarbios priežasties)',
    dkStraipsnis: 'DK 111 str. 2 d. 8 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'ND',
    pavadinimas: 'Neatvykimas dėl šeimyninių aplinkybių',
    dkStraipsnis: 'DK 137 str. 3 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'NP',
    pavadinimas: 'Neatvykimas kitais norminių teisės aktų nustatytais laikotarpiais',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'NN',
    pavadinimas: 'Nušalinimas nuo darbo',
    dkStraipsnis: 'DK 49 str. 3 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'ST',
    pavadinimas: 'Streikas',
    dkStraipsnis: 'DK 244 str.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'SŽ',
    pavadinimas: 'Stažuotės',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'PR',
    pavadinimas: 'Valstybinių/visuomeninių/piliečio pareigų vykdymas',
    dkStraipsnis: 'DK 137 str. 4 d.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'KT',
    pavadinimas: 'Karinė tarnyba',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
  {
    kodas: 'KM',
    pavadinimas: 'Mokomosios karinės pratybos',
    dkStraipsnis: 'DK 111 str. 2 d. 9 p.',
    kategorija: 'neatvykimas',
  },
];

// ---------------------------------------------------------------------------
// Pagalbinės funkcijos
// ---------------------------------------------------------------------------

/** Grąžina darbo kodą pagal sutartinį žymėjimą */
export function getWorkCode(kodas: string): WorkCode | undefined {
  return WORK_CODES.find((wc) => wc.kodas === kodas);
}

/** Grąžina visus nurodytos kategorijos kodus */
export function getCodesByCategory(kategorija: WorkCodeCategory): WorkCode[] {
  return WORK_CODES.filter((wc) => wc.kategorija === kategorija);
}

/** Grąžina darbo kategorijos kodus */
export function getDarboCodes(): WorkCode[] {
  return getCodesByCategory('darbas');
}

/** Grąžina neatvykimo kategorijos kodus */
export function getNeatvykimoCodes(): WorkCode[] {
  return getCodesByCategory('neatvykimas');
}

/** Grąžina poilsio kategorijos kodus */
export function getPoilsioCodes(): WorkCode[] {
  return getCodesByCategory('poilsis');
}

/**
 * Grafiko įrašo tipų enum – suderintas su darbo kodais.
 * Naudojamas schedule-entry modelyje.
 */
export const SCHEDULE_ENTRY_TYPES = [
  'DARBAS',
  'POILSIS',
  'SVENTE',
  // Neatvykimo kodai naudojami tiesiogiai kaip tipai
  'A',
  'MA',
  'NA',
  'KA',
  'G',
  'PV',
  'TA',
  'L',
  'N',
  'NS',
  'K',
  'KV',
  'D',
  'M',
  'MD',
  'ID',
  'PB',
  'ND',
  'NP',
  'NN',
  'ST',
  'SŽ',
  'PR',
  'KT',
  'KM',
] as const;

export type ScheduleEntryType = (typeof SCHEDULE_ENTRY_TYPES)[number];

/** Nukrypimų kodai – naudojami žiniaraščio 3-oje eilutėje */
export const DEVIATION_CODES = ['VD', 'DP', 'DN', 'PD', 'BN', 'BĮ'] as const;
export type DeviationCode = (typeof DEVIATION_CODES)[number];

/** Neatvykimų kodai, prilyginami darbo laikui – žiniaraščio 4-oji eilutė (DK 111 str.) */
export const ABSENCE_AS_WORK_CODES = ['K', 'KV', 'MD', 'D', 'M', 'PR', 'SŽ'] as const;
export type AbsenceAsWorkCode = (typeof ABSENCE_AS_WORK_CODES)[number];
