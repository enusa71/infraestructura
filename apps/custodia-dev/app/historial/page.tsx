import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import FiltrosHistorial from '@/app/components/historial/FiltrosHistorial';

export const dynamic = 'force-dynamic';

interface CustodiaInfo {
  id: string;
  numeroConsecutivo: string;
  contratista: {
    cedula: string;
    nombre: string;
  };
  estado: string;
  fechaEntrada: Date;
  fechaSalida?: Date;
  items: any[];
  salidas?: any[];
}

export default async function HistorialPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  let custodias: CustodiaInfo[] = [];

  try {
    const data = await prisma.custodia.findMany({
      include: {
        contratista: true,
        items: true,
        salidas: {
          include: { items: true },
          orderBy: { fechaSalida: 'desc' },
        },
      },
      orderBy: { fechaEntrada: 'desc' },
    });

    custodias = data.map(c => ({
      id: c.id,
      numeroConsecutivo: c.numeroConsecutivo,
      contratista: c.contratista,
      estado: c.estado,
      fechaEntrada: c.fechaEntrada,
      fechaSalida: c.fechaSalida,
      items: c.items,
      salidas: c.salidas,
    }));
  } catch (err) {
    console.error('Error cargando custodias:', err);
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Historial de Custodias</h1>
      <p className="text-sm text-gray-500 mb-8">Consulta y visualiza todas las custodias registradas</p>
      <FiltrosHistorial custodias={custodias} />
    </>
  );
}
