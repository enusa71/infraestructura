'use client';

import { useState } from 'react';
import SignatureCanvas from '../SignatureCanvas';

interface SalidaConfirmacionStepProps {
  custodia: any;
  herramientasSalida: Array<{
    id: string;
    herramientaNombre: string;
    cantidad: number;
    cantidadSalida: number;
  }>;
  auxiliar: { nombre: string; cedula: string; firmaBase64: string } | null;
  onConfirmar: (firmaContratista: any, herramientas: any[], retirante?: any) => void;
  onBack: () => void;
  guardando?: boolean;
}

interface Retirante {
  cedula: string;
  nombre: string;
}

export function SalidaConfirmacionStep({
  custodia,
  herramientasSalida: initialHerramientas,
  auxiliar,
  onConfirmar,
  onBack,
  guardando = false,
}: SalidaConfirmacionStepProps) {
  const [herramientasSalida, setHerramientasSalida] = useState(initialHerramientas);
  const [firmaContratista, setFirmaContratista] = useState<any>(null);
  const [error, setError] = useState('');
  const [esLaMismaPersona, setEsLaMismaPersona] = useState(true);
  const [retirante, setRetirante] = useState<Retirante>({ cedula: '', nombre: '' });
  const [mostrarFormularioRetirante, setMostrarFormularioRetirante] = useState(false);

  const handleCantidadSalida = (index: number, cantidad: number) => {
    const nuevas = [...herramientasSalida];
    nuevas[index].cantidadSalida = Math.max(0, Math.min(cantidad, nuevas[index].cantidad));
    setHerramientasSalida(nuevas);
  };

  const handleConfirmar = () => {
    if (!firmaContratista?.base64) {
      setError('Debes firmar para confirmar la salida');
      return;
    }

    if (!auxiliar?.nombre || !auxiliar?.cedula) {
      setError('No hay firma del auxiliar de seguridad');
      return;
    }

    const totalSalidas = herramientasSalida.reduce((sum, h) => sum + h.cantidadSalida, 0);
    if (totalSalidas === 0) {
      setError('Debes seleccionar al menos una herramienta para retirar');
      return;
    }

    // Si no es la misma persona, validar que ingresó datos
    if (!esLaMismaPersona && (!retirante.cedula || !retirante.nombre)) {
      setError('Debes completar los datos de quién retira');
      return;
    }

    const datosRetirante = esLaMismaPersona ? null : retirante;
    onConfirmar(firmaContratista, herramientasSalida, datosRetirante);
  };

  const handleCambiarPersona = () => {
    setEsLaMismaPersona(false);
    setMostrarFormularioRetirante(true);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmación de Salida</h2>
        <p className="text-sm text-gray-700">
          Verifica que las cantidades coincidan y firma para confirmar la salida
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* VERIFICACIÓN DE PERSONA QUE RETIRA */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">¿Quién Retira las Herramientas?</h3>
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border border-amber-300">
            <p className="text-sm font-medium text-gray-900 mb-1">Persona que ingresó:</p>
            <p className="text-sm text-gray-700">{custodia.contratista.nombre}</p>
            <p className="text-xs text-gray-600">C.C.: {custodia.contratista.cedula}</p>
          </div>

          {esLaMismaPersona ? (
            <button
              onClick={handleCambiarPersona}
              className="w-full px-4 py-2 bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 font-medium text-sm transition"
            >
              ⚠️ No es la misma persona
            </button>
          ) : (
            <div className="bg-orange-100 p-3 rounded border border-orange-300">
              <p className="text-sm font-medium text-orange-900 mb-2">Datos de quien retira:</p>
              <p className="text-sm text-orange-900">
                <strong>{retirante.nombre}</strong> - C.C.: {retirante.cedula}
              </p>
              <button
                onClick={() => setMostrarFormularioRetirante(true)}
                className="text-sm text-orange-700 hover:text-orange-900 mt-2 underline"
              >
                Cambiar datos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL - FORMULARIO RETIRANTE */}
      {mostrarFormularioRetirante && !esLaMismaPersona && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Datos de Quien Retira</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cédula
                </label>
                <input
                  type="text"
                  value={retirante.cedula}
                  onChange={(e) => setRetirante({ ...retirante, cedula: e.target.value })}
                  placeholder="Ej: 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={retirante.nombre}
                  onChange={(e) => setRetirante({ ...retirante, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez García"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMostrarFormularioRetirante(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (retirante.cedula && retirante.nombre) {
                    setMostrarFormularioRetirante(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:bg-gray-400"
                disabled={!retirante.cedula || !retirante.nombre}
              >
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERRAMIENTAS */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Herramientas a Retirar</h3>
        <div className="space-y-4">
          {herramientasSalida.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="font-medium text-gray-900 mb-2">{item.herramientaNombre}</p>
              <p className="text-xs text-gray-600 mb-3">Total ingresado: {item.cantidad}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuántas salen?
                </label>
                <input
                  type="number"
                  min="0"
                  max={item.cantidad}
                  value={item.cantidadSalida}
                  onChange={(e) => handleCantidadSalida(index, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              {item.cantidadSalida < item.cantidad && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Salida parcial: Quedan {item.cantidad - item.cantidadSalida} en custodia
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Fecha/Hora: {new Date().toLocaleString('es-CO')}
        </p>
      </div>

      {/* FIRMA AUXILIAR GUARDADA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Autorización de Seguridad (Auxiliar)</h3>
        {auxiliar?.nombre && auxiliar?.cedula ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Auxiliar:</span>
              <span className="font-semibold text-gray-900">{auxiliar.nombre}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">C.C.:</span>
              <span className="font-semibold text-gray-900">{auxiliar.cedula}</span>
            </div>
            {auxiliar.firmaBase64 && (
              <div className="mt-3 border-2 border-gray-300 rounded bg-white p-2">
                <img
                  src={auxiliar.firmaBase64}
                  alt="Firma auxiliar"
                  className="max-h-20 object-contain"
                />
              </div>
            )}
            <p className="text-xs text-blue-600 mt-2">✓ Capturada en módulo de Perfil</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
            Error: No hay firma del auxiliar. Debe capturarse en el módulo de Perfil.
          </div>
        )}
      </div>

      {/* FIRMA RETIRANTE */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Firma de {esLaMismaPersona ? custodia.contratista.nombre : retirante.nombre}
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Firma para confirmar que retiras exactamente lo que se muestra arriba
        </p>
        <SignatureCanvas
          onSignatureChange={setFirmaContratista}
          width={400}
          height={120}
        />
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          disabled={guardando}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition disabled:bg-gray-100"
        >
          ← Atrás
        </button>
        <button
          onClick={handleConfirmar}
          disabled={guardando || !firmaContratista?.base64 || !auxiliar?.nombre}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            guardando || !firmaContratista?.base64 || !auxiliar?.nombre
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {guardando ? 'Registrando...' : '✓ Confirmar Salida'}
        </button>
      </div>
    </div>
  );
}
