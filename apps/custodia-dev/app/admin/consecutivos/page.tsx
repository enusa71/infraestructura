'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface ConfigConsecutivo {
  id: string;
  zona: string;
  proximoNumero: number;
  ultimaActualizacion: string;
  actualizadoPor?: string;
}

export default function ConsecutivosAdminPage() {
  const { data: session, status } = useSession();
  const [configuraciones, setConfiguraciones] = useState<ConfigConsecutivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevoValor, setNuevoValor] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    if (status === 'authenticated') {
      cargarConfiguraciones();
    }
  }, [status]);

  const cargarConfiguraciones = async () => {
    try {
      const res = await fetch('/api/admin/consecutivos');
      const data = await res.json();
      if (data.success) {
        setConfiguraciones(data.configuraciones || []);
      } else {
        setError('Error cargando configuraciones');
      }
    } catch (err) {
      setError('Error conectando con el servidor');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleActualizar = async (zona: string, nuevoNumero: number) => {
    if (nuevoNumero < 1) {
      setError('El número debe ser mayor a 0');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      const res = await fetch('/api/admin/consecutivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zona, proximoNumero: nuevoNumero }),
      });

      const data = await res.json();
      if (data.success) {
        setEditando(null);
        await cargarConfiguraciones();
      } else {
        setError(data.error || 'Error actualizando consecutivo');
      }
    } catch (err) {
      setError('Error al guardar cambios');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (status === 'loading' || cargando) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administración de Consecutivos</h1>
          <p className="text-gray-600">Gestiona los números consecutivos de las zonas francas</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Zona Franca</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Próximo Número</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Última Actualización</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {configuraciones.map((config) => (
                  <tr key={config.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{config.zona}</td>
                    <td className="px-6 py-4">
                      {editando === config.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={nuevoValor}
                            onChange={(e) => setNuevoValor(e.target.value)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              handleActualizar(config.zona, parseInt(nuevoValor));
                            }}
                            disabled={guardando}
                            className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditando(null)}
                            disabled={guardando}
                            className="px-3 py-2 bg-gray-300 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700 font-mono">
                          {config.zona}-{config.proximoNumero.toString().padStart(6, '0')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(config.ultimaActualizacion).toLocaleString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editando !== config.id && (
                        <button
                          onClick={() => {
                            setEditando(config.id);
                            setNuevoValor(config.proximoNumero.toString());
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los números se generan automáticamente con el formato: ZONA-000001</li>
            <li>• Cada zona franca tiene su propia secuencia independiente</li>
            <li>• Solo edita estos números si necesitas ajustar una secuencia específica</li>
            <li>• Los cambios se registran en auditoría</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
