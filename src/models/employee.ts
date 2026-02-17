import { z } from 'zod';

/**
 * Darbuotojo schema ir tipas.
 *
 * Laukai atitinka DK reikalavimus darbo laiko apskaitai:
 * - etatas: 0.25 / 0.50 / 0.75 / 1.00
 * - savaitineNorma: standartinė 40 val./sav. (DK 112 str.)
 * - sumineApskaita: ar taikoma suminė darbo laiko apskaita (DK 115 str.)
 * - apskaitinisLaikotarpisMenesiai: 1–12 mėn. (DK 115 str. 2 d.)
 */
export const employeeSchema = z.object({
  id: z.string().uuid(),
  vardas: z.string().min(1, 'Vardas privalomas'),
  pavarde: z.string().min(1, 'Pavardė privaloma'),
  pareigos: z.string().min(1, 'Pareigos privalomos'),
  etatas: z
    .number()
    .min(0.25, 'Mažiausias etatas – 0,25')
    .max(1.0, 'Didžiausias etatas – 1,00')
    .refine((val) => [0.25, 0.5, 0.75, 1.0].includes(val), {
      message: 'Etatas turi būti 0,25 kartotinis (0,25 / 0,50 / 0,75 / 1,00)',
    }),
  savaitineNorma: z.number().min(1).max(40).default(40),
  darboSutartiesPradzia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data turi būti YYYY-MM-DD formatu'),
  sumineApskaita: z.boolean().default(true),
  apskaitinisLaikotarpisMenesiai: z
    .number()
    .int()
    .min(1, 'Mažiausias laikotarpis – 1 mėnuo')
    .max(12, 'Didžiausias laikotarpis – 12 mėnesių')
    .default(1),
});

export type Employee = z.infer<typeof employeeSchema>;
