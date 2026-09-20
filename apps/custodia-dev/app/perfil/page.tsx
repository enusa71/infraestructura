'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SignatureCanvas from '../components/SignatureCanvas';
import { guardarFirmaAuxiliar, obtenerOGuardarAuxiliar } from '@/app/api/auxiliar/actions';
import { useAuxiliarSession } from '@/app/hooks/useAuxiliarSession';

export default function PerfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const { userEmail: sessionUserEmail, loaded } = useAuxiliarSession();
  const [auxiliar, setAuxiliar] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [firmaData, setFirmaData] = useState<{ base64: string; timestamp: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(true);
  const [capturando, setCapturando] = useState(false);

  useEffect(() => {
    if (loaded) {
      cargarDatos(sessionUserEmail);
    }
  }, [loaded, sessionUserEmail]);

  const cargarDatos = async (email?: string) => {
    try {
      const result = await obtenerOGuardarAuxiliar(email || sessionUserEmail);
      if (result.success && result.auxiliar) {
        setUserEmail(result.userEmail || '');
        setAuxiliar(result.auxiliar);
        setNombre(result.auxiliar.nombre || '');
        setCedula(result.auxiliar.cedula || '');
        if (result.auxiliar.firmaBase64) {
          setFirmaData({ base64: result.auxiliar.firmaBase64, timestamp: new Date().toISOString() });
        }
        if (result.userEmail) {
          localStorage.setItem('custodia_user_email', result.userEmail);
        }
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleCapturarNueva = () => {
    setCapturando(true);
    setFirmaData(null);
    setError('');
    setSuccess('');
  };

  const handleCancelar = () => {
    setCapturando(false);
    // Recargar la firma anterior
    if (auxiliar?.firmaBase64) {
      setFirmaData({ base64: auxiliar.firmaBase64, timestamp: new Date().toISOString() });
    }
  };

  const handleGuardar = async () => {
    setError('');
    setSuccess('');

    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!cedula.trim()) {
      setError('La cédula es requerida');
      return;
    }

    if (!firmaData?.base64) {
      setError('La firma es requerida');
      return;
    }

    setGuardando(true);
    try {
      const result = await guardarFirmaAuxiliar(firmaData.base64, nombre, cedula, userEmail || sessionUserEmail);
      if (result.success) {
        setSuccess('✓ Datos guardados correctamente. Tu firma se usará en todas las operaciones.');
        if (result.auxiliar) {
          setAuxiliar(result.auxiliar);
        }
        setCapturando(false);

        // Si vino desde otra página, redirigir de vuelta después de 2 segundos
        if (returnUrl) {
          setTimeout(() => {
            router.push(decodeURIComponent(returnUrl));
          }, 2000);
        }
      } else {
        setError(result.error || 'Error guardando datos');
      }
    } catch (err) {
      setError('Error inesperado');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <>
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Mi Perfil</h1>
      <p className="text-sm text-gray-500 mb-8">Captura tus datos personales y firma digital</p>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Cedula */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cédula <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Tu número de cédula"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Signature Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tu Firma <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-600 mb-4">
              Firma en el área blanca. Esta firma se guardará y se usará en todas tus operaciones.
            </p>

            {!capturando && auxiliar?.firmaBase64 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-green-900">✓ Firma guardada (versión {auxiliar.firmaVersion || 1})</p>
                <p className="text-xs text-green-800 mt-1">Tu firma está lista. Puedes capturar una nueva si lo deseas.</p>
              </div>
            )}

            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <SignatureCanvas
                onSignatureChange={setFirmaData}
                width={400}
                height={150}
              />
            </div>

            {capturando && auxiliar?.firmaBase64 && (
              <p className="text-xs text-blue-600 mt-3 italic">
                Capturando nueva firma (versión {(auxiliar.firmaVersion || 1) + 1})
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {guardando ? 'Guardando...' : 'Guardar Mis Datos'}
            </button>

            {!capturando && auxiliar?.firmaBase64 && (
              <button
                onClick={handleCapturarNueva}
                className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Capturar Nueva Firma
              </button>
            )}

            {capturando && (
              <button
                onClick={handleCancelar}
                className="flex-1 px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
            )}
          </div>

          {/* Saved Data Display */}
          {auxiliar?.nombre && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Datos Guardados</p>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-600">Nombre</dt>
                  <dd className="text-sm text-gray-900 font-medium">{auxiliar.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-600">Cédula</dt>
                  <dd className="text-sm text-gray-900 font-medium">{auxiliar.cedula}</dd>
                </div>
                {auxiliar.firmaBase64 || firmaData?.base64 ? (
                  <div>
                    <dt className="text-xs text-gray-600">Firma</dt>
                    <dd className="text-sm text-green-600 font-medium">✓ Capturada (v{auxiliar.firmaVersion || 1})</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
