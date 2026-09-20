'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { obtenerOGuardarAuxiliar } from '@/app/api/auxiliar/actions';
import { useAuxiliarSession } from '@/app/hooks/useAuxiliarSession';

interface ProtectorPerfilAuxiliarProps {
  children: React.ReactNode;
}

export default function ProtectorPerfilAuxiliar({ children }: ProtectorPerfilAuxiliarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userEmail: sessionUserEmail, loaded } = useAuxiliarSession();
  const [datosCompletos, setDatosCompletos] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      if (!loaded || !sessionUserEmail) {
        setVerificando(false);
        return;
      }

      // No redirigir si ya está en /perfil
      if (pathname === '/perfil') {
        setVerificando(false);
        setDatosCompletos(true);
        return;
      }

      try {
        const result = await obtenerOGuardarAuxiliar(sessionUserEmail);

        // Verificar si tiene nombre, cédula y firma completos
        const auxiliar = result.auxiliar;
        const tieneNombre = auxiliar?.nombre && auxiliar.nombre.trim() !== '';
        const tieneCedula = auxiliar?.cedula && auxiliar.cedula.trim() !== '';
        const tieneFirma = auxiliar?.firmaBase64 && auxiliar.firmaBase64.trim() !== '';

        if (tieneNombre && tieneCedula && tieneFirma) {
          setDatosCompletos(true);
        } else {
          // Redirigir a /perfil con parámetro de retorno
          const returnUrl = encodeURIComponent(pathname);
          router.push(`/perfil?returnUrl=${returnUrl}`);
        }
      } catch (err) {
        console.error('Error verificando datos:', err);
        setDatosCompletos(false);
      } finally {
        setVerificando(false);
      }
    };

    verificar();
  }, [loaded, sessionUserEmail, pathname, router]);

  // Mientras verifica, mostrar loading
  if (verificando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Verificando datos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene datos completos pero no está redirigiendo, mostrar algo
  if (!datosCompletos && pathname !== '/perfil') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo a perfil...</p>
        </div>
      </div>
    );
  }

  // Si tiene datos completos o está en /perfil, mostrar contenido
  return <>{children}</>;
}
