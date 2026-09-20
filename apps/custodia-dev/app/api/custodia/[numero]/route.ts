import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const custodia = await prisma.custodia.findUnique({
      where: { numeroConsecutivo: numero },
      include: {
        items: true,
        contratista: true,
        ingreso: true,
        salidas: true,
      },
    });

    if (!custodia) {
      return NextResponse.json(
        { error: 'Custodia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(custodia);
  } catch (error) {
    console.error('Error en GET /api/custodia/[numero]:', error);
    return NextResponse.json(
      { error: 'Error obteniendo custodia' },
      { status: 500 }
    );
  }
}
