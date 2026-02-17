import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month - 1, d));
  }
  return days;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

const LT_HOLIDAYS: Array<[number, number]> = [
  [1, 1], [2, 16], [3, 11], [5, 1], [6, 24], [7, 6], [8, 15], [11, 1], [11, 2], [12, 24], [12, 25], [12, 26],
];

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const [hm, hd] of LT_HOLIDAYS) {
    if (month === hm && day === hd) return true;
  }

  const easter = getEasterDate(date.getFullYear());
  const easterMs = easter.getTime();
  const dateMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((dateMs - easterMs) / (1000 * 60 * 60 * 24));
  if (diffDays === 0 || diffDays === 1) return true;

  return false;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { employeeId, year, month, defaultPietuPertrauka = 60 } = body;

  if (!employeeId || !year || !month) {
    return NextResponse.json({ error: 'employeeId, year ir month privalomi' }, { status: 400 });
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const existing = await prisma.scheduleEntry.count({
    where: {
      darbuotojoId: employeeId,
      data: { gte: startDate, lt: endDate },
    },
  });

  if (existing > 0) {
    const entries = await prisma.scheduleEntry.findMany({
      where: {
        darbuotojoId: employeeId,
        data: { gte: startDate, lt: endDate },
      },
      orderBy: { data: 'asc' },
    });
    return NextResponse.json(entries);
  }

  const days = getMonthDays(year, month);
  const entries = days.map((day) => {
    const dateStr = formatDate(day);
    const holiday = isHoliday(day);
    const weekday = isWeekday(day);

    let tipas = 'DARBAS';
    if (holiday) {
      tipas = 'SVENTE';
    } else if (!weekday) {
      tipas = 'POILSIS';
    }

    return {
      id: uuidv4(),
      darbuotojoId: employeeId,
      data: dateStr,
      tipas,
      pamainosPradzia: null,
      pamainosPabaiga: null,
      pietuPertraukaMin: tipas === 'DARBAS' ? defaultPietuPertrauka : 0,
      neatvykimoKodas: null,
      pastaba: null,
    };
  });

  await prisma.scheduleEntry.createMany({ data: entries });

  const created = await prisma.scheduleEntry.findMany({
    where: {
      darbuotojoId: employeeId,
      data: { gte: startDate, lt: endDate },
    },
    orderBy: { data: 'asc' },
  });

  return NextResponse.json(created, { status: 201 });
}
