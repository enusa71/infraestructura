import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { filtro, tipoFiltro, estado } = await req.json();

    let where: any = {};

    if (filtro) {
      if (tipoFiltro === 'numero') {
        where.numeroConsecutivo = { contains: filtro, mode: 'insensitive' };
      } else if (tipoFiltro === 'cedula') {
        where.contratista = { is: { cedula: { equals: filtro } } };
      } else if (tipoFiltro === 'nombre') {
        where.contratista = { is: { nombre: { contains: filtro, mode: 'insensitive' } } };
      }
    }

    if (estado) {
      where.estado = estado;
    }

    const custodias = await prisma.custodia.findMany({
      where,
      include: {
        contratista: true,
        items: {
          include: { herramienta: true },
        },
        salidas: {
          include: { items: true },
          orderBy: { fechaSalida: 'desc' },
        },
      },
      orderBy: { fechaEntrada: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, custodias });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json({ success: false, error: 'Error en búsqueda' }, { status: 500 });
  }
}
