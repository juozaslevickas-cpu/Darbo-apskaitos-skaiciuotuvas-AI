import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  const body = await request.json();

  const { id, darbuotojoId, data, tipas, pamainosPradzia, pamainosPabaiga, pietuPertraukaMin, neatvykimoKodas, pastaba } = body;

  if (!darbuotojoId || !data || !tipas) {
    return NextResponse.json({ error: 'darbuotojoId, data ir tipas privalomi' }, { status: 400 });
  }

  const entry = await prisma.scheduleEntry.upsert({
    where: {
      darbuotojoId_data: {
        darbuotojoId,
        data,
      },
    },
    update: {
      tipas,
      pamainosPradzia: pamainosPradzia ?? null,
      pamainosPabaiga: pamainosPabaiga ?? null,
      pietuPertraukaMin: pietuPertraukaMin ?? 60,
      neatvykimoKodas: neatvykimoKodas ?? null,
      pastaba: pastaba ?? null,
    },
    create: {
      id: id ?? undefined,
      darbuotojoId,
      data,
      tipas,
      pamainosPradzia: pamainosPradzia ?? null,
      pamainosPabaiga: pamainosPabaiga ?? null,
      pietuPertraukaMin: pietuPertraukaMin ?? 60,
      neatvykimoKodas: neatvykimoKodas ?? null,
      pastaba: pastaba ?? null,
    },
  });

  return NextResponse.json(entry);
}
