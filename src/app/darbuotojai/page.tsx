'use client';

import Link from 'next/link';
import { useEmployeeStore } from '@/store/employee-store';
import { useToastStore } from '@/store/toast-store';
import EmployeeCard from '@/components/employee/EmployeeCard';
import Header from '@/components/layout/Header';

export default function DarbuotojaiPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const deleteEmployee = useEmployeeStore((s) => s.deleteEmployee);
  const addToast = useToastStore((s) => s.addToast);

  return (
    <>
      <Header title="Darbuotojai">
        <Link
          href="/darbuotojai/naujas"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Pridėti darbuotoją
        </Link>
      </Header>

      <div className="p-6">
        {employees.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900">
              Nėra darbuotojų
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Pradėkite pridėdami pirmą darbuotoją
            </p>
            <Link
              href="/darbuotojai/naujas"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Pridėti darbuotoją
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onDelete={(id) => {
                  deleteEmployee(id);
                  addToast('Darbuotojas ištrintas');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
