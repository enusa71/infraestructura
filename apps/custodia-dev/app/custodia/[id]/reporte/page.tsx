'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ReporteCustodiaPage() {
  const params = useParams();
  const custodiaId = params.id as string;
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await fetch(`/api/custodia/${custodiaId}/html`);
        if (!response.ok) {
          setError('Custodia no encontrada');
          setLoading(false);
          return;
        }
        const html = await response.text();
        setHtmlContent(html);
      } catch {
        setError('Error cargando custodia');
      }
      setLoading(false);
    };
    cargar();
  }, [custodiaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error || !htmlContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Controles - Volver e Imprimir */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Link href="/historial" className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm border border-blue-600 rounded">
          ← Volver
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* iframe aislado - no contamina estilos globales */}
      <iframe
        srcDoc={htmlContent}
        style={{
          width: '100%',
          minHeight: '900px',
          border: 'none',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'block',
          margin: '0 auto',
        }}
        title={`Custodia Report ${custodiaId}`}
      />
    </div>
  );
}
