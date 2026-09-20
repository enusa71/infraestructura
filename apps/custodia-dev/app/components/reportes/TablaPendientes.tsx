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
  diasPendiente: number;
}

interface TablaPendientesProps {
  custodias: CustodiaPendiente[];
}

export function TablaPendientes({ custodias }: TablaPendientesProps) {
  const calcularDias = (fecha: string) => {
    const hoy = new Date();
    const fechaEntrada = new Date(fecha);
    const diferencia = hoy.getTime() - fechaEntrada.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  const custodiasPendientes = custodias.filter((c) => c.estado !== 'CERRADA');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Custodias Pendientes ({custodiasPendientes.length})
      </h2>

      {custodiasPendientes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          ✓ No hay custodias pendientes
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Número</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Contratista</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Zona</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Días Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {custodiasPendientes.map((custodia) => {
                const dias = calcularDias(custodia.fechaEntrada);
                const esAlerta = dias > 7;

                return (
                  <tr
                    key={custodia.id}
                    className={`border-b border-gray-200 ${
                      esAlerta ? 'bg-red-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {custodia.numeroConsecutivo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{custodia.contratista.nombre}</div>
                      <div className="text-xs text-gray-500">C.C.: {custodia.contratista.cedula}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{custodia.zonaFranca}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          custodia.estado === 'ACTIVA'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {custodia.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          esAlerta ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {dias} días {esAlerta && '⚠️'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
