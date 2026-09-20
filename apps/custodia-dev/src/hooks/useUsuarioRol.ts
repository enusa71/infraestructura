'use client';

import { useEffect, useState } from 'react';

export function useUsuarioRol() {
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRol = async () => {
      try {
        const res = await fetch('/api/usuario/rol');
        const data = await res.json();
        setRol(data.rol);
      } catch (error) {
        console.error('Error obteniendo rol:', error);
        setRol('custodia_usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchRol();
  }, []);

  return { rol, loading };
}

export function tienePermiso(
  rolUsuario: string | null,
  rolesRequeridos: string[]
): boolean {
  if (!rolUsuario) return false;
  return rolesRequeridos.includes(rolUsuario);
}
