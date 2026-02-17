'use client';

import { useState } from 'react';
import type { Employee } from '@/models/employee';

interface EmployeeFormProps {
  initial?: Partial<Employee>;
  onSubmit: (data: Omit<Employee, 'id'>) => void;
  submitLabel?: string;
}

const ETATAS_OPTIONS = [
  { value: 0.25, label: '0,25' },
  { value: 0.5, label: '0,50' },
  { value: 0.75, label: '0,75' },
  { value: 1.0, label: '1,00' },
];

export default function EmployeeForm({
  initial,
  onSubmit,
  submitLabel = 'Išsaugoti',
}: EmployeeFormProps) {
  const [vardas, setVardas] = useState(initial?.vardas ?? '');
  const [pavarde, setPavarde] = useState(initial?.pavarde ?? '');
  const [pareigos, setPareigos] = useState(initial?.pareigos ?? '');
  const [etatas, setEtatas] = useState(initial?.etatas ?? 1.0);
  const [savaitineNorma, setSavaitineNorma] = useState(initial?.savaitineNorma ?? 40);
  const [darboSutartiesPradzia, setDarboSutartiesPradzia] = useState(
    initial?.darboSutartiesPradzia ?? new Date().toISOString().split('T')[0]
  );
  const [apskaitinisLaikotarpis, setApskaitinisLaikotarpis] = useState(
    initial?.apskaitinisLaikotarpisMenesiai ?? 1
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!vardas.trim()) newErrors.vardas = 'Vardas privalomas';
    if (!pavarde.trim()) newErrors.pavarde = 'Pavardė privaloma';
    if (!pareigos.trim()) newErrors.pareigos = 'Pareigos privalomos';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(darboSutartiesPradzia)) {
      newErrors.darboSutartiesPradzia = 'Formatas turi būti YYYY-MM-DD';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      vardas: vardas.trim(),
      pavarde: pavarde.trim(),
      pareigos: pareigos.trim(),
      etatas,
      savaitineNorma,
      darboSutartiesPradzia,
      sumineApskaita: true,
      apskaitinisLaikotarpisMenesiai: apskaitinisLaikotarpis,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Vardas" error={errors.vardas}>
          <input
            type="text"
            value={vardas}
            onChange={(e) => setVardas(e.target.value)}
            className="input"
            placeholder="Jonas"
          />
        </Field>
        <Field label="Pavardė" error={errors.pavarde}>
          <input
            type="text"
            value={pavarde}
            onChange={(e) => setPavarde(e.target.value)}
            className="input"
            placeholder="Jonaitis"
          />
        </Field>
      </div>

      <Field label="Pareigos" error={errors.pareigos}>
        <input
          type="text"
          value={pareigos}
          onChange={(e) => setPareigos(e.target.value)}
          className="input"
          placeholder="Operatorius"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Etatas">
          <select
            value={etatas}
            onChange={(e) => setEtatas(parseFloat(e.target.value))}
            className="input"
          >
            {ETATAS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Savaitinė norma (val.)">
          <input
            type="number"
            value={savaitineNorma}
            onChange={(e) => setSavaitineNorma(Number(e.target.value))}
            className="input"
            min={1}
            max={40}
          />
        </Field>

        <Field label="Apskaitinis laikotarpis (mėn.)">
          <select
            value={apskaitinisLaikotarpis}
            onChange={(e) => setApskaitinisLaikotarpis(Number(e.target.value))}
            className="input"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m} {m === 1 ? 'mėnuo' : m < 10 ? 'mėnesiai' : 'mėnesių'}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Darbo sutarties pradžia" error={errors.darboSutartiesPradzia}>
        <input
          type="date"
          value={darboSutartiesPradzia}
          onChange={(e) => setDarboSutartiesPradzia(e.target.value)}
          className="input"
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
