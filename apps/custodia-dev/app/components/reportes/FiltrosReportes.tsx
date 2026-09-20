'use client';

import { useState } from 'react';

interface FiltrosReportesProps {
  onFiltrarChange: (filtros: any) => void;
}

export function FiltrosReportes({ onFiltrarChange }: FiltrosReportesProps) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [zona, setZona] = useState('');
  const [estado, setEstado] = useState('');
  const [puerta, setPuerta] = useState('');

  const handleChange = (nuevosFiltros: any) => {
    onFiltrarChange(nuevosFiltros);
  };

  const handleLimpiar = () => {
    setFechaDesde('');
    setFechaHasta('');
    setZona('');
    setEstado('');
    setPuerta('');
    onFiltrarChange({
      fechaDesde: '',
      fechaHasta: '',
      zona: '',
      estado: '',
      puerta: '',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Filtros de Segmentación</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Fecha Desde */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Fecha Desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              const nuevoValor = e.target.value;
              setFechaDesde(nuevoValor);
              handleChange({
                fechaDesde: nuevoValor,
                fechaHasta,
                zona,
                estado,
                puerta,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Fecha Hasta
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              const nuevoValor = e.target.value;
              setFechaHasta(nuevoValor);
              handleChange({
                fechaDesde,
                fechaHasta: nuevoValor,
                zona,
                estado,
                puerta,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Zona Franca */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Zona Franca
          </label>
          <select
            value={zona}
            onChange={(e) => {
              const nuevoValor = e.target.value;
              setZona(nuevoValor);
              handleChange({
                fechaDesde,
                fechaHasta,
                zona: nuevoValor,
                estado,
                puerta,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="ZFB">ZFB</option>
            <option value="ZOFIA">ZOFIA</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => {
              const nuevoValor = e.target.value;
              setEstado(nuevoValor);
              handleChange({
                fechaDesde,
                fechaHasta,
                zona,
                estado: nuevoValor,
                puerta,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="ACTIVA">Activas</option>
            <option value="CERRADA">Cerradas</option>
            <option value="PARCIAL">Parciales</option>
          </select>
        </div>

        {/* Puerta */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Puerta
          </label>
          <select
            value={puerta}
            onChange={(e) => {
              const nuevoValor = e.target.value;
              setPuerta(nuevoValor);
              handleChange({
                fechaDesde,
                fechaHasta,
                zona,
                estado,
                puerta: nuevoValor,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="PEATONAL">Peatonal</option>
            <option value="VEH. LIVIANOS">Veh. Livianos</option>
            <option value="E. CARGA">E. Carga</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleLimpiar}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold text-sm"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
