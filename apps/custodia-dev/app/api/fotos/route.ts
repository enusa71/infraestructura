import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { guardarFoto, leerFoto } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST: Guardar foto
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { dataUrl, custodiaId, tipo } = data;

    if (!dataUrl || !custodiaId || !tipo) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Guardar foto en almacenamiento
    const filename = await guardarFoto(dataUrl, custodiaId, tipo);

    // Registrar en BD según tipo
    if (tipo === 'contratista' || tipo === 'grupo') {
      await prisma.custodiaIngreso.upsert({
        where: { custodiaId },
        create: {
          custodiaId,
          [tipo === 'contratista' ? 'fotoContratista' : 'fotoGrupoHerramientas']: filename,
        },
        update: {
          [tipo === 'contratista' ? 'fotoContratista' : 'fotoGrupoHerramientas']: filename,
        },
      });
    } else if (tipo === 'herramienta') {
      // Actualizar foto de herramienta en items
      const custodia = await prisma.custodia.findUnique({
        where: { id: custodiaId },
        include: { items: true },
      });

      if (custodia && custodia.items.length > 0) {
        const item = custodia.items[0];
        await prisma.custodiaItem.update({
          where: { id: item.id },
          data: { fotoUrl: filename },
        });
      }
    } else if (tipo === 'salida') {
      // Crear registro de salida con foto
      const salida = await prisma.custodiaSalida.findFirst({
        where: { custodiaId },
        orderBy: { createdAt: 'desc' },
      });

      if (salida) {
        await prisma.custodiaSalida.update({
          where: { id: salida.id },
          data: { fotoSalida: filename },
        });
      }
    }

    return NextResponse.json({
      success: true,
      filename,
      url: `/api/fotos/${custodiaId}/${filename}`,
    });
  } catch (error) {
    console.error('Error en POST /api/fotos:', error);
    return NextResponse.json(
      { error: 'Error guardando foto' },
      { status: 500 }
    );
  }
}

// GET: Descargar foto
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const filename = request.nextUrl.searchParams.get('filename');
    if (!filename) {
      return NextResponse.json({ error: 'Filename requerido' }, { status: 400 });
    }

    const buffer = await leerFoto(filename);

    // @ts-ignore
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/fotos:', error);
    return NextResponse.json(
      { error: 'Foto no encontrada' },
      { status: 404 }
    );
  }
}
