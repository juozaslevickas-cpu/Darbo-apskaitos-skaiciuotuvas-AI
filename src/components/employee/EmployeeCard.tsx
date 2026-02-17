'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Employee } from '@/models/employee';
import ConfirmDialog from '@/components/layout/ConfirmDialog';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
}

export default function EmployeeCard({ employee, onDelete }: EmployeeCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              {employee.vardas} {employee.pavarde}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{employee.pareigos}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {employee.etatas === 1 ? 'Pilnas' : `${(employee.etatas * 100).toFixed(0)}%`} etatas
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Savaitinė norma</span>
            <p className="font-medium text-slate-700">{employee.savaitineNorma} val.</p>
          </div>
          <div>
            <span className="text-slate-400">Apsk. laikotarpis</span>
            <p className="font-medium text-slate-700">
              {employee.apskaitinisLaikotarpisMenesiai} mėn.
            </p>
          </div>
          <div>
            <span className="text-slate-400">Sutartis nuo</span>
            <p className="font-medium text-slate-700">
              {employee.darboSutartiesPradzia}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/darbuotojai/${employee.id}`}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Redaguoti
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Trinti
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Ištrinti darbuotoją"
        message={`Ar tikrai norite ištrinti ${employee.vardas} ${employee.pavarde}? Šio veiksmo negalima atšaukti.`}
        confirmLabel="Ištrinti"
        cancelLabel="Atšaukti"
        variant="danger"
        onConfirm={() => {
          setShowConfirm(false);
          onDelete(employee.id);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
