import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { vardas, pavarde, pareigos, etatas, savaitineNorma, darboSutartiesPradzia, sumineApskaita, apskaitinisLaikotarpisMenesiai } = body;

  if (!vardas?.trim() || !pavarde?.trim() || !pareigos?.trim()) {
    return NextResponse.json({ error: 'Vardas, pavardė ir pareigos privalomi' }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: {
      vardas: vardas.trim(),
      pavarde: pavarde.trim(),
      pareigos: pareigos.trim(),
      etatas: etatas ?? 1.0,
      savaitineNorma: savaitineNorma ?? 40,
      darboSutartiesPradzia: darboSutartiesPradzia ?? new Date().toISOString().split('T')[0],
      sumineApskaita: sumineApskaita ?? true,
      apskaitinisLaikotarpisMenesiai: apskaitinisLaikotarpisMenesiai ?? 1,
    },
  });

  return NextResponse.json(employee, { status: 201 });
}
