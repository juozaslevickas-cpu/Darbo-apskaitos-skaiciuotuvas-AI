import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScheduleEntry } from '@/models/schedule-entry';
import type { Employee } from '@/models/employee';
import { getDaysInMonthCount, getMonthNameLT } from '@/utils/date-utils';
import { calculateShiftDuration } from '@/services/shift-calculator';
import { calculateNightMinutes } from '@/services/night-calculator';
import { hoursToDisplay } from '@/utils/format-utils';

/**
 * Generuoja žiniaraščio PDF failą (A4 landscape).
 * 3 eilutės per darbuotoją: dirbta/neatvykimai, nukrypimai, neatvykimai kaip darbas.
 */
export function exportTimesheetPDF(
  entries: ScheduleEntry[],
  employee: Employee,
  year: number,
  month: number,
  companyName: string = ''
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const daysInMonth = getDaysInMonthCount(year, month);
  const monthName = getMonthNameLT(month);

  doc.setFontSize(12);
  doc.text(
    companyName || 'Darbo laiko apskaitos žiniaraštis',
    14,
    15
  );
  doc.setFontSize(10);
  doc.text(`${year} m. ${monthName}`, 14, 22);
  doc.text(`${employee.vardas} ${employee.pavarde} | ${employee.pareigos} | Etatas: ${employee.etatas}`, 14, 28);

  const entryByDay: Record<number, ScheduleEntry> = {};
  for (const e of entries) {
    const day = parseInt(e.data.split('-')[2], 10);
    entryByDay[day] = e;
  }

  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const columns = ['Eilutė', ...dayHeaders, 'Iš viso'];

  let totalWorked = 0;
  let totalNight = 0;

  const row1: string[] = ['1. Dirbta/neatv.'];
  const row2: string[] = ['2. Nukrypimai'];
  const row3: string[] = ['3. Neatv.=darbas'];

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = entryByDay[d];
    if (!entry) {
      row1.push('');
      row2.push('');
      row3.push('');
      continue;
    }

    const worked = calculateShiftDuration(entry);
    const night = calculateNightMinutes(entry);
    totalWorked += worked;
    totalNight += night;

    if (entry.tipas === 'DARBAS' && worked > 0) {
      row1.push(hoursToDisplay(worked));
    } else if (entry.tipas === 'POILSIS') {
      row1.push('P');
    } else if (entry.tipas === 'SVENTE') {
      row1.push('S');
    } else {
      row1.push(entry.tipas);
    }

    row2.push(night > 0 ? `DN ${hoursToDisplay(night)}` : '');
    row3.push('');
  }

  row1.push(hoursToDisplay(totalWorked));
  row2.push(totalNight > 0 ? `DN ${hoursToDisplay(totalNight)}` : '');
  row3.push('');

  autoTable(doc, {
    startY: 34,
    head: [columns],
    body: [row1, row2, row3],
    styles: { fontSize: 6, cellPadding: 1.5, halign: 'center' },
    headStyles: { fillColor: [71, 85, 105], fontSize: 6 },
    columnStyles: { 0: { halign: 'left', cellWidth: 28 } },
    theme: 'grid',
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.text(
    `Sugeneruota: ${new Date().toISOString().split('T')[0]}`,
    14,
    pageHeight - 8
  );

  doc.save(`ziniarastis_${employee.pavarde}_${year}_${String(month).padStart(2, '0')}.pdf`);
}
