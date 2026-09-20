'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generarSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function obtenerOGuardarAuxiliar() {
  try {
    // Intentar obtener email de la sesión
    let userEmail = '';
    try {
      const session = await auth();
      userEmail = session?.user?.email || '';
    } catch (err) {
      // Si falla, continuamos sin email
    }

    // Si no hay email de sesión, generar uno genérico (para tablets compartidas)
    if (!userEmail) {
      userEmail = `auxiliar_${generarSessionId()}@custodia.local`;
    }

    // Buscar si el auxiliar ya existe
    let auxiliar = await prisma.auxiliarSeguridad.findUnique({
      where: { userEmail },
    });

    // Si no existe, crear uno vacío
    if (!auxiliar) {
      auxiliar = await prisma.auxiliarSeguridad.create({
        data: {
          userEmail,
          nombre: '',
          cedula: '',
          firmaBase64: '',
        },
      });
    }

    return {
      success: true,
      auxiliar: {
        id: auxiliar.id,
        nombre: auxiliar.nombre,
        cedula: auxiliar.cedula,
        firmaBase64: auxiliar.firmaBase64,
      },
    };
  } catch (error) {
    console.error('Error en obtenerOGuardarAuxiliar:', error);
    return {
      success: false,
      auxiliar: null,
      error: 'Error obteniendo/guardando auxiliar',
    };
  }
}

export async function guardarFirmaAuxiliar(
  firmaBase64: string,
  nombre: string,
  cedula: string,
  userEmail?: string
) {
  try {
    // Obtener email de sesión o usar el proporcionado
    let email = userEmail || '';
    if (!email) {
      try {
        const session = await auth();
        email = session?.user?.email || '';
      } catch (err) {
        // Continuar sin email
      }
    }

    // Si no hay email, generar uno genérico
    if (!email) {
      email = `auxiliar_${generarSessionId()}@custodia.local`;
    }

    // Buscar y actualizar, o crear nuevo
    let auxiliar = await prisma.auxiliarSeguridad.findUnique({
      where: { userEmail: email },
    });

    if (auxiliar) {
      auxiliar = await prisma.auxiliarSeguridad.update({
        where: { userEmail: email },
        data: {
          nombre,
          cedula,
          firmaBase64,
          firmaCapturedAt: new Date(),
        },
      });
    } else {
      auxiliar = await prisma.auxiliarSeguridad.create({
        data: {
          userEmail: email,
          nombre,
          cedula,
          firmaBase64,
          firmaCapturedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      auxiliar: {
        id: auxiliar.id,
        nombre: auxiliar.nombre,
        cedula: auxiliar.cedula,
        firmaBase64: auxiliar.firmaBase64,
      },
    };
  } catch (error) {
    console.error('Error guardando firma:', error);
    return {
      success: false,
      auxiliar: null,
      error: 'Error guardando firma',
    };
  }
}
