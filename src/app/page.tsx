'use client';

import Link from 'next/link';
import { useEmployeeStore } from '@/store/employee-store';
import Header from '@/components/layout/Header';

export default function DashboardPage() {
  const employees = useEmployeeStore((s) => s.employees);

  return (
    <>
      <Header title="Pradžia" />
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Darbuotojai"
            value={employees.length.toString()}
            href="/darbuotojai"
            color="blue"
          />
          <StatCard
            label="Grafikas"
            value="Pildyti"
            href="/grafikas"
            color="emerald"
          />
          <StatCard
            label="Žiniaraštis"
            value="Peržiūrėti"
            href="/ziniarastis"
            color="violet"
          />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Greiti veiksmai
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              title="Pridėti darbuotoją"
              description="Sukurkite naują darbuotojo kortelę"
              href="/darbuotojai/naujas"
            />
            <ActionCard
              title="Pildyti grafiką"
              description="Įveskite darbo pamainų grafiką"
              href="/grafikas"
            />
            <ActionCard
              title="Peržiūrėti ataskaitas"
              description="Mėnesio balansas ir viršvalandžiai"
              href="/ataskaitos"
            />
          </div>
        </div>

        {employees.length === 0 && (
          <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              Nėra darbuotojų
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Pradėkite pridėdami pirmą darbuotoją
            </p>
            <Link
              href="/darbuotojai/naujas"
              className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Pridėti darbuotoją
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  href,
  color,
}: {
  label: string;
  value: string;
  href: string;
  color: 'blue' | 'emerald' | 'violet';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <Link
      href={href}
      className={`rounded-xl border p-6 transition-shadow hover:shadow-md ${colors[color]}`}
    >
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}

function ActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <h3 className="font-medium text-slate-900 group-hover:text-blue-700">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
