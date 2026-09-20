'use server';

import { prisma } from '@/lib/prisma';

export async function obtenerRolUsuario(email: string) {
  try {
    const usuarioRol = await prisma.usuarioRol.findUnique({
      where: { userEmail: email },
    });

    return usuarioRol?.rol || 'custodia_usuario';
  } catch (error) {
    console.error('Error obteniendo rol:', error);
    return 'custodia_usuario';
  }
}
