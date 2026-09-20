import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const periodo = request.nextUrl.searchParams.get('periodo') || 'mes'; // dia, semana, mes
    const fechaInicio = request.nextUrl.searchParams.get('fechaInicio');
    const fechaFin = request.nextUrl.searchParams.get('fechaFin');
    const zona = request.nextUrl.searchParams.get('zona');
    const estado = request.nextUrl.searchParams.get('estado');
    const puerta = request.nextUrl.searchParams.get('puerta');
    const fechaDesde = request.nextUrl.searchParams.get('fechaDesde');
    const fechaHasta = request.nextUrl.searchParams.get('fechaHasta');

    // Calcular fechas si no se proporcionan
    const hoy = new Date();
    let inicio: Date;
    let fin: Date;

    const hayFiltroFecha = fechaDesde || fechaHasta || fechaInicio || fechaFin;

    if (fechaDesde) {
      const [año, mes, día] = fechaDesde.split('-').map(Number);
      inicio = new Date(año, mes - 1, día, 0, 0, 0, 0);
    } else if (fechaInicio) {
      inicio = new Date(fechaInicio);
    } else if (hayFiltroFecha) {
      // Si hay filtro de fecha pero no inicio, usar 1 del mes actual
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    } else {
      inicio = new Date();
    }

    if (fechaHasta) {
      const [año, mes, día] = fechaHasta.split('-').map(Number);
      fin = new Date(año, mes - 1, día, 23, 59, 59, 999);
    } else if (fechaFin) {
      fin = new Date(fechaFin);
    } else {
      fin = new Date();
    }

    // Si no hay filtro de fecha, calcular por período
    if (!hayFiltroFecha) {
      switch (periodo) {
        case 'dia':
          inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
          fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
          break;
        case 'semana':
          const primDia = hoy.getDate() - hoy.getDay() + 1;
          inicio = new Date(hoy);
          inicio.setDate(primDia);
          fin = new Date();
          break;
        case 'mes':
          inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          fin = new Date();
          break;
      }
    }

    // Construir condiciones de filtro
    const where: any = {
      fechaEntrada: {
        gte: inicio,
        lte: fin,
      },
    };

    if (zona) {
      where.zonaFranca = zona;
    }

    if (estado) {
      where.estado = estado;
    }

    if (puerta) {
      where.puerta = puerta;
    }

    // Obtener custodias en el período
    const custodias = await prisma.custodia.findMany({
      where,
      include: {
        items: true,
        salidas: true,
      },
    });

    // Agrupar por fecha - Entradas, Salidas, Parciales
    const datosPorFecha: Record<
      string,
      {
        fecha: string;
        entradas: number;
        salidas: number;
        parciales: number;
      }
    > = {};

    custodias.forEach((custodia) => {
      const fecha = custodia.fechaEntrada.toISOString().split('T')[0];

      if (!datosPorFecha[fecha]) {
        datosPorFecha[fecha] = {
          fecha,
          entradas: 0,
          salidas: 0,
          parciales: 0,
        };
      }

      // Contar entrada
      datosPorFecha[fecha].entradas++;

      // Contar salidas por estado
      if (custodia.estado === 'CERRADA') {
        datosPorFecha[fecha].salidas++;
      } else if (custodia.estado === 'PARCIAL') {
        datosPorFecha[fecha].parciales++;
      }
    });

    const datos = Object.values(datosPorFecha).sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return NextResponse.json({
      datos,
      periodo,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
