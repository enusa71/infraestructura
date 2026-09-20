// Definición de permisos por rol
export const PERMISOS_POR_ROL = {
  custodia_admin: {
    crear_entrada: true,
    registrar_salida: true,
    ver_reportes: true,
    ver_historial: true,
    gestionar_usuarios: true,
    gestionar_herramientas: true,
    ver_auditoria: true,
  },
  custodia_usuario: {
    crear_entrada: true,
    registrar_salida: true,
    ver_reportes: true,
    ver_historial: true,
    gestionar_usuarios: false,
    gestionar_herramientas: false,
    ver_auditoria: false,
  },
  custodia_lector: {
    crear_entrada: false,
    registrar_salida: false,
    ver_reportes: true,
    ver_historial: true,
    gestionar_usuarios: false,
    gestionar_herramientas: false,
    ver_auditoria: false,
  },
};

export function tienePermiso(
  rol: string | null,
  permiso: keyof typeof PERMISOS_POR_ROL['custodia_admin']
): boolean {
  if (!rol) return false;
  return (PERMISOS_POR_ROL as any)[rol]?.[permiso] === true;
}

export function tieneAlgunoDeEstos(
  rol: string | null,
  permisos: (keyof typeof PERMISOS_POR_ROL['custodia_admin'])[]
): boolean {
  if (!rol) return false;
  return permisos.some((permiso) => tienePermiso(rol, permiso));
}
