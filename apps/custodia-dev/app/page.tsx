import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { Card, MetricCard } from "@/components/Card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const modules = [
    {
      href: '/entrada',
      icon: '📋',
      title: 'Entrada',
      description: 'Registra entrada de herramientas',
      color: 'blue'
    },
    {
      href: '/salida',
      icon: '📤',
      title: 'Salida',
      description: 'Registra salida de herramientas',
      color: 'green'
    },
    {
      href: '/historial',
      icon: '📊',
      title: 'Historial',
      description: 'Consulta custodias anteriores',
      color: 'purple'
    },
    {
      href: '/auditoria',
      icon: '🔍',
      title: 'Auditoría',
      description: 'Registro de operaciones',
      color: 'orange'
    },
  ];

  return (
    <>
      <PageHeader
        title="Inicio"
        description="Control de entrada/salida de herramientas - Zona Franca Barranquilla"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Módulos" value="4" />
        <MetricCard label="Estado" value="Operativo" />
        <MetricCard label="Acceso" value={session.user.email?.split('@')[0] || 'Usuario'} />
        <MetricCard label="Zona Franca" value="ZFB" />
      </div>

      {/* Modules Section */}
      <SectionTitle title="Módulos Disponibles" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card clickable>
              <div className="text-2xl mb-3">{module.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-xs text-gray-600 flex-1 mb-4">{module.description}</p>
              <div className="text-blue-600 text-xs font-semibold inline-block">Acceder →</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-2">Sistema Custodia - ZFB</h3>
        <p className="text-sm text-gray-600">
          Control digital de entrada/salida de herramientas y equipos para contratistas. Todos los registros incluyen fotogr&aacute;fas y firmas digitales.
        </p>
      </Card>
    </>
  );
}
