import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generarHTMLFormatoCustodia } from '@/lib/gotenberg';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  try {
    const { numero } = await params;

    // Buscar custodia con todas las relaciones
    const custodia = await prisma.custodia.findUnique({
      where: { numeroConsecutivo: numero },
      include: {
        contratista: true,
        items: {
          include: { herramienta: true },
        },
        ingreso: true,
        salidas: {
          include: {
            items: {
              include: {
                item: {
                  include: { herramienta: true },
                },
              },
            },
          },
          orderBy: { fechaSalida: 'desc' },
        },
      },
    });

    if (!custodia) {
      return NextResponse.json(
        { error: 'Custodia no encontrada' },
        { status: 404 }
      );
    }

    // Preparar salidas en orden cronológico (más antigua primero)
    const salidas = custodia.salidas
      .map((s: any, index: number) => ({
        id: s.id,
        numeroSalida: index + 1,
        fechaSalida: s.fechaSalida,
        nombreRetira: s.nombreRetira,
        cedulaRetira: s.cedulaRetira,
        empresaRetira: s.empresaRetira,
        auxiliarNombre: s.auxiliarNombre,
        auxiliarCedula: s.auxiliarCedula,
        puerta: custodia.puerta,
        esParcial: s.esParcial,
        items: s.items,
        firmaRetiraDatos: s.firmaRetiraDatos || '',
        firmaAuxiliarDatos: s.firmaAuxiliarDatos || '',
      }))
      .reverse();

    // Generar HTML profesional
    const html = generarHTMLFormatoCustodia({
      numeroConsecutivo: custodia.numeroConsecutivo,
      fechaEntrada: custodia.fechaEntrada,
      horaEntrada: custodia.fechaEntrada,
      zonaFranca: custodia.zonaFranca,
      puerta: custodia.puerta,
      placa: custodia.placa,
      contratista: {
        nombre: custodia.contratista.nombre,
        cedula: custodia.contratista.cedula,
        empresa: custodia.contratista.empresa,
      },
      itemsEntrada: custodia.items,
      firmaEntradaAuxiliar: custodia.ingreso?.firmaAuxiliarDatos || '',
      ingresoId: custodia.ingreso?.id,
      salidas: salidas,
    });

    // Retornar HTML como text/html
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error en endpoint HTML:', error);
    return NextResponse.json(
      { error: 'Error generando HTML' },
      { status: 500 }
    );
  }
}
