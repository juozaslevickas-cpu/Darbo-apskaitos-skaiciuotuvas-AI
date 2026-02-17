import ExcelJS from 'exceljs';
import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import { getDaysInMonthCount, getMonthNameLT } from '@/utils/date-utils';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculateNightMinutes } from '@/services/night-calculator';
import { calculateMonthlyBalance } from '@/services/balance';

/**
 * Generuoja žiniaraščio Excel failą.
 * Spalvinis kodavimas + suvestinės lapas.
 */
export async function exportTimesheetExcel(
  entries: ScheduleEntry[],
  employee: Employee,
  year: number,
  month: number,
  companyName: string = ''
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Darbo apskaita';
  wb.created = new Date();

  const daysInMonth = getDaysInMonthCount(year, month);
  const monthName = getMonthNameLT(month);

  const ws = wb.addWorksheet(`${monthName} ${year}`);

  ws.mergeCells('A1', `${colLetter(daysInMonth + 2)}1`);
  const titleCell = ws.getCell('A1');
  titleCell.value = companyName || 'Darbo laiko apskaitos žiniaraštis';
  titleCell.font = { bold: true, size: 14 };

  ws.mergeCells('A2', `${colLetter(daysInMonth + 2)}2`);
  const subtitleCell = ws.getCell('A2');
  subtitleCell.value = `${year} m. ${monthName} | ${employee.vardas} ${employee.pavarde} | Etatas: ${employee.etatas}`;
  subtitleCell.font = { size: 10, color: { argb: '666666' } };

  const headerRow = ws.getRow(4);
  headerRow.getCell(1).value = 'Eilutė';
  for (let d = 1; d <= daysInMonth; d++) {
    headerRow.getCell(d + 1).value = d;
  }
  headerRow.getCell(daysInMonth + 2).value = 'Iš viso';
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = thinBorder();
  });

  const entryByDay: Record<number, ScheduleEntry> = {};
  for (const e of entries) {
    const day = parseInt(e.data.split('-')[2], 10);
    entryByDay[day] = e;
  }

  let totalWorked = 0;
  let totalNight = 0;

  const rowLabels = ['1. Dirbta/neatv.', '2. Nukrypimai', '3. Neatv.=darbas'];

  for (let r = 0; r < 3; r++) {
    const row = ws.getRow(5 + r);
    row.getCell(1).value = rowLabels[r];
    row.getCell(1).font = { bold: true, size: 8 };

    for (let d = 1; d <= daysInMonth; d++) {
      const entry = entryByDay[d];
      const cell = row.getCell(d + 1);
      cell.alignment = { horizontal: 'center' };
      cell.font = { size: 8 };
      cell.border = thinBorder();

      if (!entry) continue;

      if (r === 0) {
        const worked = calculateShiftDuration(entry);
        const night = calculateNightMinutes(entry);
        totalWorked += worked;
        totalNight += night;

        if (entry.tipas === 'DARBAS' && worked > 0) {
          cell.value = +(worked / 60).toFixed(2);
          cell.numFmt = '0.00';
        } else if (entry.tipas === 'POILSIS') {
          cell.value = 'P';
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } };
        } else if (entry.tipas === 'SVENTE') {
          cell.value = 'S';
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        } else if (entry.tipas === 'A') {
          cell.value = 'A';
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        } else if (entry.tipas === 'L') {
          cell.value = 'L';
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } };
        } else {
          cell.value = entry.tipas;
        }
      } else if (r === 1) {
        const night = calculateNightMinutes(entry);
        if (night > 0) {
          cell.value = +(night / 60).toFixed(2);
          cell.numFmt = '0.00';
          cell.font = { size: 8, color: { argb: '7C3AED' } };
        }
      }
    }

    const totalCell = row.getCell(daysInMonth + 2);
    totalCell.font = { bold: true, size: 8 };
    totalCell.alignment = { horizontal: 'center' };
    totalCell.border = thinBorder();

    if (r === 0) totalCell.value = +(totalWorked / 60).toFixed(2);
    if (r === 1 && totalNight > 0) totalCell.value = +(totalNight / 60).toFixed(2);
  }

  ws.getColumn(1).width = 18;
  for (let d = 1; d <= daysInMonth; d++) {
    ws.getColumn(d + 1).width = 5.5;
  }
  ws.getColumn(daysInMonth + 2).width = 10;

  const summaryWs = wb.addWorksheet('Suvestinė');
  const balance = calculateMonthlyBalance(entries, employee, year, month);

  const summaryData = [
    ['Darbuotojas', `${employee.vardas} ${employee.pavarde}`],
    ['Pareigos', employee.pareigos],
    ['Etatas', employee.etatas],
    ['Mėnuo', `${year}-${String(month).padStart(2, '0')}`],
    [''],
    ['Mėnesio norma (val.)', +(balance.menesioNorma / 60).toFixed(2)],
    ['Faktiškai dirbta (val.)', +(balance.faktiskaiDirbta / 60).toFixed(2)],
    ['Skirtumas (val.)', +(balance.skirtumas / 60).toFixed(2)],
    ['Nakties valandos', +(balance.naktiesValandos / 60).toFixed(2)],
    ['Darbas poilsio d.', +(balance.darbasPoilsioDienomis / 60).toFixed(2)],
    ['Darbas švenčių d.', +(balance.darbasSvenciu / 60).toFixed(2)],
    ['Viršvalandžiai', +(balance.virsvalandziai / 60).toFixed(2)],
  ];

  summaryData.forEach((row, i) => {
    const wsRow = summaryWs.getRow(i + 1);
    wsRow.getCell(1).value = row[0] as string;
    if (row[1] !== undefined) wsRow.getCell(2).value = row[1];
    wsRow.getCell(1).font = { bold: true };
  });

  summaryWs.getColumn(1).width = 25;
  summaryWs.getColumn(2).width = 20;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ziniarastis_${employee.pavarde}_${year}_${String(month).padStart(2, '0')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

function colLetter(n: number): string {
  let s = '';
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const thin: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'E2E8F0' } };
  return { top: thin, bottom: thin, left: thin, right: thin };
}
