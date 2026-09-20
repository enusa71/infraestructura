import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generarPDFConGotenberg, generarHTMLFormatoCustodia } from '@/lib/gotenberg';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  try {
    const { numero } = await params;

    // 1. Buscar custodia
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

    // 2. Preparar salidas en orden cronológico (más antigua primero)
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
      .reverse(); // Orden cronológico: más antigua primero

    // 3. Generar HTML
    console.log('📸 DEBUG Firmas:', {
      entrada: custodia.ingreso?.firmaAuxiliarDatos ? 'SÍ' : 'NO',
      salida: salidas.map((s: any) => ({
        id: s.id,
        retira: s.firmaRetiraDatos ? `${s.firmaRetiraDatos.substring(0, 50)}...` : 'NO',
        auxiliar: s.firmaAuxiliarDatos ? `${s.firmaAuxiliarDatos.substring(0, 50)}...` : 'NO',
      })),
    });
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

    // 4. Generar PDF con Gotenberg
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generarPDFConGotenberg({
        html,
        nombreArchivo: `custodia_${numero}.pdf`,
      });
    } catch (err) {
      console.error('Error generando PDF:', err);
      // Si Gotenberg falla, retornar HTML como fallback
      return NextResponse.json(
        { error: 'Error generando PDF', html },
        { status: 500 }
      );
    }

    // 5. Guardar en R2 (simulado - en producción iría a Cloudflare R2)
    // Por ahora, retornar PDF directamente
    const pdfUrl = `/api/custodia/${numero}/pdf?format=download`;

    // 6. Guardar URL en BD si hay salidas
    if (custodia.salidas.length > 0) {
      const ultimaSalida = custodia.salidas[0];
      await prisma.custodiaSalida.update({
        where: { id: ultimaSalida.id },
        data: {
          pdfGenerado: pdfUrl,
        },
      });
    }

    // 7. Retornar PDF o URL según parámetro
    const format = request.nextUrl.searchParams.get('format');

    if (format === 'download') {
      // @ts-ignore
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="custodia_${numero}.pdf"`,
        },
      });
    } else {
      // Retornar URL para ver en navegador
      return NextResponse.json({
        success: true,
        pdfUrl,
        custodiaNumero: numero,
      });
    }
  } catch (error) {
    console.error('Error en endpoint PDF:', error);
    return NextResponse.json(
      { error: 'Error generando PDF' },
      { status: 500 }
    );
  }
}
