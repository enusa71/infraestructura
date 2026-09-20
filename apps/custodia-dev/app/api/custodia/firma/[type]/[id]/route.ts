import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;

    if (type === 'salida') {
      const salida = await prisma.custodiaSalida.findUnique({
        where: { id },
      });

      if (!salida) {
        return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
      }

      const firmaBase64 = request.nextUrl.searchParams.get('tipo') === 'auxiliar'
        ? salida.firmaAuxiliarDatos
        : salida.firmaRetiraDatos;

      if (!firmaBase64) {
        return NextResponse.json({ error: 'Sin firma' }, { status: 404 });
      }

      // Convertir base64 a buffer
      const buffer = Buffer.from(firmaBase64, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (type === 'ingreso') {
      const ingreso = await prisma.custodiaIngreso.findUnique({
        where: { id },
      });

      if (!ingreso) {
        return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
      }

      const firmaBase64 = ingreso.firmaAuxiliarBase64;

      if (!firmaBase64) {
        return NextResponse.json({ error: 'Sin firma' }, { status: 404 });
      }

      // Convertir base64 a buffer
      const buffer = Buffer.from(firmaBase64, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (error) {
    console.error('Error sirviendo firma:', error);
    return NextResponse.json({ error: 'Error sirviendo firma' }, { status: 500 });
  }
}
