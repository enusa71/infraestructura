'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene los permisos de un usuario basado en su rol
 */
export async function obtenerPermisosUsuario(email?: string) {
  try {
    const session = await auth();
    const userEmail = email || session?.user?.email;

    if (!userEmail) {
      return { success: false, permisos: [], error: 'No autenticado' };
    }

    // Obtener rol del usuario
    const usuarioRol = await prisma.usuarioRol.findUnique({
      where: { userEmail },
    });

    if (!usuarioRol || !usuarioRol.activo) {
      return { success: false, permisos: [], error: 'Usuario sin rol asignado o inactivo' };
    }

    // Obtener permisos del rol
    const rolePermisos = await prisma.rolePermiso.findMany({
      where: { rol: usuarioRol.rol },
      include: { permiso: true },
    });

    const permisos = rolePermisos
      .filter(rp => rp.permiso.activa)
      .map(rp => ({
        id: rp.permiso.id,
        nombre: rp.permiso.nombre,
        modulo: rp.permiso.modulo,
        accion: rp.permiso.accion,
      }));

    return { success: true, rol: usuarioRol.rol, permisos };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, permisos: [], error: errorMsg };
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function tienePermiso(permiso: string, email?: string): Promise<boolean> {
  try {
    const result = await obtenerPermisosUsuario(email);
    if (!result.success) return false;
    return result.permisos.some(p => p.nombre === permiso);
  } catch {
    return false;
  }
}

/**
 * ADMIN: Obtener todos los permisos
 */
export async function obtenerTodosPermisos() {
  try {
    const permisos = await prisma.permiso.findMany({
      orderBy: [{ modulo: 'asc' }, { accion: 'asc' }],
    });
    return { success: true, permisos };
  } catch (error) {
    return { success: false, permisos: [], error: 'Error obteniendo permisos' };
  }
}

/**
 * ADMIN: Obtener roles con sus permisos
 */
export async function obtenerRolesConPermisos() {
  try {
    const roles = await prisma.rolePermiso.findMany({
      include: { permiso: true },
      orderBy: [{ rol: 'asc' }, { permiso: { modulo: 'asc' } }],
    });

    // Agrupar por rol
    const rolesAgrupados: { [key: string]: any } = {};
    roles.forEach(rp => {
      if (!rolesAgrupados[rp.rol]) {
        rolesAgrupados[rp.rol] = [];
      }
      rolesAgrupados[rp.rol].push({
        permisoId: rp.permiso.id,
        permiso: rp.permiso.nombre,
        modulo: rp.permiso.modulo,
      });
    });

    return { success: true, roles: rolesAgrupados };
  } catch (error) {
    return { success: false, roles: {}, error: 'Error obteniendo roles' };
  }
}

/**
 * ADMIN: Asignar permiso a un rol
 */
export async function asignarPermisoARol(rol: string, permisoId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'No autenticado' };
    }

    // Verificar que sea admin
    const esAdmin = await tienePermiso('admin.todo', session.user.email);
    if (!esAdmin) {
      return { success: false, error: 'Sin permisos de administrador' };
    }

    const rolePermiso = await prisma.rolePermiso.create({
      data: { rol, permisoId },
    });

    return { success: true, rolePermiso };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, error: errorMsg };
  }
}

/**
 * ADMIN: Remover permiso de un rol
 */
export async function removerPermisoDeRol(rol: string, permisoId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'No autenticado' };
    }

    // Verificar que sea admin
    const esAdmin = await tienePermiso('admin.todo', session.user.email);
    if (!esAdmin) {
      return { success: false, error: 'Sin permisos de administrador' };
    }

    await prisma.rolePermiso.deleteMany({
      where: { rol, permisoId },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error removiendo permiso' };
  }
}

/**
 * ADMIN: Crear nuevo permiso (muy raramente)
 */
export async function crearPermiso(datos: {
  nombre: string;
  modulo: string;
  accion: string;
  descripcion?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'No autenticado' };
    }

    const esAdmin = await tienePermiso('admin.todo', session.user.email);
    if (!esAdmin) {
      return { success: false, error: 'Sin permisos de administrador' };
    }

    const permiso = await prisma.permiso.create({
      data: {
        nombre: datos.nombre,
        modulo: datos.modulo,
        accion: datos.accion,
        descripcion: datos.descripcion,
      },
    });

    return { success: true, permiso };
  } catch (error) {
    return { success: false, error: 'Error creando permiso' };
  }
}
