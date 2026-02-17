'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEmployeeStore } from '@/store/employee-store';
import { useToastStore } from '@/store/toast-store';
import EmployeeForm from '@/components/employee/EmployeeForm';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function RedaguotiDarbuotojaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const employee = useEmployeeStore((s) => s.getEmployee(id));
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const addToast = useToastStore((s) => s.addToast);

  if (!employee) {
    return (
      <>
        <Header title="Darbuotojas nerastas" />
        <div className="p-6 text-center">
          <p className="text-slate-500">Darbuotojas su tokiu ID nerastas.</p>
          <Link
            href="/darbuotojai"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Grįžti
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`${employee.vardas} ${employee.pavarde}`}>
        <Link
          href="/darbuotojai"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Atgal
        </Link>
      </Header>

      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <EmployeeForm
            initial={employee}
            submitLabel="Atnaujinti"
            onSubmit={async (data) => {
              try {
                await updateEmployee(id, data);
                addToast('Darbuotojas atnaujintas');
                router.push('/darbuotojai');
              } catch {
                addToast('Nepavyko atnaujinti darbuotojo', 'error');
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
