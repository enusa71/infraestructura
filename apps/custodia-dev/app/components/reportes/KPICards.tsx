interface KPICardsProps {
  totalCustodias: number;
  custodiasActivas: number;
  custodiasCerradas: number;
  custodiasParciales: number;
  tasaCumplimiento: number;
}

export function KPICards({
  totalCustodias,
  custodiasActivas,
  custodiasCerradas,
  custodiasParciales,
  tasaCumplimiento,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      {/* Total Custodias */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-sm font-semibold text-gray-600 mb-2">Total Custodias</div>
        <div className="text-4xl font-bold text-gray-900">{totalCustodias}</div>
        <div className="text-xs text-gray-500 mt-2">Todas las custodias</div>
      </div>

      {/* Activas */}
      <div className="bg-white rounded-lg border border-yellow-200 shadow-sm p-6">
        <div className="text-sm font-semibold text-yellow-700 mb-2">Activas</div>
        <div className="text-4xl font-bold text-yellow-600">{custodiasActivas}</div>
        <div className="text-xs text-gray-500 mt-2">En proceso</div>
      </div>

      {/* Cerradas */}
      <div className="bg-white rounded-lg border border-green-200 shadow-sm p-6">
        <div className="text-sm font-semibold text-green-700 mb-2">Cerradas</div>
        <div className="text-4xl font-bold text-green-600">{custodiasCerradas}</div>
        <div className="text-xs text-gray-500 mt-2">Completadas</div>
      </div>

      {/* Parciales */}
      <div className="bg-white rounded-lg border border-orange-200 shadow-sm p-6">
        <div className="text-sm font-semibold text-orange-700 mb-2">Parciales</div>
        <div className="text-4xl font-bold text-orange-600">{custodiasParciales}</div>
        <div className="text-xs text-gray-500 mt-2">Incompletas</div>
      </div>

      {/* Tasa de Cumplimiento */}
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-6">
        <div className="text-sm font-semibold text-blue-700 mb-2">Cumplimiento</div>
        <div className="text-4xl font-bold text-blue-600">{tasaCumplimiento}%</div>
        <div className="text-xs text-gray-500 mt-2">Cerradas + Parciales</div>
      </div>
    </div>
  );
}
