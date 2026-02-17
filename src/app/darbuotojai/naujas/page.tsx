'use client';

import { useRouter } from 'next/navigation';
import { useEmployeeStore } from '@/store/employee-store';
import { useToastStore } from '@/store/toast-store';
import EmployeeForm from '@/components/employee/EmployeeForm';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function NaujasDarbuotojasPage() {
  const router = useRouter();
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const addToast = useToastStore((s) => s.addToast);

  return (
    <>
      <Header title="Naujas darbuotojas">
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
            submitLabel="Sukurti darbuotoją"
            onSubmit={(data) => {
              addEmployee(data);
              addToast('Darbuotojas sukurtas');
              router.push('/darbuotojai');
            }}
          />
        </div>
      </div>
    </>
  );
}
