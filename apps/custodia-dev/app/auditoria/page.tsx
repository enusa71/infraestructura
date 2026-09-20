import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface AuditLog {
  id: string;
  table: string;
  action: string;
  recordId: string;
  changes: any;
  userId: string;
  userEmail: string;
  createdAt: string;
}

export default async function AuditoriaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  let logs: AuditLog[] = [];

  try {
    const data = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    logs = data.map(log => ({
      id: log.id,
      table: log.table,
      action: log.action,
      recordId: log.recordId,
      changes: log.changes,
      userId: log.userId,
      userEmail: log.userEmail,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('Error cargando logs:', err);
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Auditoría del Sistema</h1>
      <p className="text-sm text-gray-500 mb-8">Registro de todas las operaciones del sistema</p>

      {/* Stats Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total de Registros</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {logs.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Fecha/Hora
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Usuario
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Acción
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Tabla
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      ID Registro
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-semibold text-gray-900">{log.userId}</p>
                        <p className="text-xs text-gray-500">{log.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.action === 'CREAR'
                              ? 'bg-green-100 text-green-800'
                              : log.action === 'SALIDA'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.table}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {log.recordId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-700 font-medium">
                            Ver cambios
                          </summary>
                          <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-40 font-mono border border-gray-700">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 px-6">
            <p>No hay registros de auditoría.</p>
          </div>
        )}
      </div>
    </>
  );
}
