'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generarSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function obtenerOGuardarAuxiliar(userEmailParam?: string) {
  try {
    let userEmail = userEmailParam || '';

    if (!userEmail) {
      try {
        const session = await auth();
        userEmail = session?.user?.email || '';
      } catch (err) {
        // Si falla, continuamos sin email
      }
    }

    // Si no hay email de sesión, usar fallback consistente (no aleatorio)
    if (!userEmail) {
      userEmail = 'auxiliar_sistema@custodia.local';
    }

    let auxiliar = await prisma.auxiliarSeguridad.findUnique({
      where: { userEmail },
    });

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
      userEmail,
      auxiliar: {
        id: auxiliar.id,
        nombre: auxiliar.nombre,
        cedula: auxiliar.cedula,
        firmaBase64: auxiliar.firmaBase64,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en obtenerOGuardarAuxiliar:', errorMsg, error);
    return {
      success: false,
      userEmail: '',
      auxiliar: null,
      error: `Error obteniendo/guardando auxiliar: ${errorMsg}`,
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
    let email = userEmail || '';
    if (!email) {
      try {
        const session = await auth();
        email = session?.user?.email || '';
      } catch (err) {
        // Continuar sin email
      }
    }

    // Si no hay email de sesión, usar fallback consistente (no aleatorio)
    if (!email) {
      email = 'auxiliar_sistema@custodia.local';
    }

    let auxiliar = await prisma.auxiliarSeguridad.findUnique({
      where: { userEmail: email },
    });

    const firmaAnterior = auxiliar?.firmaBase64;
    const versionAnterior = auxiliar?.firmaVersion || 1;

    if (auxiliar && firmaAnterior && firmaAnterior !== '') {
      // Guardar versión anterior en historial antes de actualizar
      await prisma.auxiliarSeguidadFirmaVersion.create({
        data: {
          auxiliarId: auxiliar.id,
          versionNum: versionAnterior,
          firmaBase64: firmaAnterior,
          nombre: auxiliar.nombre,
          cedula: auxiliar.cedula,
          capturadoEn: auxiliar.firmaCapturedAt || new Date(),
        },
      });
    }

    if (auxiliar) {
      auxiliar = await prisma.auxiliarSeguridad.update({
        where: { userEmail: email },
        data: {
          nombre,
          cedula,
          firmaBase64,
          firmaCapturedAt: new Date(),
          firmaVersion: (versionAnterior || 1) + 1,
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
          firmaVersion: 1,
        },
      });
    }

    // Registrar en AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          table: 'AuxiliarSeguridad',
          action: auxiliar ? 'UPDATE' : 'CREATE',
          recordId: auxiliar.id,
          userEmail: email,
          changes: {
            nombre,
            cedula,
            firmaVersion: auxiliar.firmaVersion,
            cambioFirma: !!firmaAnterior,
            versionAnterior: versionAnterior,
          },
        },
      });
    } catch (auditErr) {
      console.error('Error registrando en AuditLog:', auditErr);
    }

    return {
      success: true,
      userEmail: email,
      auxiliar: {
        id: auxiliar.id,
        nombre: auxiliar.nombre,
        cedula: auxiliar.cedula,
        firmaBase64: auxiliar.firmaBase64,
        firmaVersion: auxiliar.firmaVersion,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error guardando firma:', errorMsg, error);
    return {
      success: false,
      userEmail: '',
      auxiliar: null,
      error: `Error guardando firma: ${errorMsg}`,
    };
  }
}
