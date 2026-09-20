'use client';

import { useEffect, useState } from 'react';

interface DatoPeriodo {
  fecha: string;
  entradas: number;
  salidas: number;
  parciales: number;
}

interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  zona: string;
  estado: string;
  puerta: string;
}

type Periodo = 'dia' | 'semana' | 'mes';

interface GraficoInteractivoProps {
  filtros?: Filtros;
}

export function GraficoInteractivo({ filtros }: GraficoInteractivoProps) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [datos, setDatos] = useState<DatoPeriodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError('');

      try {
        const queryParams = new URLSearchParams();
        queryParams.append('periodo', periodo);

        if (filtros?.fechaDesde) queryParams.append('fechaDesde', filtros.fechaDesde);
        if (filtros?.fechaHasta) queryParams.append('fechaHasta', filtros.fechaHasta);
        if (filtros?.zona) queryParams.append('zona', filtros.zona);
        if (filtros?.estado) queryParams.append('estado', filtros.estado);
        if (filtros?.puerta) queryParams.append('puerta', filtros.puerta);

        const res = await fetch(`/api/reportes/datos-por-periodo?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Error cargando datos');

        const data = await res.json();
        setDatos(data.datos || []);
      } catch (err) {
        setError('Error cargando gráfico');
        console.error(err);
      }

      setCargando(false);
    };

    cargarDatos();
  }, [periodo, filtros?.fechaDesde, filtros?.fechaHasta, filtros?.zona, filtros?.estado, filtros?.puerta]);

  if (cargando) return <div className="p-8 text-center">Cargando gráfico...</div>;

  // Calcular máximo para escala
  const maximo = Math.max(
    ...datos.map((d) => Math.max(d.entradas, d.salidas, d.parciales)),
    10
  );

  // Dimensiones del gráfico - MÁS ANCHO
  const anchoBarra = 75;
  const espacio = 40;
  const altoGrafico = 350;
  const anchoSvg = Math.max(datos.length * (anchoBarra + espacio) + 60, 900);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Herramientas por Período</h2>

      {/* Controles */}
      <div className="flex gap-2 mb-6">
        {(['dia', 'semana', 'mes'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              periodo === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {p === 'dia' ? 'Día' : p === 'semana' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>

      {error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : datos.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Sin datos para este período</div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            width={anchoSvg}
            height={altoGrafico + 80}
            className="min-w-full"
            style={{ display: 'block' }}
          >
            {/* Líneas de referencia */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={`line-${ratio}`}
                x1="40"
                y1={altoGrafico - altoGrafico * ratio + 20}
                x2={anchoSvg - 10}
                y2={altoGrafico - altoGrafico * ratio + 20}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}

            {/* Ejes */}
            <line x1="40" y1="20" x2="40" y2={altoGrafico + 20} stroke="#374151" strokeWidth="2" />
            <line
              x1="40"
              y1={altoGrafico + 20}
              x2={anchoSvg - 10}
              y2={altoGrafico + 20}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Barras de datos */}
            {datos.map((dato, idx) => {
              const x = 40 + idx * (anchoBarra + espacio) + 10;
              const escala = altoGrafico / maximo;

              let y = altoGrafico + 20;

              return (
                <g key={`bar-${idx}`}>
                  {/* Barra Entradas (azul) */}
                  {dato.entradas > 0 && (
                    <>
                      <rect
                        x={x}
                        y={(y - dato.entradas * escala) | 0}
                        width={anchoBarra / 3 - 2}
                        height={dato.entradas * escala}
                        fill="#3b82f6"
                        rx="3"
                      />
                      <text
                        x={x + (anchoBarra / 3 - 2) / 2}
                        y={(y - dato.entradas * escala - 5) | 0}
                        fontSize="11"
                        fill="#1f2937"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {dato.entradas}
                      </text>
                    </>
                  )}

                  {/* Barra Salidas (verde) */}
                  {dato.salidas > 0 && (
                    <>
                      <rect
                        x={x + anchoBarra / 3}
                        y={(y - dato.salidas * escala) | 0}
                        width={anchoBarra / 3 - 2}
                        height={dato.salidas * escala}
                        fill="#10b981"
                        rx="3"
                      />
                      <text
                        x={x + anchoBarra / 3 + (anchoBarra / 3 - 2) / 2}
                        y={(y - dato.salidas * escala - 5) | 0}
                        fontSize="11"
                        fill="#1f2937"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {dato.salidas}
                      </text>
                    </>
                  )}

                  {/* Barra Parciales (naranja) */}
                  {dato.parciales > 0 && (
                    <>
                      <rect
                        x={x + (2 * anchoBarra) / 3}
                        y={(y - dato.parciales * escala) | 0}
                        width={anchoBarra / 3 - 2}
                        height={dato.parciales * escala}
                        fill="#f97316"
                        rx="3"
                      />
                      <text
                        x={x + (2 * anchoBarra) / 3 + (anchoBarra / 3 - 2) / 2}
                        y={(y - dato.parciales * escala - 5) | 0}
                        fontSize="11"
                        fill="#1f2937"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {dato.parciales}
                      </text>
                    </>
                  )}

                  {/* Etiqueta X (fecha) */}
                  <text
                    x={x + anchoBarra / 2 - 10}
                    y={altoGrafico + 40}
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {(() => {
                      const [año, mes, día] = dato.fecha.split('-').map(Number);
                      const fecha = new Date(año, mes - 1, día);
                      return fecha.toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                      });
                    })()}
                  </text>
                </g>
              );
            })}

            {/* Etiquetas Y */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <text key={`y-${ratio}`} x="5" y={altoGrafico - altoGrafico * ratio + 25} fontSize="12" fill="#6b7280">
                {Math.round(maximo * ratio)}
              </text>
            ))}
          </svg>
        </div>
      )}

      {/* Leyenda */}
      <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-sm text-gray-600">Entradas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Salidas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm text-gray-600">Parciales</span>
        </div>
      </div>
    </div>
  );
}
