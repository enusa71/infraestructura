'use client';

import { useEffect, useState } from 'react';

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      console.log('[Network] Online');
      setIsOnline(true);

      // Trigger sync cuando hay conexión
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          const syncReg = registration as unknown as { sync: { register: (tag: string) => Promise<void> } };
          syncReg.sync.register('sync-fotos').catch((err) => {
            console.error('Error registering sync:', err);
          });
        });
      }
    };

    const handleOffline = () => {
      console.log('[Network] Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
