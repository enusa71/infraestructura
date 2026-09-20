'use client';

import { useState, useMemo } from 'react';

interface CustodiaInfo {
  id: string;
  numeroConsecutivo: string;
  contratista: { cedula: string; nombre: string };
  estado: string;
  fechaEntrada: Date;
  items: any[];
  salidas?: any[];
}

interface FiltrosHistorialProps {
  custodias: CustodiaInfo[];
}

export default function FiltrosHistorial({
  custodias,
}: FiltrosHistorialProps) {
  const calcularPendientes = (custodia: CustodiaInfo) => {
    const cantidadSalidaTotal = (custodia.salidas || []).reduce((total: number, salida: any) => {
      return total + ((salida.items || []).reduce((sum: number, item: any) => sum + item.cantidadSalida, 0));
    }, 0);
    const cantidadIngresada = (custodia.items || []).reduce((total: number, item: any) => total + item.cantidad, 0);
    return cantidadIngresada - cantidadSalidaTotal;
  };

  const calcularEstadoReal = (custodia: CustodiaInfo) => {
    const pendientes = calcularPendientes(custodia);
    if (pendientes === 0) return 'CERRADA';
    if (pendientes > 0 && pendientes < (custodia.items || []).reduce((sum: number, item: any) => sum + item.cantidad, 0)) return 'PARCIAL';
    return 'ACTIVA';
  };

  const [filtros, setFiltros] = useState({
    numero: '',
    cedula: '',
    nombre: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    horaDesde: '',
    horaHasta: '',
  });

  const [orden, setOrden] = useState<{ campo: string; direccion: 'asc' | 'desc' }>({
    campo: 'fechaEntrada',
    direccion: 'desc',
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const resultadosFiltrados = useMemo(() => {
    let filtrados = custodias.filter((c) => {
      const estado = calcularEstadoReal(c);
      const fecha = new Date(c.fechaEntrada);
      const hora = fecha.getHours() * 60 + fecha.getMinutes();

      // Filtros
      const matchNumero = !filtros.numero || c.numeroConsecutivo.includes(filtros.numero);
      const matchCedula = !filtros.cedula || c.contratista.cedula.includes(filtros.cedula);
      const matchNombre = !filtros.nombre || c.contratista.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      const matchEstado = !filtros.estado || estado === filtros.estado;

      // Filtro rango de fecha (CORREGIDO)
      let matchFecha = true;
      if (filtros.fechaDesde) {
        const [año, mes, día] = filtros.fechaDesde.split('-').map(Number);
        const fechaDesde = new Date(año, mes - 1, día, 0, 0, 0);
        matchFecha = fecha >= fechaDesde;
      }
      if (filtros.fechaHasta) {
        const [año, mes, día] = filtros.fechaHasta.split('-').map(Number);
        const fechaHasta = new Date(año, mes - 1, día, 23, 59, 59);
        matchFecha = matchFecha && fecha <= fechaHasta;
      }

      // Filtro rango de hora
      let matchHora = true;
      if (filtros.horaDesde) {
        const [horas, minutos] = filtros.horaDesde.split(':').map(Number);
        const horaDesde = horas * 60 + minutos;
        matchHora = hora >= horaDesde;
      }
      if (filtros.horaHasta) {
        const [horas, minutos] = filtros.horaHasta.split(':').map(Number);
        const horaHasta = horas * 60 + minutos;
        matchHora = matchHora && hora <= horaHasta;
      }

      return matchNumero && matchCedula && matchNombre && matchEstado && matchFecha && matchHora;
    });

    // Ordenamiento
    filtrados.sort((a, b) => {
      let valA: any = a;
      let valB: any = b;

      switch (orden.campo) {
        case 'numeroConsecutivo':
          valA = a.numeroConsecutivo;
          valB = b.numeroConsecutivo;
          break;
        case 'cedula':
          valA = a.contratista.cedula;
          valB = b.contratista.cedula;
          break;
        case 'nombre':
          valA = a.contratista.nombre.toLowerCase();
          valB = b.contratista.nombre.toLowerCase();
          break;
        case 'ingresadas':
          valA = (a.items || []).reduce((sum: number, item: any) => sum + item.cantidad, 0);
          valB = (b.items || []).reduce((sum: number, item: any) => sum + item.cantidad, 0);
          break;
        case 'pendientes':
          valA = calcularPendientes(a);
          valB = calcularPendientes(b);
          break;
        case 'estado':
          valA = calcularEstadoReal(a);
          valB = calcularEstadoReal(b);
          break;
        case 'fechaEntrada':
          valA = new Date(a.fechaEntrada).getTime();
          valB = new Date(b.fechaEntrada).getTime();
          break;
        case 'hora':
          valA = new Date(a.fechaEntrada).getHours() * 60 + new Date(a.fechaEntrada).getMinutes();
          valB = new Date(b.fechaEntrada).getHours() * 60 + new Date(b.fechaEntrada).getMinutes();
          break;
      }

      if (valA < valB) return orden.direccion === 'asc' ? -1 : 1;
      if (valA > valB) return orden.direccion === 'asc' ? 1 : -1;
      return 0;
    });

    return filtrados;
  }, [custodias, filtros, calcularEstadoReal, calcularPendientes, orden]);

  // Paginación
  const totalRegistros = resultadosFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + registrosPorPagina;
  const registrosEnPagina = resultadosFiltrados.slice(indiceInicio, indiceFin);

  const handleCambiarRegistrosPorPagina = (nuevo: number) => {
    setRegistrosPorPagina(nuevo);
    setPaginaActual(1); // Resetear a primera página
  };

  const formatoFecha = (date: Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatoHora = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const limpiarFiltros = () => {
    setFiltros({
      numero: '',
      cedula: '',
      nombre: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      horaDesde: '',
      horaHasta: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Filtros Avanzados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Número */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número Custodia</label>
            <input
              type="text"
              placeholder="Ej: 8803871"
              value={filtros.numero}
              onChange={(e) => setFiltros({ ...filtros, numero: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula</label>
            <input
              type="text"
              placeholder="Ej: 72015491"
              value={filtros.cedula}
              onChange={(e) => setFiltros({ ...filtros, cedula: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Contratista</label>
            <input
              type="text"
              placeholder="Ej: Efrain"
              value={filtros.nombre}
              onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="">Todos</option>
              <option value="ACTIVA">ACTIVA</option>
              <option value="PARCIAL">PARCIAL</option>
              <option value="CERRADA">CERRADA</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Hora Desde */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Desde</label>
            <input
              type="time"
              value={filtros.horaDesde}
              onChange={(e) => setFiltros({ ...filtros, horaDesde: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Hora Hasta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Hasta</label>
            <input
              type="time"
              value={filtros.horaHasta}
              onChange={(e) => setFiltros({ ...filtros, horaHasta: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          {/* Botón Limpiar */}
          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => setOrden({ campo: 'numeroConsecutivo', direccion: orden.campo === 'numeroConsecutivo' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                >
                  Número {orden.campo === 'numeroConsecutivo' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => setOrden({ campo: 'cedula', direccion: orden.campo === 'cedula' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                >
                  Cédula {orden.campo === 'cedula' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => setOrden({ campo: 'nombre', direccion: orden.campo === 'nombre' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                >
                  Contratista {orden.campo === 'nombre' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => setOrden({ campo: 'ingresadas', direccion: orden.campo === 'ingresadas' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 justify-center w-full"
                >
                  Ingresadas {orden.campo === 'ingresadas' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => setOrden({ campo: 'pendientes', direccion: orden.campo === 'pendientes' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 justify-center w-full"
                >
                  Pendientes {orden.campo === 'pendientes' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => setOrden({ campo: 'estado', direccion: orden.campo === 'estado' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 justify-center w-full"
                >
                  Estado {orden.campo === 'estado' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => setOrden({ campo: 'fechaEntrada', direccion: orden.campo === 'fechaEntrada' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 justify-center w-full"
                >
                  Fecha {orden.campo === 'fechaEntrada' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => setOrden({ campo: 'hora', direccion: orden.campo === 'hora' && orden.direccion === 'asc' ? 'desc' : 'asc' })}
                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 justify-center w-full"
                >
                  Hora {orden.campo === 'hora' && (orden.direccion === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registrosEnPagina.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{c.numeroConsecutivo}</td>
                <td className="px-4 py-3 text-gray-700">{c.contratista.cedula}</td>
                <td className="px-4 py-3 text-gray-700">{c.contratista.nombre}</td>
                <td className="px-4 py-3 text-center text-gray-700">{(c.items || []).reduce((sum, item) => sum + item.cantidad, 0)}</td>
                <td className="px-4 py-3 text-center text-gray-700">{calcularPendientes(c)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    calcularEstadoReal(c) === 'CERRADA' ? 'bg-green-100 text-green-800' :
                    calcularEstadoReal(c) === 'PARCIAL' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {calcularEstadoReal(c)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{formatoFecha(new Date(c.fechaEntrada))}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-900">{formatoHora(new Date(c.fechaEntrada))}</td>
                <td className="px-4 py-3 text-center">
                  <a href={`/custodia/${c.numeroConsecutivo}/reporte`} className="text-blue-600 hover:text-blue-800 font-semibold">
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación y Resumen */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Resumen */}
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{indiceInicio + 1}-{Math.min(indiceFin, totalRegistros)}</span> de <span className="font-semibold text-gray-900">{totalRegistros}</span> custodias
          </p>

          {/* Selector de registros por página */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Registros por página:</label>
            <select
              value={registrosPorPagina}
              onChange={(e) => handleCambiarRegistrosPorPagina(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              ← Anterior
            </button>

            <span className="text-sm font-semibold text-gray-700">
              Página <span className="text-gray-900">{paginaActual}</span> de <span className="text-gray-900">{totalPaginas}</span>
            </span>

            <button
              onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
