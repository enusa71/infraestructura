'use client';

import { usePermisos, tieneAlgunPermiso } from '@/hooks/usePermisos';
import { ReactNode } from 'react';

interface ProtegidoPorPermisoProps {
  permisos: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * Componente para proteger contenido basado en permisos
 *
 * @param permisos - Un permiso (string) o array de permisos
 * @param children - Contenido a mostrar si tiene permiso
 * @param fallback - Contenido a mostrar si NO tiene permiso
 * @param requireAll - Si true, requiere TODOS los permisos; si false, requiere AL MENOS UNO
 */
export function ProtegidoPorPermiso({
  permisos,
  children,
  fallback = <div className="text-red-600 p-4 border border-red-300 rounded">No tienes permiso para ver esto</div>,
  requireAll = false,
}: ProtegidoPorPermisoProps) {
  const { permisos: permisosUsuario, loading, error } = usePermisos();

  if (loading) {
    return <div className="text-gray-500 p-4">Verificando permisos...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  const permisosRequeridos = Array.isArray(permisos) ? permisos : [permisos];

  let tieneAcceso = false;

  if (requireAll) {
    // Requiere TODOS los permisos
    tieneAcceso = permisosRequeridos.every(req =>
      permisosUsuario.some(p => p.nombre === req)
    );
  } else {
    // Requiere AL MENOS UNO
    tieneAcceso = tieneAlgunPermiso(permisosUsuario, permisosRequeridos);
  }

  if (tieneAcceso) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
