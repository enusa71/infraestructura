'use client';

import { useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  label?: string;
}

export function CameraCapture({ onCapture, label = 'Capturar Foto' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      alert('No se pudo acceder a la cámara');
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    onCapture(dataUrl);
  };

  const retakePhoto = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {!isCameraActive && !previewUrl && (
        <button
          type="button"
          onClick={startCamera}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          📷 {label}
        </button>
      )}

      {isCameraActive && !previewUrl && (
        <div className="flex flex-col gap-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✓ Capturar
            </button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
          <button
            type="button"
            onClick={retakePhoto}
            className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Retomar Foto
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
