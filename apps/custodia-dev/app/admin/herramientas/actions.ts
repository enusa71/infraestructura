'use server';

import { prisma } from '@/lib/prisma';

export async function crearHerramienta(nombre: string, descripcion?: string) {
  try {
    const herramienta = await prisma.herramienta.create({
      data: { nombre, descripcion },
    });
    return { success: true, herramienta };
  } catch {
    return { success: false, error: 'No se pudo crear herramienta' };
  }
}

export async function actualizarHerramienta(id: string, nombre: string, descripcion?: string, activa?: boolean) {
  try {
    const herramienta = await prisma.herramienta.update({
      where: { id },
      data: { nombre, descripcion, activa },
    });
    return { success: true, herramienta };
  } catch {
    return { success: false, error: 'No se pudo actualizar herramienta' };
  }
}

export async function eliminarHerramienta(id: string) {
  try {
    await prisma.herramienta.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: 'No se pudo eliminar herramienta' };
  }
}

export async function listarHerramientas() {
  try {
    const herramientas = await prisma.herramienta.findMany({
      orderBy: { nombre: 'asc' },
    });
    return { success: true, herramientas };
  } catch {
    return { success: false, herramientas: [] };
  }
}

export async function buscarHerramientas(query: string) {
  try {
    const herramientas = await prisma.herramienta.findMany({
      where: {
        activa: true,
        nombre: { contains: query, mode: 'insensitive' },
      },
      orderBy: { nombre: 'asc' },
      take: 10,
    });
    return { success: true, herramientas };
  } catch {
    return { success: false, herramientas: [] };
  }
}
