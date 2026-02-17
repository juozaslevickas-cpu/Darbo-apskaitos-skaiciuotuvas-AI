import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return NextResponse.json({ error: 'Darbuotojas nerastas' }, { status: 404 });
  }

  return NextResponse.json(employee);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(body.vardas !== undefined && { vardas: body.vardas.trim() }),
        ...(body.pavarde !== undefined && { pavarde: body.pavarde.trim() }),
        ...(body.pareigos !== undefined && { pareigos: body.pareigos.trim() }),
        ...(body.etatas !== undefined && { etatas: body.etatas }),
        ...(body.savaitineNorma !== undefined && { savaitineNorma: body.savaitineNorma }),
        ...(body.darboSutartiesPradzia !== undefined && { darboSutartiesPradzia: body.darboSutartiesPradzia }),
        ...(body.sumineApskaita !== undefined && { sumineApskaita: body.sumineApskaita }),
        ...(body.apskaitinisLaikotarpisMenesiai !== undefined && { apskaitinisLaikotarpisMenesiai: body.apskaitinisLaikotarpisMenesiai }),
      },
    });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: 'Darbuotojas nerastas' }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Darbuotojas nerastas' }, { status: 404 });
  }
}
