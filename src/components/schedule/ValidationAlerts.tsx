'use client';

import type { ValidationAlert } from '@/models/validation-alert';

interface ValidationAlertsProps {
  alerts: ValidationAlert[];
}

export default function ValidationAlerts({ alerts }: ValidationAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-medium text-emerald-700">
          Pažeidimų nerasta
        </p>
      </div>
    );
  }

  const klaidos = alerts.filter((a) => a.tipas === 'KLAIDA');
  const ispejimai = alerts.filter((a) => a.tipas === 'ISPEJIMAS');

  return (
    <div className="space-y-3">
      {klaidos.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            Klaidos ({klaidos.length})
          </h4>
          <ul className="space-y-1.5">
            {klaidos.map((alert, i) => (
              <li key={`err-${i}`} className="text-sm text-red-700">
                <span className="font-medium">{alert.kodas}</span>: {alert.pranesimas}
                <span className="ml-1 text-red-500 text-xs">({alert.dkStraipsnis})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ispejimai.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">
            Įspėjimai ({ispejimai.length})
          </h4>
          <ul className="space-y-1.5">
            {ispejimai.map((alert, i) => (
              <li key={`warn-${i}`} className="text-sm text-amber-700">
                <span className="font-medium">{alert.kodas}</span>: {alert.pranesimas}
                <span className="ml-1 text-amber-500 text-xs">({alert.dkStraipsnis})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
