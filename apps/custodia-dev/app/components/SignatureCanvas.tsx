'use client';

import { useRef, useEffect } from 'react';

interface SignatureCanvasProps {
  onSignatureChange: (data: { base64: string; timestamp: string }) => void;
  personLabel?: string;
  personValue?: string;
  roleLabel?: string;
  width?: number;
  height?: number;
}

export default function SignatureCanvas({
  onSignatureChange,
  personLabel = 'Persona',
  personValue = 'Nombre',
  roleLabel = 'Firma Digital',
  width = 500,
  height = 200,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = true;
    const coords = getCoordinates(e as React.MouseEvent<HTMLCanvasElement>);
    if (!coords) {
      console.warn('⚠️ SignatureCanvas: No coordinates from event');
      return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ SignatureCanvas: No canvas context');
      return;
    }

    console.log('✏️ SignatureCanvas: Drawing started at', coords);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;

    const coords = getCoordinates(e as React.MouseEvent<HTMLCanvasElement>);
    if (!coords) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const base64 = canvas.toDataURL('image/png');
    onSignatureChange({
      base64,
      timestamp: new Date().toISOString(),
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSignatureChange({
      base64: '',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">{roleLabel}</p>
          <p className="text-xs text-gray-600">{personLabel}</p>
          <p className="text-sm font-bold text-gray-900">{personValue}</p>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded bg-white overflow-hidden" style={{ touchAction: 'none', width: `${width}px`, maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair block"
          style={{ touchAction: 'none', display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      <div className="flex gap-2 justify-between">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm font-medium transition"
        >
          Limpiar
        </button>
        <p className="text-xs text-gray-500 flex items-center">
          ✓ Dibuja con el dedo o mouse
        </p>
      </div>
    </div>
  );
}
