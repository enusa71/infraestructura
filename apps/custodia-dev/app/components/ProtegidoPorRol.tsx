'use client';

import { useUsuarioRol, tienePermiso } from '@/hooks/useUsuarioRol';
import { ReactNode } from 'react';

interface ProtegidoPorRolProps {
  rolesPermitidos: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtegidoPorRol({
  rolesPermitidos,
  children,
  fallback = <div className="text-red-600">No tienes permiso para ver esto</div>,
}: ProtegidoPorRolProps) {
  const { rol, loading } = useUsuarioRol();

  if (loading) {
    return <div className="text-gray-500">Verificando permisos...</div>;
  }

  if (tienePermiso(rol, rolesPermitidos)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
