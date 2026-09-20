'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SignatureCanvas from '../components/SignatureCanvas';
import { guardarFirmaAuxiliar, obtenerOGuardarAuxiliar } from '@/app/api/auxiliar/actions';

export default function PerfilPage() {
  const [auxiliar, setAuxiliar] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [firma, setFirma] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const result = await obtenerOGuardarAuxiliar();
      if (result.success && result.auxiliar) {
        setAuxiliar(result.auxiliar);
        setNombre(result.auxiliar.nombre || '');
        setCedula(result.auxiliar.cedula || '');
        setFirma(result.auxiliar.firmaBase64 || '');
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setCargando(false);
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

    if (!firma) {
      setError('La firma es requerida');
      return;
    }

    setGuardando(true);
    try {
      const result = await guardarFirmaAuxiliar(firma, nombre, cedula);
      if (result.success) {
        setSuccess('✓ Datos guardados correctamente. Tu firma se usará en todas las operaciones.');
        setAuxiliar(result.auxiliar);
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
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">👤 Mi Perfil</h1>
          <p className="text-gray-600 mb-6">Captura tus datos y firma. Estos se usarán en todas tus operaciones.</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Nombre Completo *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Cédula *</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Tu número de cédula"
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">Tu Firma *</label>
              <p className="text-xs text-gray-600 mb-3">Firma en el área blanca. Esta firma se guardará y se usará en todas tus operaciones.</p>
              <SignatureCanvas
                onSignatureChange={setFirma}
                width={400}
                height={150}
              />
            </div>

            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              {guardando ? 'Guardando...' : '✓ Guardar Mis Datos'}
            </button>

            {auxiliar?.nombre && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-blue-700"><strong>Datos guardados:</strong></p>
                <p className="text-sm text-blue-700 mt-2">Nombre: {auxiliar.nombre}</p>
                <p className="text-sm text-blue-700">Cédula: {auxiliar.cedula}</p>
                {auxiliar.firmaBase64 && <p className="text-sm text-blue-700">✓ Firma capturada</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
