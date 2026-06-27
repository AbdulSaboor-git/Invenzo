'use client';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800 flex items-center justify-center gap-2">
      <span>📡</span>
      <span>You&apos;re offline — showing cached data. Changes won&apos;t be saved until you reconnect.</span>
    </div>
  );
}
