'use client';

import { useState } from 'react';

interface SalidaDatosStepProps {
  contratistaIngreso: {
    nombre: string;
    cedula: string;
    empresa?: string;
  };
  auxiliar: {
    nombre: string;
    cedula: string;
  } | null;
  onNext: (data: {
    retiraNombre: string;
    retiraCedula: string;
    retiraEmpresa?: string;
    auxiliarNombre: string;
    auxiliarCedula: string;
  }) => void;
  onBack: () => void;
}

export function SalidaDatosStep({
  contratistaIngreso,
  auxiliar,
  onNext,
  onBack,
}: SalidaDatosStepProps) {
  const [esMismaPersona, setEsMismaPersona] = useState(true);
  const [retiraNombre, setRetiraNombre] = useState(contratistaIngreso.nombre);
  const [retiraCedula, setRetiraCedula] = useState(contratistaIngreso.cedula);
  const [retiraEmpresa, setRetiraEmpresa] = useState(contratistaIngreso.empresa || '');

  const isComplete = retiraNombre && retiraCedula && auxiliar?.nombre && auxiliar?.cedula;

  const handleNext = () => {
    if (!isComplete) return;

    onNext({
      retiraNombre,
      retiraCedula,
      retiraEmpresa: retiraEmpresa || undefined,
      auxiliarNombre: auxiliar?.nombre || '',
      auxiliarCedula: auxiliar?.cedula || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Paso 3: Datos de la Salida</h2>
        <p className="text-sm text-gray-700">
          Verifica quién retira las herramientas y autorización automática
        </p>
      </div>

      {/* PERSONA QUE RETIRA */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">¿Quién retira las herramientas?</h3>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={esMismaPersona}
              onChange={(e) => {
                setEsMismaPersona(e.target.checked);
                if (e.target.checked) {
                  setRetiraNombre(contratistaIngreso.nombre);
                  setRetiraCedula(contratistaIngreso.cedula);
                  setRetiraEmpresa(contratistaIngreso.empresa || '');
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-gray-700 text-sm">
              Es la misma persona que ingresó ({contratistaIngreso.nombre})
            </span>
          </label>
        </div>

        {!esMismaPersona && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={retiraNombre}
                onChange={(e) => setRetiraNombre(e.target.value)}
                placeholder="Nombre de quien retira"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                type="text"
                value={retiraCedula}
                onChange={(e) => setRetiraCedula(e.target.value)}
                placeholder="Número de cédula"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa (opcional)</label>
              <input
                type="text"
                value={retiraEmpresa}
                onChange={(e) => setRetiraEmpresa(e.target.value)}
                placeholder="Empresa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {esMismaPersona && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <p className="font-semibold text-green-900">{contratistaIngreso.nombre}</p>
            <p className="text-green-800">C.C. {contratistaIngreso.cedula}</p>
            {contratistaIngreso.empresa && <p className="text-green-800">{contratistaIngreso.empresa}</p>}
          </div>
        )}
      </div>

      {/* AUXILIAR AUTOMÁTICO - NO PIDE ENTRADA */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Autorización desde Seguridad (Automático)</h3>

        {auxiliar?.nombre && auxiliar?.cedula ? (
          <div className="space-y-2 text-sm bg-white p-3 rounded border border-blue-200">
            <div className="flex justify-between">
              <span className="text-gray-700">Nombre:</span>
              <span className="font-semibold text-gray-900">{auxiliar.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">C.C.:</span>
              <span className="font-semibold text-gray-900">{auxiliar.cedula}</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">✓ Usuario logueado en la app</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
            Error: Primero debes capturar tu firma en el módulo de Perfil
          </div>
        )}
      </div>

      {/* RESUMEN */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Retira:</span>
            <span className="font-medium text-gray-900">{retiraNombre || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">C.C.:</span>
            <span className="font-medium text-gray-900">{retiraCedula || '—'}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Autoriza (Seguridad):</span>
              <span className="font-medium text-gray-900">{auxiliar?.nombre || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">C.C.:</span>
              <span className="font-medium text-gray-900">{auxiliar?.cedula || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition"
        >
          ← Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={!isComplete}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            isComplete
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Siguiente: Firmas →
        </button>
      </div>
    </div>
  );
}
