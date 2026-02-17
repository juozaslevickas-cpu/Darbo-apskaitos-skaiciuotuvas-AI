'use client';

import { useSettingsStore } from '@/store/settings-store';
import Header from '@/components/layout/Header';

export default function NustatymaiPage() {
  const settings = useSettingsStore();

  return (
    <>
      <Header title="Nustatymai" />
      <div className="p-6">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Bendri nustatymai
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Įmonės pavadinimas
              </label>
              <input
                type="text"
                value={settings.imonesVardas}
                onChange={(e) => settings.setSettings({ imonesVardas: e.target.value })}
                className="input"
                placeholder="UAB Pavyzdys"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Numatytoji pietų pertrauka (min.)
              </label>
              <input
                type="number"
                value={settings.defaultPietuPertrauka}
                onChange={(e) =>
                  settings.setSettings({ defaultPietuPertrauka: Number(e.target.value) })
                }
                className="input w-32"
                min={0}
                max={120}
              />
              <p className="mt-1 text-xs text-slate-500">
                Naudojama inicializuojant naują mėnesio grafiką (DK 122 str.: 30-120 min.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Numatytasis apskaitinis laikotarpis (mėn.)
              </label>
              <select
                value={settings.apskaitinisLaikotarpisMenesiai}
                onChange={(e) =>
                  settings.setSettings({
                    apskaitinisLaikotarpisMenesiai: Number(e.target.value),
                  })
                }
                className="input w-40"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 1 ? 'mėnuo' : m < 10 ? 'mėnesiai' : 'mėnesių'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                DK 115 str.: tipiniai variantai 1, 2, 3 arba iki 12 mėnesių
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
            <p className="text-xs font-medium text-blue-700">
              Nustatymai išsaugomi automatiškai.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
