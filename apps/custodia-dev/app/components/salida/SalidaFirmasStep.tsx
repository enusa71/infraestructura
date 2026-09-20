'use client';

import { useState } from 'react';
import SignatureCanvas from '../SignatureCanvas';

interface SalidaFirmasStepProps {
  salidaNumero: number;
  retiraNombre: string;
  retiraCedula: string;
  auxiliarNombre: string;
  auxiliarCedula: string;
  firmaAuxiliarGuardada?: string;
  onNext: (data: {
    firmaRetiraDatos: string;
    firmaRetiraTimestamp: string;
  }) => void;
  onBack: () => void;
}

export function SalidaFirmasStep({
  salidaNumero,
  retiraNombre,
  retiraCedula,
  auxiliarNombre,
  auxiliarCedula,
  firmaAuxiliarGuardada,
  onNext,
  onBack,
}: SalidaFirmasStepProps) {
  const [firmaRetira, setFirmaRetira] = useState<string>('');

  const isComplete = !!firmaRetira;

  const handleNext = () => {
    if (!isComplete) return;

    onNext({
      firmaRetiraDatos: firmaRetira,
      firmaRetiraTimestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Paso 4: Capturar Firmas</h2>
        <p className="text-sm text-gray-700">
          Salida #{salidaNumero} - Ambas personas deben firmar digitalmente en el canvas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firma Persona que Retira */}
        <div className="space-y-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Persona que Retira</p>
            <p className="text-sm text-gray-600 mb-3">{retiraNombre} ({retiraCedula})</p>
            <SignatureCanvas
              onSignatureChange={setFirmaRetira}
              width={300}
              height={120}
            />
            {firmaRetira && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-700 font-semibold">✓ Firma capturada</p>
              </div>
            )}
          </div>
        </div>

        {/* Firma Auxiliar de Seguridad (Read-Only) */}
        <div className="space-y-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Auxiliar de Seguridad</p>
            <p className="text-sm text-gray-600 mb-3">{auxiliarNombre} ({auxiliarCedula})</p>
            {firmaAuxiliarGuardada ? (
              <div className="border-2 border-gray-300 rounded bg-white p-2">
                <img
                  src={firmaAuxiliarGuardada}
                  alt="Firma auxiliar (guardada en entrada)"
                  className="w-full h-24 object-contain"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Firma guardada de entrada</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-500">No hay firma del auxiliar guardada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Resumen de Firmas</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Firma Retirante: {retiraNombre}</span>
            <span className={firmaRetira ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              {firmaRetira ? '✓ Presente' : '○ Pendiente'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Firma Auxiliar: {auxiliarNombre}</span>
            <span className={firmaAuxiliarGuardada ? 'text-green-600 font-semibold' : 'text-gray-400'}>
              {firmaAuxiliarGuardada ? '✓ Guardada' : '○ Sin guardar'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones */}
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
          Confirmar Salida →
        </button>
      </div>
    </div>
  );
}
