'use client';

import { useMemo } from 'react';
import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import type { ValidationAlert } from '@/models/validation-alert';
import { validateSchedule } from '@/services/validation';

/**
 * Hook: realaus laiko grafiko validacija.
 * Grąžina validacijos pranešimus, klaidas ir įspėjimus.
 */
export function useScheduleValidation(
  entries: ScheduleEntry[],
  employee: Employee | undefined
) {
  const alerts = useMemo<ValidationAlert[]>(() => {
    if (!employee || entries.length === 0) return [];
    return validateSchedule(entries, employee);
  }, [entries, employee]);

  const klaidos = useMemo(
    () => alerts.filter((a) => a.tipas === 'KLAIDA'),
    [alerts]
  );

  const ispejimai = useMemo(
    () => alerts.filter((a) => a.tipas === 'ISPEJIMAS'),
    [alerts]
  );

  return { alerts, klaidos, ispejimai };
}
