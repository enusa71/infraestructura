import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({
        success: false,
        rol: null,
        permisos: [],
        error: 'No autenticado'
      });
    }

    // Obtener rol del usuario
    const usuarioRol = await prisma.usuarioRol.findUnique({
      where: { userEmail: session.user.email },
    });

    if (!usuarioRol || !usuarioRol.activo) {
      return Response.json({
        success: false,
        rol: null,
        permisos: [],
        error: 'Usuario sin rol asignado o inactivo'
      });
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

    return Response.json({
      success: true,
      email: session.user.email,
      rol: usuarioRol.rol,
      permisos,
    });
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    return Response.json(
      {
        success: false,
        rol: null,
        permisos: [],
        error: 'Error obteniendo permisos'
      },
      { status: 500 }
    );
  }
}
