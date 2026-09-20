'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buscarCustodia, crearSalida } from '../custodia/actions';
import { SalidaConfirmacionStep } from '../components/salida/SalidaConfirmacionStep';
import ProtectorPerfilAuxiliar from '../components/ProtectorPerfilAuxiliar';
import { obtenerOGuardarAuxiliar } from '@/app/api/auxiliar/actions';
import { useAuxiliarSession } from '@/app/hooks/useAuxiliarSession';

export default function SalidaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userEmail: sessionUserEmail, loaded: sessionLoaded } = useAuxiliarSession();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState<"busqueda" | "confirmacion" | "registrada">("busqueda");
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<'numero' | 'cedula' | 'nombre'>('numero');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [custodia, setCustodia] = useState<any>(null);
  const [herramientasSalida, setHerramientasSalida] = useState<{ id: string; herramientaNombre: string; cantidad: number; cantidadSalida: number }[]>([]);
  const [guardandoSalida, setGuardandoSalida] = useState(false);
  const [custodias, setCustodias] = useState<any[]>([]);
  const [auxiliar, setAuxiliar] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (sessionLoaded) {
        await cargarAuxiliar();
        await cargarActivas();
        setMounted(true);
      }
    };
    init();
  }, [sessionLoaded]);

  const cargarAuxiliar = async () => {
    try {
      const result = await obtenerOGuardarAuxiliar(sessionUserEmail);
      if (result.success && result.auxiliar) {
        setUserEmail(result.userEmail || '');
        setAuxiliar(result.auxiliar);
      }
    } catch (err) {
      console.error('Error cargando auxiliar:', err);
    }
  };

  const cargarActivas = async () => {
    try {
      const resActiva = await fetch('/api/historial/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filtro: '', tipoFiltro: 'numero', estado: 'ACTIVA' }),
      });
      const dataActiva = await resActiva.json();

      const resParcial = await fetch('/api/historial/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filtro: '', tipoFiltro: 'numero', estado: 'PARCIAL' }),
      });
      const dataParcial = await resParcial.json();

      if (dataActiva.success && dataParcial.success) {
        let todas = [...(dataActiva.custodias || []), ...(dataParcial.custodias || [])];

        todas = todas.filter(custodia => {
          const cantidadSalidaTotal = (custodia.salidas || []).reduce((total: number, salida: any) => {
            return total + ((salida.items || []).reduce((sum: number, item: any) => sum + item.cantidadSalida, 0));
          }, 0);
          const cantidadIngresada = (custodia.items || []).reduce((total: number, item: any) => total + item.cantidad, 0);
          return cantidadSalidaTotal < cantidadIngresada;
        });

        console.log('📋 Custodias con pendientes:', todas.length);
        setCustodias(todas);
        return todas;
      }
    } catch (err) {
      console.error('Error cargando custodias:', err);
    }
    return [];
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBuscando(true);

    try {
      if (tipoFiltro === 'cedula') {
        const cedulaFiltradas = custodias.filter(c => c.contratista.cedula === filtro);
        if (cedulaFiltradas.length === 1) {
          await seleccionarCustodia(cedulaFiltradas[0].id);
        } else if (cedulaFiltradas.length > 1) {
          setCustodias(cedulaFiltradas);
          setError("Múltiples custodias encontradas. Selecciona una de las tarjetas.");
        } else {
          setError("No hay custodias activas/pendientes para esa cédula");
        }
      } else {
        const res = await fetch('/api/historial/buscar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filtro, tipoFiltro, estado: '' }),
        });
        const data = await res.json();
        if (data.success && data.custodias.length > 0) {
          await seleccionarCustodia(data.custodias[0].id);
        } else {
          setError("Custodia no encontrada");
        }
      }
    } catch (err) {
      setError("Error buscando custodia");
    }

    setBuscando(false);
  };

  const seleccionarCustodia = async (custodiaId: string) => {
    const result = await buscarCustodia(custodiaId);
    if (result.success && result.custodia) {
      setCustodia(result.custodia);
      const salidas = (result.custodia.items || [])
        .map((item: any) => {
          const cantidadSalidaTotal = (result.custodia.salidas || []).reduce((total: number, salida: any) => {
            const salidaDelItem = (salida.items || []).find((si: any) => si.itemId === item.id);
            return total + (salidaDelItem?.cantidadSalida || 0);
          }, 0);
          const cantidadPendiente = item.cantidad - cantidadSalidaTotal;
          return {
            id: item.id,
            herramientaNombre: item.herramienta?.nombre || item.descripcion || 'Sin nombre',
            cantidad: item.cantidad,
            cantidadSalidaTotal,
            cantidadSalida: Math.max(0, cantidadPendiente),
          };
        })
        .filter((item: any) => item.cantidadSalida > 0);
      setHerramientasSalida(salidas);
      setStep("confirmacion");
    }
  };


  const handleConfirmar = async (firmaContratista: any, herramientas: any[], retirante?: any) => {
    setGuardandoSalida(true);
    setError("");

    try {
      const datosRetira = {
        retiraNombre: retirante?.nombre || custodia.contratista.nombre,
        retiraCedula: retirante?.cedula || custodia.contratista.cedula,
        retiraEmpresa: retirante ? undefined : custodia.contratista.empresa,
        auxiliarNombre: auxiliar?.nombre,
        auxiliarCedula: auxiliar?.cedula,
        firmaRetiraDatos: firmaContratista?.base64,
        firmaRetiraTimestamp: firmaContratista?.timestamp || new Date().toISOString(),
        firmaAuxiliarDatos: auxiliar?.firmaBase64,
      };

      const result = await crearSalida(
        custodia.id,
        herramientas.map((item) => ({ itemId: item.id, cantidadSalida: item.cantidadSalida })),
        datosRetira
      );

      if (result.success) {
        try {
          await fetch(`/api/custodia/${custodia.numeroConsecutivo}/pdf`, {
            method: 'POST',
          });
        } catch (pdfErr) {
          console.error('Error generando PDF:', pdfErr);
        }
        setStep("registrada");
      } else {
        setError(result.error || "Error registrando salida");
      }
    } catch (err) {
      setError("Error inesperado al guardar la salida");
      console.error(err);
    } finally {
      setGuardandoSalida(false);
    }
  };



  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Cargando...</div></div>;
  }

  return (
    <ProtectorPerfilAuxiliar>
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Salida de Herramientas</h1>
          <p className="text-gray-600">Registro de salida/retiro de herramientas</p>
        </div>
        {/* Step 1: Búsqueda */}
        {step === "busqueda" && (
          <>
            {/* Formulario de búsqueda - ARRIBA */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 mb-6 md:mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Buscar Custodia para Salida</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              <form onSubmit={handleBuscar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Buscar por:
                  </label>
                  <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="numero">Número Custodia</option>
                    <option value="cedula">Cédula Contratista</option>
                    <option value="nombre">Nombre Contratista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Valor búsqueda
                  </label>
                  <input
                    type="text"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder={
                      tipoFiltro === 'numero'
                        ? 'Ej: 062408001'
                        : tipoFiltro === 'cedula'
                        ? 'Ej: 73015491'
                        : 'Ej: Efrain Nunez'
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={buscando || !filtro}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                  >
                    {buscando ? "Buscando..." : "🔍 Buscar"}
                  </button>
                </div>
              </div>
            </form>
            </div>

            {/* Custodias Activas - ABAJO */}
            {mounted && custodias.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Custodias Activas (Pendientes de Salida)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {custodias.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => seleccionarCustodia(c.id)}
                      className="text-left p-4 md:p-3 border-2 border-yellow-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-500 transition active:scale-95"
                    >
                      <p className="font-bold text-base md:text-sm text-black">#{c.numeroConsecutivo}</p>
                      <p className="text-base md:text-sm text-gray-700 mt-1">{c.contratista.nombre}</p>
                      <p className="text-sm md:text-xs text-gray-500">Cédula: {c.contratista.cedula}</p>
                      <p className="text-sm md:text-xs text-gray-500 mt-2 md:mt-1">
                        {
                          (() => {
                            const cantidadSalidaTotal = (c.salidas || []).reduce((total: number, salida: any) => {
                              return total + ((salida.items || []).reduce((sum: number, item: any) => sum + item.cantidadSalida, 0));
                            }, 0);
                            const cantidadIngresada = (c.items || []).reduce((total: number, item: any) => total + item.cantidad, 0);
                            const pendientes = cantidadIngresada - cantidadSalidaTotal;
                            return `${pendientes} herramienta${pendientes !== 1 ? 's' : ''} pendiente${pendientes !== 1 ? 's' : ''}`;
                          })()
                        }
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Confirmación */}
        {step === "confirmacion" && custodia && auxiliar && (
          <SalidaConfirmacionStep
            custodia={custodia}
            herramientasSalida={herramientasSalida}
            auxiliar={{
              nombre: auxiliar.nombre,
              cedula: auxiliar.cedula,
              firmaBase64: auxiliar.firmaBase64,
            }}
            onConfirmar={handleConfirmar}
            onBack={() => {
              setCustodia(null);
              setHerramientasSalida([]);
              setStep("busqueda");
            }}
            guardando={guardandoSalida}
          />
        )}

        {/* Step Registrada: Success Message */}
        {step === "registrada" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <div className="text-8xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Salida Registrada</h2>
            <p className="text-lg text-gray-700 mb-8">La salida ha sido registrada exitosamente.</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 text-sm"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </>
    </ProtectorPerfilAuxiliar>
  );
}
