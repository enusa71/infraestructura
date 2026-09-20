'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Servicio {
  id: string;
  nombre: string;
  healthCheckUrl?: string;
  estado: 'online' | 'offline' | 'unknown';
  ultimaVerificacion?: string;
  tipo?: string;
  puerto?: number;
  url_desarrollo?: string;
  critico?: boolean;
}

interface Config {
  timestamp: string;
  version: string;
  ambiente: string;
  config_monitoreo: {
    intervalo_verificacion_ms: number;
  };
  servicios_compartidos: Record<string, any>;
  aplicaciones: any[];
}

export default function DashboardPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verificarServicios = async () => {
      setActualizando(true);
      setError('');

      try {
        // 1. Leer configuración
        const configRes = await fetch('/api/servicios-config');
        if (!configRes.ok) throw new Error('Error leyendo configuración');

        const configData = await configRes.json();
        setConfig(configData);

        // 2. Preparar lista de servicios a verificar
        const serviciosAVerificar: Servicio[] = [];

        // Agregar servicios compartidos
        if (configData.servicios_compartidos) {
          Object.values(configData.servicios_compartidos).forEach((s: any) => {
            serviciosAVerificar.push({
              id: s.id,
              nombre: s.nombre,
              healthCheckUrl: s.healthCheckUrl,
              estado: 'unknown',
              tipo: s.tipo,
              puerto: s.puerto,
              critico: s.critico,
            });
          });
        }

        // Agregar aplicaciones
        if (configData.aplicaciones) {
          configData.aplicaciones.forEach((app: any) => {
            serviciosAVerificar.push({
              id: app.id,
              nombre: app.nombre,
              healthCheckUrl: app.healthCheckUrl,
              estado: 'unknown',
              tipo: 'aplicacion',
              puerto: app.puerto,
              url_desarrollo: app.url_desarrollo,
              critico: true,
            });
          });
        }

        // 3. Verificar estado de cada servicio
        const serviciosActualizados = await Promise.all(
          serviciosAVerificar.map(async (servicio) => {
            try {
              if (!servicio.healthCheckUrl) {
                return {
                  ...servicio,
                  estado: 'unknown' as const,
                  ultimaVerificacion: new Date().toLocaleTimeString(),
                };
              }

              // Intentar fetch con timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);

              const res = await fetch(servicio.healthCheckUrl, {
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              return {
                ...servicio,
                estado: res.ok ? ('online' as const) : ('offline' as const),
                ultimaVerificacion: new Date().toLocaleTimeString(),
              };
            } catch (error) {
              return {
                ...servicio,
                estado: 'offline' as const,
                ultimaVerificacion: new Date().toLocaleTimeString(),
              };
            }
          })
        );

        setServicios(serviciosActualizados);
        setUltimaActualizacion(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Error:', err);
        setError('Error verificando servicios');
      }

      setActualizando(false);
    };

    // Verificar inicialmente
    verificarServicios();

    // Luego cada 5 segundos
    const intervalo = setInterval(verificarServicios, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const serviciosCriticos = servicios.filter((s) => s.critico);
  const serviciosComplementarios = servicios.filter((s) => !s.critico);
  const onlineCount = servicios.filter((s) => s.estado === 'online').length;
  const offlineCount = servicios.filter((s) => s.estado === 'offline').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🏗️ Arquitectura en Tiempo Real</h1>
            <p className="text-gray-600 text-sm mt-1">Custodia de Herramientas - Zona Franca Barranquilla</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← Volver
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Servicios Online</div>
            <div className="text-3xl font-bold text-green-600 mt-2">🟢 {onlineCount}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-600">Servicios Offline</div>
            <div className="text-3xl font-bold text-red-600 mt-2">🔴 {offlineCount}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-500">
            <div className="text-sm text-gray-600">Total Servicios</div>
            <div className="text-3xl font-bold text-gray-600 mt-2">📦 {servicios.length}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Última Actualización</div>
            <div className="text-sm font-bold text-blue-600 mt-2">{ultimaActualizacion || 'Cargando...'}</div>
            <div className="text-xs text-gray-500 mt-1">
              {actualizando ? '🔄 Actualizando...' : '✓ Actualizado'}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            ⚠️ {error}
          </div>
        )}

        {/* Servicios Críticos */}
        {serviciosCriticos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🚨 Servicios Críticos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviciosCriticos.map((servicio) => (
                <ServiceCard key={servicio.id} servicio={servicio} />
              ))}
            </div>
          </section>
        )}

        {/* Servicios Complementarios */}
        {serviciosComplementarios.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              ℹ️ Servicios Complementarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviciosComplementarios.map((servicio) => (
                <ServiceCard key={servicio.id} servicio={servicio} />
              ))}
            </div>
          </section>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Información</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              • Este dashboard verifica automáticamente el estado de todos los servicios cada 5 segundos.
            </p>
            <p>
              • Los datos se cargan desde <code className="bg-white px-2 py-1 rounded">SERVICIOS-GLOBAL.json</code>.
            </p>
            <p>
              • Para agregar nuevos servicios, edita el archivo JSON y recarga esta página.
            </p>
            <p>
              • Los servicios críticos (🚨) deben estar online para que la aplicación funcione.
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <details className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <summary className="cursor-pointer font-semibold text-gray-900 hover:text-gray-700">
            🔧 Configuración Actual (JSON)
          </summary>
          <pre className="mt-4 text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-96">
            {config ? JSON.stringify(config, null, 2) : 'Cargando...'}
          </pre>
        </details>
      </main>
    </div>
  );
}

// Componente para cada tarjeta de servicio
function ServiceCard({ servicio }: { servicio: Servicio }) {
  const isOnline = servicio.estado === 'online';
  const isCritico = servicio.critico ?? false;

  return (
    <div
      className={`rounded-lg shadow-lg p-6 border-2 transition-all ${
        isOnline
          ? 'bg-green-50 border-green-300 hover:shadow-xl'
          : 'bg-red-50 border-red-300 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{servicio.nombre}</h3>
          {servicio.tipo && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                {servicio.tipo}
              </span>
            </p>
          )}
        </div>
        <span className="text-4xl">{isOnline ? '🟢' : '🔴'}</span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div>
          <span className="font-semibold text-gray-700">Estado:</span>
          <span
            className={`ml-2 font-bold ${
              isOnline ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {servicio.estado.toUpperCase()}
          </span>
        </div>

        {servicio.puerto && (
          <div>
            <span className="font-semibold text-gray-700">Puerto:</span>
            <span className="ml-2 text-gray-600">{servicio.puerto}</span>
          </div>
        )}

        {servicio.url_desarrollo && (
          <div>
            <span className="font-semibold text-gray-700">URL Dev:</span>
            <span className="ml-2 text-blue-600 hover:underline cursor-pointer">
              {servicio.url_desarrollo}
            </span>
          </div>
        )}

        {servicio.healthCheckUrl && (
          <div>
            <span className="font-semibold text-gray-700">Health Check:</span>
            <span className="ml-2 text-xs text-gray-600 break-all">
              {servicio.healthCheckUrl}
            </span>
          </div>
        )}

        {servicio.ultimaVerificacion && (
          <div>
            <span className="font-semibold text-gray-700">Última verificación:</span>
            <span className="ml-2 text-gray-600">{servicio.ultimaVerificacion}</span>
          </div>
        )}

        {isCritico && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded">
            <span className="text-red-700 font-semibold text-xs">
              ⚠️ Servicio crítico - Requerido para operación
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
