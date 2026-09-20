'use client';

import { useEffect, useState } from 'react';

interface Permiso {
  id: string;
  nombre: string;
  modulo: string;
  accion: string;
}

export function usePermisos() {
  const [rol, setRol] = useState<string | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const res = await fetch('/api/usuario/permisos');
        const data = await res.json();

        if (data.success) {
          setRol(data.rol);
          setPermisos(data.permisos || []);
          setError(null);
        } else {
          setRol(null);
          setPermisos([]);
          setError(data.error || 'Error obteniendo permisos');
        }
      } catch (err) {
        console.error('Error obteniendo permisos:', err);
        setRol(null);
        setPermisos([]);
        setError('Error obteniendo permisos');
      } finally {
        setLoading(false);
      }
    };

    fetchPermisos();
  }, []);

  return { rol, permisos, loading, error };
}

/**
 * Hook para verificar si el usuario tiene un permiso específico
 */
export function usePermiso(nombrePermiso: string) {
  const { permisos, loading } = usePermisos();

  const tienePermiso = permisos.some(p => p.nombre === nombrePermiso);

  return { tienePermiso, loading };
}

/**
 * Función auxiliar para verificar múltiples permisos
 */
export function tieneAlgunPermiso(
  permisosUsuario: Permiso[],
  permisosRequeridos: string[]
): boolean {
  return permisosRequeridos.some(requerido =>
    permisosUsuario.some(p => p.nombre === requerido)
  );
}

/**
 * Función auxiliar para verificar todos los permisos
 */
export function tieneTodosPermisos(
  permisosUsuario: Permiso[],
  permisosRequeridos: string[]
): boolean {
  return permisosRequeridos.every(requerido =>
    permisosUsuario.some(p => p.nombre === requerido)
  );
}
