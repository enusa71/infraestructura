'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  DashboardIcon,
  EntradaIcon,
  SalidaIcon,
  HistorialIcon,
  AuditoriaIcon,
  PerfilIcon,
  ConfigIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from './Icons';

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/reportes', label: 'Reportes', icon: DashboardIcon },
    { href: '/entrada', label: 'Entrada', icon: EntradaIcon },
    { href: '/salida', label: 'Salida', icon: SalidaIcon },
    { href: '/historial', label: 'Historial', icon: HistorialIcon },
    { href: '/auditoria', label: 'Auditoría', icon: AuditoriaIcon },
    { href: '/perfil', label: 'Mi Perfil', icon: PerfilIcon },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-gray-100 rounded-lg hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-slate-800 text-gray-100 flex flex-col transition-transform duration-300 md:transform-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-40`}
      >
        {/* Logo Section */}
        <div className="px-6 py-8 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">Custodia</h1>
          <p className="text-xs text-gray-400 mt-1">ZFB Herramientas</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  active
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-300 hover:bg-slate-700/50'
                }`}
              >
                <Icon />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-2">
          <Link
            href="/admin/consecutivos"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-slate-700/50 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <ConfigIcon />
            <span>Administración</span>
          </Link>
          <Link
            href="/perfil"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-slate-700/50 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <ConfigIcon />
            <span>Mi Perfil</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogoutIcon />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
