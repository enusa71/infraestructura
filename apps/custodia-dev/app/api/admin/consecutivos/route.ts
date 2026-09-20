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

    // Verificar si el usuario es supervisor (debería tener acceso a admin)
    const configuraciones = await prisma.configuracionConsecutivo.findMany({
      orderBy: { zona: 'asc' },
    });

    return NextResponse.json({
      success: true,
      configuraciones,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { zona, proximoNumero } = await request.json();

    if (!zona || !proximoNumero || proximoNumero < 1) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Actualizar la configuración
    const actualizado = await prisma.configuracionConsecutivo.update({
      where: { zona },
      data: {
        proximoNumero,
        actualizadoPor: session.user.email || 'SISTEMA',
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        table: 'ConfiguracionConsecutivo',
        action: 'ACTUALIZAR_CONSECUTIVO',
        recordId: actualizado.id,
        changes: {
          zona,
          nuevoProximoNumero: proximoNumero,
        },
        userId: session.user.id || 'SISTEMA',
        userEmail: session.user.email || 'sistema@custodia.local',
      },
    });

    return NextResponse.json({
      success: true,
      configuracion: actualizado,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar' },
      { status: 500 }
    );
  }
}
