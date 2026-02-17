/**
 * Darbo laiko grafiko validacijos pranešimo tipas.
 *
 * Naudojamas DK ribų tikrinimui (8 ALERT validacijos):
 * - ALERT_1: Pamaina > 12h
 * - ALERT_2: Vidurkis per 7d > 48h
 * - ALERT_3: Su papildomu darbu per 7d > 60h
 * - ALERT_4: > 6 darbo dienos iš eilės
 * - ALERT_5: 2 pamainos iš eilės (be poilsio)
 * - ALERT_6: Poilsis tarp pamainų < 11h
 * - ALERT_7: Savaitinis poilsis < 35h
 * - ALERT_8: Nakties vidurkis > 8h/d per 3 mėn.
 */

export type ValidationAlertTipas = 'KLAIDA' | 'ISPEJIMAS';

export type ValidationAlertKodas =
  | 'ALERT_1'
  | 'ALERT_2'
  | 'ALERT_3'
  | 'ALERT_4'
  | 'ALERT_5'
  | 'ALERT_6'
  | 'ALERT_7'
  | 'ALERT_8';

export interface ValidationAlert {
  /** Rimtumas: KLAIDA (blokuojantis) arba ISPEJIMAS (informacinis) */
  tipas: ValidationAlertTipas;
  /** Validacijos kodas (ALERT_1 … ALERT_8) */
  kodas: ValidationAlertKodas;
  /** Lietuviškas pranešimo tekstas */
  pranesimas: string;
  /** DK straipsnio nuoroda (pvz., "DK 114 str. 2 d.") */
  dkStraipsnis: string;
  /** Su kuria data susijęs pažeidimas (YYYY-MM-DD) */
  data?: string;
  /** Darbuotojo, kuriam taikomas pažeidimas, ID */
  darbuotojoId: string;
}

/**
 * Pagalbinė funkcija sukurti ValidationAlert objektą.
 * Užtikrina teisingą tipizaciją.
 */
export function createValidationAlert(
  params: Omit<ValidationAlert, 'tipas'> & { tipas?: ValidationAlertTipas }
): ValidationAlert {
  return {
    tipas: params.tipas ?? 'KLAIDA',
    kodas: params.kodas,
    pranesimas: params.pranesimas,
    dkStraipsnis: params.dkStraipsnis,
    data: params.data,
    darbuotojoId: params.darbuotojoId,
  };
}

/** Filtruoja tik klaidas (ne įspėjimus) */
export function getKlaidos(alerts: ValidationAlert[]): ValidationAlert[] {
  return alerts.filter((a) => a.tipas === 'KLAIDA');
}

/** Filtruoja tik įspėjimus */
export function getIspejimai(alerts: ValidationAlert[]): ValidationAlert[] {
  return alerts.filter((a) => a.tipas === 'ISPEJIMAS');
}

/** Grupuoja pranešimus pagal darbuotojo ID */
export function groupByDarbuotojas(
  alerts: ValidationAlert[]
): Record<string, ValidationAlert[]> {
  return alerts.reduce(
    (acc, alert) => {
      const key = alert.darbuotojoId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(alert);
      return acc;
    },
    {} as Record<string, ValidationAlert[]>
  );
}
