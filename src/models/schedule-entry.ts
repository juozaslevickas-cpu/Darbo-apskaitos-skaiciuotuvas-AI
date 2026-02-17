import { z } from 'zod';
import { SCHEDULE_ENTRY_TYPES, type ScheduleEntryType } from '@/config/work-codes';

/**
 * Grafiko įrašo (pamainos / poilsio / neatvykimo) schema ir tipas.
 *
 * Kiekviena mėnesio diena turi vieną ScheduleEntry įrašą.
 * - tipas: DARBAS, POILSIS, SVENTE arba neatvykimo kodas (A, L, K, …)
 * - pamainosPradzia / pamainosPabaiga: aktyvūs tik kai tipas = 'DARBAS'
 * - pietuPertraukaMin: pietų pertraukos trukmė minutėmis (DK 122 str. 2 d. 2 p.)
 * - neatvykimoKodas: papildomas kodas, jei tipas yra neatvykimas
 */

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const scheduleEntrySchema = z.object({
  id: z.string().uuid(),
  darbuotojoId: z.string().uuid(),
  data: z.string().regex(dateRegex, 'Data turi būti YYYY-MM-DD formatu'),
  tipas: z.enum(SCHEDULE_ENTRY_TYPES),
  pamainosPradzia: z
    .string()
    .regex(timeRegex, 'Laikas turi būti HH:MM formatu')
    .nullable()
    .default(null),
  pamainosPabaiga: z
    .string()
    .regex(timeRegex, 'Laikas turi būti HH:MM formatu')
    .nullable()
    .default(null),
  pietuPertraukaMin: z
    .number()
    .int()
    .min(0, 'Pertrauka negali būti neigiama')
    .max(120, 'Maksimali pertrauka – 120 min.')
    .default(60),
  neatvykimoKodas: z.string().nullable().default(null),
  pastaba: z.string().nullable().default(null),
});

export type ScheduleEntry = z.infer<typeof scheduleEntrySchema>;

/** Patikrina ar įrašo tipas yra darbo tipas */
export function isDarbas(entry: ScheduleEntry): boolean {
  return entry.tipas === 'DARBAS';
}

/** Patikrina ar įrašo tipas yra poilsio tipas */
export function isPoilsis(entry: ScheduleEntry): boolean {
  return entry.tipas === 'POILSIS';
}

/** Patikrina ar įrašo tipas yra šventė */
export function isSvente(entry: ScheduleEntry): boolean {
  return entry.tipas === 'SVENTE';
}

/** Patikrina ar įrašo tipas yra neatvykimas */
export function isNeatvykimas(entry: ScheduleEntry): boolean {
  return !isDarbas(entry) && !isPoilsis(entry) && !isSvente(entry);
}

/**
 * Tipų apsauga: ar tipas priklauso ScheduleEntryType.
 * Naudinga validuojant vartotojo įvestį.
 */
export function isValidScheduleEntryType(
  value: string
): value is ScheduleEntryType {
  return (SCHEDULE_ENTRY_TYPES as readonly string[]).includes(value);
}
