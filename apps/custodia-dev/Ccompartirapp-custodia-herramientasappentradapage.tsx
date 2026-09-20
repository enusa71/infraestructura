'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { buscarHerramientas, crearHerramienta } from '../admin/herramientas/actions';
import { crearCustodia } from '../custodia/actions';
import SignatureCanvas from '../components/SignatureCanvas';
import { obtenerOGuardarAuxiliar, guardarFirmaAuxiliar } from '@/app/api/auxiliar/actions';

interface Herramienta {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

interface Item {
  herramienta: Herramienta;
  cantidad: number;
}

export default function EntradaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [paso, setPaso] = useState(1);
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [zonaFranca, setZonaFranca] = useState('');
  const [puerta, setPuerta] = useState('');
  const [placa, setPlaca] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Herramienta[]>([]);
  const [cantidad, setCantidad] = useState(1);
  const [pestaña, setPestaña] = useState<'buscar' | 'crear'>('buscar');
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [firmaIngreso, setFirmaIngreso] = useState('');
  const [firmaGuardia, setFirmaGuardia] = useState('');

  // Auxiliar data (loaded automatically)
  const [auxiliar, setAuxiliar] = useState<any>(null);
  const [firmaAuxiliarCaptura, setFirmaAuxiliarCaptura] = useState('');
  const [cargandoAuxiliar, setCargandoAuxiliar] = useState(true);
  const [necesitaCapturar, setNecesitaCapturar] = useState(false);

  useEffect(() => {
    setMounted(true);
    cargarAuxiliar();
  }, []);

