'use client';

import { useOnline } from '@/hooks/useOnline';

export function NetworkStatus() {
  const isOnline = useOnline();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="text-sm font-medium">
        📡 Sin conexión - Los datos se sincronizarán cuando haya internet
      </span>
    </div>
  );
}
