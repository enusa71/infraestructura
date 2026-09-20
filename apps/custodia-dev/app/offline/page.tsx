'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sin Conexión</h1>
        <p className="text-gray-600 mb-6">
          No hay conexión a internet. Algunos datos pueden estar disponibles en caché.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          🔄 Reintentar
        </button>
        <p className="text-gray-500 text-sm mt-6">
          Los datos se sincronizarán cuando hay conexión
        </p>
      </div>
    </div>
  );
}
