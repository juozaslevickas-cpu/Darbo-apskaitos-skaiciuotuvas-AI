import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getOrCreateSettings() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      imonesVardas: '',
      defaultPietuPertrauka: 60,
      apskaitinisLaikotarpisMenesiai: 1,
    },
  });
  return settings;
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();

  await getOrCreateSettings();

  const settings = await prisma.settings.update({
    where: { id: 1 },
    data: {
      ...(body.imonesVardas !== undefined && { imonesVardas: body.imonesVardas }),
      ...(body.defaultPietuPertrauka !== undefined && { defaultPietuPertrauka: body.defaultPietuPertrauka }),
      ...(body.apskaitinisLaikotarpisMenesiai !== undefined && { apskaitinisLaikotarpisMenesiai: body.apskaitinisLaikotarpisMenesiai }),
    },
  });

  return NextResponse.json(settings);
}
