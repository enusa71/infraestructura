'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SalidaSchema = z.object({
  custodiaId: z.string(),
  cantidades: z.record(z.string(), z.number()),
});

type SalidaInput = z.infer<typeof SalidaSchema>;

export async function confirmarSalida(data: SalidaInput) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('No autorizado');
    }

    const validado = SalidaSchema.parse(data);

    // Obtener custodia
    const custodia = await prisma.custodia.findUnique({
      where: { id: validado.custodiaId },
      include: { items: true },
    });

    if (!custodia) {
      throw new Error('Custodia no encontrada');
    }

    if (custodia.estado !== 'ACTIVA' && custodia.estado !== 'PARCIAL') {
      throw new Error('Custodia ya está cerrada');
    }

    // Calcular totales
    const totalIngresado = custodia.items.reduce((sum: number, item: any) => sum + item.cantidad, 0);
    const totalSalida = Object.values(validado.cantidades).reduce((a: any, b: any) => a + b, 0);
    const esParcial = totalSalida < totalIngresado;

    // Registrar salida
    const salida = await prisma.custodiaSalida.create({
      data: {
        custodiaId: validado.custodiaId,
        esParcial,
        guardiaCedula: session.user.id || '',
        guardiaNombre: session.user.email || 'Sistema',
      },
    });

    // Actualizar estado custodia
    await prisma.custodia.update({
      where: { id: validado.custodiaId },
      data: {
        estado: esParcial ? 'PARCIAL' : 'CERRADA',
        fechaSalida: new Date(),
      },
    });

    // Registrar en AuditLog
    await prisma.auditLog.create({
      data: {
        table: 'CustodiaSalida',
        action: 'CREATE',
        recordId: salida.id,
        userId: session.user.id,
        userEmail: session.user.email,
        changes: {
          custodiaId: validado.custodiaId,
          cantidadSalida: totalSalida,
          esParcial,
        },
      },
    });

    return {
      success: true,
      salidaId: salida.id,
      estado: esParcial ? 'PARCIAL' : 'CERRADA',
    };
  } catch (error) {
    console.error('Error confirmando salida:', error);
    throw error;
  }
}

export async function buscarCustodiaPorNumero(numero: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('No autorizado');
    }

    const custodia = await prisma.custodia.findUnique({
      where: { numeroConsecutivo: numero },
      include: {
        items: true,
        contratista: true,
        ingreso: true,
      },
    });

    if (!custodia) {
      throw new Error('Custodia no encontrada');
    }

    return custodia;
  } catch (error) {
    console.error('Error buscando custodia:', error);
    throw error;
  }
}
