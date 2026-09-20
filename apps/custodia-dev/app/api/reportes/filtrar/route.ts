import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const zona = searchParams.get('zona');
    const estado = searchParams.get('estado');
    const puerta = searchParams.get('puerta');

    // Construir condiciones de filtro
    const where: any = {};

    if (fechaDesde || fechaHasta) {
      where.fechaEntrada = {};

      if (fechaDesde) {
        const [año, mes, día] = fechaDesde.split('-').map(Number);
        const desde = new Date(año, mes - 1, día, 0, 0, 0, 0);
        where.fechaEntrada.gte = desde;
      }

      if (fechaHasta) {
        const [año, mes, día] = fechaHasta.split('-').map(Number);
        const hasta = new Date(año, mes - 1, día, 23, 59, 59, 999);
        where.fechaEntrada.lte = hasta;
      }
    }

    if (zona && zona !== '') {
      where.zonaFranca = zona;
    }

    if (estado && estado !== '') {
      where.estado = estado;
    }

    if (puerta && puerta !== '') {
      where.puerta = puerta;
    }

    // Obtener custodias con filtros
    const custodias = await prisma.custodia.findMany({
      where,
      select: {
        id: true,
        numeroConsecutivo: true,
        contratista: {
          select: {
            nombre: true,
            cedula: true,
          },
        },
        zonaFranca: true,
        fechaEntrada: true,
        estado: true,
      },
      orderBy: { fechaEntrada: 'desc' },
    });

    // Calcular estadísticas
    const totalCustodias = await prisma.custodia.count({ where });
    const custodiasActivas = await prisma.custodia.count({ where: { ...where, estado: 'ACTIVA' } });
    const custodiasCerradas = await prisma.custodia.count({ where: { ...where, estado: 'CERRADA' } });
    const custodiasParciales = await prisma.custodia.count({ where: { ...where, estado: 'PARCIAL' } });

    return NextResponse.json({
      stats: {
        totalCustodias,
        custodiasActivas,
        custodiasCerradas,
        custodiasParciales,
      },
      custodias: custodias.map((c) => ({
        ...c,
        fechaEntrada: c.fechaEntrada.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error en filtrado:', error);
    return NextResponse.json(
      { error: 'Error al filtrar custodias' },
      { status: 500 }
    );
  }
}
