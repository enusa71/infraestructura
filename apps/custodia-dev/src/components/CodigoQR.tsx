'use client';

import { useEffect, useState } from 'react';

interface CodigoQRProps {
  numero: string;
  subtexto?: string;
}

export function CodigoQR({ numero, subtexto = 'Código de Custodia' }: CodigoQRProps) {
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const response = await fetch(
          `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(numero)}`
        );
        if (response.ok) {
          setQrCode(response.url);
        }
      } catch (error) {
        console.error('Error generando QR:', error);
      }
    };

    generateQR();
  }, [numero]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold text-gray-900">{subtexto}</h3>

      {/* QR Code */}
      {qrCode && (
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt={`QR: ${numero}`} className="w-48 h-48" />
        </div>
      )}

      {/* Número Grande */}
      <div className="text-center">
        <p className="text-6xl font-bold text-blue-600 font-mono tracking-widest">
          {numero}
        </p>
        <p className="text-gray-600 text-sm mt-2">Memoriza este número</p>
      </div>

      {/* Instrucciones */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
        <ul className="list-disc list-inside space-y-1">
          <li>Escanea el QR con tu teléfono para guardar el código</li>
          <li>O memoriza el número que ves arriba</li>
          <li>Cuando salgas, presenta este código</li>
        </ul>
      </div>
    </div>
  );
}
