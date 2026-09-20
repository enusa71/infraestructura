import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const cedula = req.nextUrl.searchParams.get('cedula');

  if (!cedula) {
    return NextResponse.json({ success: false, error: 'Cédula requerida' }, { status: 400 });
  }

  try {
    const contratista = await prisma.contratista.findUnique({
      where: { cedula },
    });

    if (!contratista) {
      return NextResponse.json({ success: false, contratista: null });
    }

    return NextResponse.json({ success: true, contratista });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error buscando contratista' }, { status: 500 });
  }
}