  const cargarAuxiliar = async () => {
    try {
      const result = await obtenerOGuardarAuxiliar();
      if (result.success && result.auxiliar) {
        setAuxiliar(result.auxiliar);
        setFirmaGuardia(result.auxiliar.firmaBase64 || '');

        if (!result.auxiliar.firmaBase64) {
          setNecesitaCapturar(true);
          setPaso(0);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setCargandoAuxiliar(false);
    }
  };

  const handleBuscar = async (q: string) => {
    setBusqueda(q);
    setError('');
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    try {
      const result = await buscarHerramientas(q);
      if (result.success) {
        setResultados(result.herramientas || []);
      }
    } catch (err) {
      setError('Error buscando herramientas');
      setResultados([]);
    }
  };

  const agregarItem = (herramienta: Herramienta) => {
    const exists = items.find((i) => i.herramienta.id === herramienta.id);
    if (exists) {
      setItems(items.map((i) =>
        i.herramienta.id === herramienta.id ? { ...i, cantidad: i.cantidad + cantidad } : i
      ));
    } else {
      setItems([...items, { herramienta, cantidad }]);
    }
    limpiarBusqueda();
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setResultados([]);
    setCantidad(1);
    setPestaña('buscar');
  };

  const handleCrearRapido = async (e?: React.KeyboardEvent | React.FormEvent) => {
    if (e?.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (!nuevaNombre.trim()) return;

    try {
      const result = await crearHerramienta(nuevaNombre, nuevaDesc);
      if (result.success && result.herramienta) {
        agregarItem(result.herramienta);
        setNuevaNombre('');
        setNuevaDesc('');
      }
    } catch (err) {
      setError('Error creando herramienta');
    }
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter((i) => i.herramienta.id !== id));
  };

  const cargarContratista = async (cedulaBuscada: string) => {
    if (!cedulaBuscada || cedulaBuscada.length < 5) return;
    try {
      const res = await fetch(`/api/contratista/buscar?cedula=${cedulaBuscada}`);
      const data = await res.json();
      if (data.success && data.contratista) {
        setNombre(data.contratista.nombre);
        setEmpresa(data.contratista.empresa || '');
      }
    } catch (err) {
      console.error('Error cargando contratista:', err);
    }
  };

  const handleCapturarFirmaAuxiliar = async () => {
    if (!firmaAuxiliarCaptura) {
      setError('Debes capturar tu firma');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      const result = await guardarFirmaAuxiliar(
        firmaAuxiliarCaptura,
        auxiliar?.nombre || '',
        auxiliar?.cedula || ''
      );

      if (result.success) {
        setFirmaGuardia(firmaAuxiliarCaptura);
        setNecesitaCapturar(false);
        setPaso(1);
      } else {
        setError(result.error || 'Error guardando firma');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paso === 1) {
      if (!cedula || !nombre || !zonaFranca || !puerta) {
        setError('Cédula, nombre, zona franca y puerta son requeridos');
        return;
      }
      if ((puerta === 'VEH. LIVIANOS' || puerta === 'E. CARGA') && !placa.trim()) {
        setError('Placa es requerida para vehículos');
        return;
      }
      setPaso(2);
    } else if (paso === 2) {
      if (items.length === 0) {
        setError('Debes agregar al menos una herramienta');
        return;
      }
      setPaso(3);
    } else if (paso === 3) {
      if (!firmaIngreso) {
        setError('Debes firmar como contratista para avalar la entrada');
        return;
      }
      // La firma del auxiliar se usa si está disponible, si no, se permite continuar
      // if (!firmaGuardia) {
      //   setError('Firma del auxiliar no disponible');
      //   return;
      // }
      setGuardando(true);
      try {
        const result = await crearCustodia(
          cedula,
          nombre,
          items.map((i) => ({ herramientaId: i.herramienta.id, cantidad: i.cantidad })),
          empresa,
          zonaFranca,
          puerta,
          placa || null,
          firmaIngreso,
          firmaGuardia,
          auxiliar?.nombre,
          auxiliar?.cedula
        );

        if (result.success && result.custodia) {
          alert(`✓ Entrada #${result.custodia.numeroConsecutivo} registrada\nContratista: ${nombre}\nHerramientas: ${items.length}`);
          setCedula('');
          setNombre('');
          setEmpresa('');
          setZonaFranca('');
          setPuerta('');
          setPlaca('');
          setItems([]);
          setFirmaIngreso('');
          setPaso(1);
        } else {
          setError('Error guardando entrada');
        }
      } finally {
        setGuardando(false);
      }
    }
  };

  if (!mounted || cargandoAuxiliar) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">FORMATO DE MOVIMIENTO DE MERCANCÍA</h1>
              {necesitaCapturar ? (
                <p className="text-sm md:text-base text-gray-600">Primero: Captura tu firma</p>
              ) : (
                <p className="text-sm md:text-base text-gray-600">Paso {paso} de 3</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {necesitaCapturar && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
              <p className="text-yellow-700 font-semibold mb-2">📝 Primera vez en el sistema</p>
              <p className="text-sm text-yellow-700">Debes capturar tu firma. Esta será usada en todas tus operaciones futuras.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {necesitaCapturar && paso === 0 && (
              <div className="space-y-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-black border-b pb-2">Captura tu Firma</h2>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Email:</strong> {session?.user?.email}
                  </p>
                  {auxiliar?.nombre && (
                    <p className="text-sm text-blue-700">
                      <strong>Nombre:</strong> {auxiliar.nombre}
                    </p>
                  )}
                  {auxiliar?.cedula && (
                    <p className="text-sm text-blue-700">
                      <strong>Cédula:</strong> {auxiliar.cedula}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-base md:text-sm font-semibold text-black mb-3">
                    Tu Firma (Auxilar de Seguridad)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Firma en el área blanca. Esta firma será usada en todas tus operaciones.</p>
                  <SignatureCanvas
                    onSignatureChange={setFirmaAuxiliarCaptura}
                    width={400}
                    height={150}
                  />
                </div>
              </div>
            )}

            {paso === 1 && (
              <div className="space-y-5 md:space-y-4">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-black border-b pb-2">Datos de Entrada</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base md:text-sm font-medium text-black mb-2 md:mb-1">Zona Franca</label>
                    <select
                      value={zonaFranca}
                      onChange={(e) => setZonaFranca(e.target.value)}
                      className="w-full px-4 py-3 md:py-2 md:px-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm text-black"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="ZFB">ZFB</option>
                      <option value="ZOFIA">ZOFIA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base md:text-sm font-medium text-black mb-2 md:mb-1">Puerta</label>
                    <select
                      value={puerta}
                      onChange={(e) => setPuerta(e.target.value)}
                      className="w-full px-4 py-3 md:py-2 md:px-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm text-black"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="PEATONAL">PEATONAL</option>
                      <option value="VEH. LIVIANOS">VEH. LIVIANOS</option>
                      <option value="E. CARGA">E. CARGA</option>
                    </select>
                  </div>
                </div>

                {(puerta === 'VEH. LIVIANOS' || puerta === 'E. CARGA') && (
                  <div>
                    <label className="block text-base md:text-sm font-medium text-black mb-2 md:mb-1">
                      Placa (si aplica)
                    </label>
                    <input
                      type="text"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      placeholder="Ej: ABC-123"
                      className="w-full px-4 py-3 md:py-2 md:px-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm text-black"
                    />
                  </div>
                )}

                <hr className="my-4" />

                <h2 className="text-lg md:text-xl font-semibold mb-4 text-black border-b pb-2">Datos del Contratista</h2>

                <div>
                  <label className="block text-base md:text-sm font-medium text-black mb-2 md:mb-1">Cédula</label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    onBlur={(e) => cargarContratista(e.target.value)}
                    placeholder="1098765432"
                    autoComplete="off"
                    className="w-full px-4 py-3 md:py-2 md:px-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base md:text-sm font-medium text-black mb-2 md:mb-1">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan Pérez García"
                    autoComplete="off"
                    className="w-full px-4 py-3 md:py-2 md:px-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base md:text-sm font-medium text-black mb-2 md:mb-1">
                    Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Construcciones Pérez SAS"
                    autoComplete="off"
                    className="w-full px-4 py-3 md:py-2 md:px-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm text-black"
                  />
                </div>
              </div>
            )}

            {paso === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4 text-black">Herramientas a Ingresar</h2>
                <p className="text-sm text-gray-600">
                  Contratista: <strong className="text-black">{nombre}</strong> ({cedula})
                </p>

                <div className="bg-gray-50 p-4 md:p-3 rounded">
                  <div className="flex gap-2 mb-4 border-b">
                    <button
                      type="button"
                      onClick={() => setPestaña('buscar')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        pestaña === 'buscar'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      🔍 Buscar en catálogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPestaña('crear')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        pestaña === 'crear'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      ➕ Crear nueva
                    </button>
                  </div>

                  {pestaña === 'buscar' && (
                    <div>
                      <label className="block text-base md:text-sm font-medium text-black mb-3 md:mb-2">
                        Buscar herramienta
                      </label>
                      <div className="flex flex-col md:flex-row gap-2 mb-2">
                        <input
                          type="text"
                          value={busqueda}
                          onChange={(e) => handleBuscar(e.target.value)}
                          placeholder="Ej: Taladro, Sierra, Nivel..."
                          className="flex-1 px-4 py-3 md:py-2 md:px-3 border rounded text-base md:text-sm text-black"
                          autoComplete="off"
                          autoFocus
                        />
                        <div>
                          <label className="block text-sm md:text-xs text-black mb-2 md:mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full md:w-20 px-3 py-3 md:py-2 border rounded text-black text-center text-base md:text-sm"
                          />
                        </div>
                      </div>

                      {resultados.length > 0 && (
                        <div className="border rounded max-h-72 md:max-h-64 overflow-y-auto mb-2">
                          {resultados.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => agregarItem(h)}
                              className="w-full text-left p-4 md:p-3 hover:bg-blue-50 border-b last:border-b-0 text-black"
                            >
                              <div className="font-medium text-base md:text-sm">{h.nombre}</div>
                              <div className="text-sm md:text-xs text-gray-500">{h.descripcion}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {busqueda && resultados.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-700">
                          No se encontraron resultados. Usa la pestaña "Crear nueva" para agregar una herramienta.
                        </div>
                      )}
                    </div>
                  )}

                  {pestaña === 'crear' && (
                    <div>
                      <label className="block text-base md:text-sm font-medium text-black mb-3">
                        Crear nueva herramienta
                      </label>
                      <input
                        type="text"
                        value={nuevaNombre}
                        onChange={(e) => setNuevaNombre(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCrearRapido()}
                        placeholder="Nombre de herramienta (Ej: Taladro de 1/2)"
                        className="w-full px-4 py-3 md:py-2 md:px-3 border rounded mb-3 text-base md:text-sm text-black focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                        autoFocus
                      />
                      <textarea
                        value={nuevaDesc}
                        onChange={(e) => setNuevaDesc(e.target.value)}
                        placeholder="Descripción (opcional)"
                        className="w-full px-4 py-3 md:py-2 md:px-3 border rounded mb-4 md:mb-3 text-base md:text-sm text-black focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCrearRapido}
                          className="flex-1 px-4 py-3 md:py-2 md:px-3 bg-green-600 text-white text-base md:text-sm font-medium rounded hover:bg-green-700 transition-colors"
                        >
                          ✓ Crear y agregar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNuevaNombre('');
                            setNuevaDesc('');
                            setPestaña('buscar');
                          }}
                          className="flex-1 px-4 py-3 md:py-2 md:px-3 bg-gray-400 text-white text-base md:text-sm font-medium rounded hover:bg-gray-500 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">💡 Presiona Enter para crear rápidamente</p>
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t pt-4 md:pt-3">
                    <h3 className="font-semibold mb-4 md:mb-3 text-base md:text-lg text-black">
                      Herramientas ingresadas ({items.length})
                    </h3>
                    <div className="space-y-3 md:space-y-2">
                      {items.map((item, idx) => (
                        <div
                          key={item.herramienta.id}
                          className="flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50 p-4 md:p-3 rounded gap-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-base md:text-sm text-black">{item.herramienta.nombre}</div>
                            <div className="text-sm md:text-xs text-gray-500">{item.herramienta.descripcion}</div>
                          </div>
                          <div className="flex gap-2 items-end">
                            <div>
                              <label className="block text-sm md:text-xs text-black mb-2 md:mb-1">Cantidad</label>
                              <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].cantidad = Math.max(1, parseInt(e.target.value) || 1);
                                  setItems(newItems);
                                }}
                                className="w-20 md:w-16 px-3 py-2 md:py-1 border rounded text-black text-center text-base md:text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarItem(item.herramienta.id)}
                              className="text-red-600 hover:text-red-800 text-xl"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {paso === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-black border-b pb-2">Revisión y Firma</h2>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <p className="text-sm text-blue-700 font-semibold mb-3">Revise toda la información antes de firmar</p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Zona Franca</label>
                        <p className="text-black font-semibold">{zonaFranca}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Puerta</label>
                        <p className="text-black font-semibold">{puerta}</p>
                      </div>
                      {placa && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Placa</label>
                          <p className="text-black font-semibold">{placa}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Cédula</label>
                        <p className="text-black font-semibold">{cedula}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-gray-600">Nombre</label>
                        <p className="text-black font-semibold">{nombre}</p>
                      </div>
                      {empresa && (
                        <div className="col-span-2">
                          <label className="text-xs font-semibold text-gray-600">Empresa</label>
                          <p className="text-black font-semibold">{empresa}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-blue-300 pt-3">
                      <label className="text-xs font-semibold text-gray-600">Herramientas ({items.length})</label>
                      <div className="space-y-1 mt-2">
                        {items.map((item) => (
                          <p key={item.herramienta.id} className="text-sm text-black">
                            • {item.herramienta.nombre} x {item.cantidad}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base md:text-sm font-semibold text-black mb-3">
                      Firma del Contratista
                    </label>
                    <p className="text-xs text-gray-600 mb-2">Firma en el área blanca para avalar esta entrada</p>
                    <SignatureCanvas
                      onSignatureChange={setFirmaIngreso}
                      width={300}
                      height={120}
                    />
                  </div>

                  <div>
                    <label className="block text-base md:text-sm font-semibold text-black mb-3">
                      Firma del Auxiliar de Seguridad (Guardada)
                    </label>
                    {auxiliar && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Auxiliar: {auxiliar.nombre}</p>
                        <p className="text-xs text-gray-600">Cédula: {auxiliar.cedula}</p>
                      </div>
                    )}
                    {firmaGuardia && (
                      <div className="border-2 border-gray-300 rounded bg-white p-2">
                        <img
                          src={firmaGuardia}
                          alt="Firma guardada"
                          className="max-h-24 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {necesitaCapturar && paso === 0 ? (
              <div className="flex gap-3 mt-8 md:mt-6">
                <button
                  type="button"
                  onClick={handleCapturarFirmaAuxiliar}
                  disabled={guardando || !firmaAuxiliarCaptura}
                  className="flex-1 px-4 py-4 md:py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-base md:text-sm"
                >
                  {guardando ? 'Guardando...' : '✓ Guardar Firma y Continuar'}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-8 md:mt-6">
                {paso > 1 && (
                  <button
                    type="button"
                    onClick={() => setPaso(paso - 1)}
                    className="flex-1 px-4 py-4 md:py-3 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 text-base md:text-sm"
                  >
                    ← Atrás
                  </button>
                )}
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 px-4 py-4 md:py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-base md:text-sm"
                >
                  {guardando ? 'Guardando...' : paso === 3 ? '✓ Confirmar y Registrar' : 'Siguiente →'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
