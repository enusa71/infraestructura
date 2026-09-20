import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const custodias = await prisma.custodia.findMany({
      include: {
        items: true,
        salidas: {
          include: { items: true },
        },
      },
    });

    const totalCustodias = custodias.length;
    const totalHerramientas = await prisma.custodiaItem.count();

    let custodiasActivas = 0;
    let custodiasCerradas = 0;
    let custodiasParciales = 0;

    custodias.forEach((custodia: any) => {
      const cantidadSalidaTotal = (custodia.salidas || []).reduce((total: number, salida: any) => {
        return total + ((salida.items || []).reduce((sum: number, item: any) => sum + item.cantidadSalida, 0));
      }, 0);
      const cantidadIngresada = (custodia.items || []).reduce((total: number, item: any) => total + item.cantidad, 0);
      const pendientes = cantidadIngresada - cantidadSalidaTotal;

      if (pendientes === 0) {
        custodiasCerradas++;
      } else if (pendientes > 0 && pendientes < cantidadIngresada) {
        custodiasParciales++;
      } else if (pendientes === cantidadIngresada) {
        custodiasActivas++;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalCustodias,
        custodiasActivas,
        custodiasCerradas,
        custodiasParciales,
        totalHerramientas,
      },
    });
  } catch (error) {
    console.error('Error en estadísticas:', error);
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({
      success: false,
      error: 'Error cargando estadísticas',
      details: errorMsg
    }, { status: 500 });
  }
}
