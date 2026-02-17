import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '');
  const month = parseInt(searchParams.get('month') || '');

  if (!year || !month) {
    return NextResponse.json({ error: 'year ir month parametrai privalomi' }, { status: 400 });
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      darbuotojoId: employeeId,
      data: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: { data: 'asc' },
  });

  return NextResponse.json(entries);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;

  await prisma.scheduleEntry.deleteMany({
    where: { darbuotojoId: employeeId },
  });

  return NextResponse.json({ success: true });
}
