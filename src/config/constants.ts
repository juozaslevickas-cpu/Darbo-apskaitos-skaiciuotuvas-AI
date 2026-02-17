/**
 * Darbo kodekso (DK) ribos ir numatytosios reikšmės.
 * Kiekviena konstanta atitinka konkretų DK straipsnį.
 */
export const DK_LIMITS = {
  /** Max pamaina be pietų pertraukos (DK 114 str. 2 d.) */
  MAX_HOURS_PER_SHIFT: 12,
  /** Max vidutinis darbo laikas per 7 dienas su viršvalandžiais (DK 114 str. 1 d.) */
  MAX_AVG_HOURS_PER_7_DAYS: 48,
  /** Max darbo laikas per 7 dienas su viršvalandžiais IR papildomu darbu (DK 114 str. 2 d.) */
  MAX_HOURS_WITH_ADDITIONAL_7_DAYS: 60,
  /** Max darbo dienų iš eilės per 7 paeiliui einančias dienas (DK 114 str. 4 d.) */
  MAX_CONSECUTIVE_WORK_DAYS: 6,
  /** Min nepertraukiamas poilsis tarp pamainų, valandomis (DK 122 str. 2 d. 3 p.) */
  MIN_REST_BETWEEN_SHIFTS_HOURS: 11,
  /** Min savaitinis nepertraukiamas poilsis, valandomis (DK 122 str. 2 d. 3 p.) */
  MIN_WEEKLY_REST_HOURS: 35,
  /** Min pietų pertrauka, minutėmis (DK 122 str. 2 d. 2 p.) */
  MIN_LUNCH_BREAK_MINUTES: 30,
  /** Max pietų pertrauka, minutėmis (DK 122 str. 2 d. 2 p.) */
  MAX_LUNCH_BREAK_MINUTES: 120,
  /** Max darbo laikas iki pietų pertraukos, valandomis (DK 122 str. 2 d. 2 p.) */
  MAX_WORK_BEFORE_LUNCH_HOURS: 5,
  /** Nakties laiko pradžia (DK 117 str.) */
  NIGHT_START_HOUR: 22,
  /** Nakties laiko pabaiga (DK 117 str.) */
  NIGHT_END_HOUR: 6,
  /** Max nakties darbo vidurkis per dieną per 3 mėn., valandomis (DK 117 str.) */
  MAX_NIGHT_AVG_HOURS_PER_DAY: 8,
  /** Max viršvalandžiai per 7 dienų laikotarpį, valandomis (DK 119 str.) */
  MAX_OVERTIME_PER_7_DAYS: 8,
  /** Max viršvalandžiai per 7 d. su darbuotojo rašytiniu sutikimu (DK 119 str.) */
  MAX_OVERTIME_WITH_CONSENT_7_DAYS: 12,
  /** Max viršvalandžiai per metus, valandomis (DK 119 str.) */
  MAX_OVERTIME_PER_YEAR: 180,
  /** Prieššventinės dienos sutrumpinimas, valandomis (DK 112 str. 6 d.) */
  PRE_HOLIDAY_REDUCTION_HOURS: 1,
  /** Standartinė savaitinė norma, valandomis */
  DEFAULT_WEEKLY_NORM: 40,
  /** Numatytoji pietų pertrauka, minutėmis */
  DEFAULT_LUNCH_BREAK_MINUTES: 60,
} as const;
