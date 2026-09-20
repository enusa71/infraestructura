'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GraficoInteractivo } from '@/app/components/reportes/GraficoInteractivo';
import { FiltrosReportes } from '@/app/components/reportes/FiltrosReportes';
import { KPICards } from '@/app/components/reportes/KPICards';
import { TablaPendientes } from '@/app/components/reportes/TablaPendientes';

interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  zona: string;
  estado: string;
  puerta: string;
}

interface CustodiaPendiente {
  id: string;
  numeroConsecutivo: string;
  contratista: {
    nombre: string;
    cedula: string;
  };
  zonaFranca: string;
  fechaEntrada: string;
  estado: string;
}

export default function ReportesPage() {
  const [filtros, setFiltros] = useState<Filtros>({
    fechaDesde: '',
    fechaHasta: '',
    zona: '',
    estado: '',
    puerta: '',
  });

  const [stats, setStats] = useState({
    totalCustodias: 0,
    custodiasActivas: 0,
    custodiasCerradas: 0,
    custodiasParciales: 0,
  });

  const [custodias, setCustodias] = useState<CustodiaPendiente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filtros.fechaDesde) queryParams.append('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) queryParams.append('fechaHasta', filtros.fechaHasta);
      if (filtros.zona) queryParams.append('zona', filtros.zona);
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.puerta) queryParams.append('puerta', filtros.puerta);

      const res = await fetch(`/api/reportes/filtrar?${queryParams.toString()}`);
      const data = await res.json();

      setStats({
        totalCustodias: data.stats.totalCustodias,
        custodiasActivas: data.stats.custodiasActivas,
        custodiasCerradas: data.stats.custodiasCerradas,
        custodiasParciales: data.stats.custodiasParciales,
      });

      setCustodias(data.custodias);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const tasaCumplimiento =
    stats.totalCustodias > 0
      ? Math.round(
          ((stats.custodiasCerradas + stats.custodiasParciales) / stats.totalCustodias) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard de Supervisor</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Volver
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <FiltrosReportes onFiltrarChange={setFiltros} />

        {/* KPIs */}
        <KPICards
          totalCustodias={stats.totalCustodias}
          custodiasActivas={stats.custodiasActivas}
          custodiasCerradas={stats.custodiasCerradas}
          custodiasParciales={stats.custodiasParciales}
          tasaCumplimiento={tasaCumplimiento}
        />

        {/* Tabla Pendientes */}
        {!loading && <TablaPendientes custodias={custodias} />}

        {/* Gráfico Interactivo */}
        <GraficoInteractivo filtros={filtros} />

        {/* Link a historial */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Ver Detalles Completos</h3>
          <p className="text-gray-600 mb-4">
            Consulta el historial de custodias para ver detalles específicos de cada registro.
          </p>
          <Link
            href="/historial"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            Ir al Historial
          </Link>
        </div>
      </main>
    </div>
  );
}
