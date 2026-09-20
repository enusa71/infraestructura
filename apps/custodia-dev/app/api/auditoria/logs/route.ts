import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { filtro, accion } = await req.json();

    let where: any = {};

    if (filtro) {
      where.recordId = { contains: filtro, mode: 'insensitive' };
    }

    if (accion) {
      where.action = accion;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error obtienendo logs:', error);
    return NextResponse.json(
      { success: false, error: 'Error obteniendo registros de auditoría' },
      { status: 500 }
    );
  }
}
