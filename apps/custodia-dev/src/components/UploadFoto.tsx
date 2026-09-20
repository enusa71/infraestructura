'use client';

import { useRef, useState } from 'react';

interface UploadFotoProps {
  onUpload: (dataUrl: string, filename: string) => void;
  accept?: string;
  label?: string;
}

export function UploadFoto({
  onUpload,
  accept = 'image/*',
  label = 'Seleccionar Archivo',
}: UploadFotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onUpload(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setFilename('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview && (
        <button
          type="button"
          onClick={handleClick}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-600 hover:text-blue-600 font-semibold"
        >
          📁 {label}
        </button>
      )}

      {preview && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={filename} className="w-full rounded-lg" />
          <div className="flex gap-2">
            <p className="flex-1 text-sm text-gray-600 truncate">{filename}</p>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
