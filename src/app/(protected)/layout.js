'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import useAuthUser from '@/hooks/authUser';
import Loading from '../loading';
import OfflineBanner from '@/components/OfflineBanner';

// Routes to pre-fetch into the SW cache on first authenticated load.
// This solves the first-visit race condition: the SW installs AFTER the
// initial page fetch, so that first response is never cached. By fetching
// these routes while online and after the SW has activated (clientsClaim),
// we populate the 'pages-html' cache for offline use.
const WARMUP_ROUTES = [
  '/dashboard',
  '/inventory',
  '/pos',
  '/sales',
  '/categories',
  '/cashiers',
];

export default function ProtectedLayout({ children }) {
  const { user, userLoading } = useAuthUser();
  const router = useRouter();
  const hasWarmedUp = useRef(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  // SW cache warmup — runs exactly once after the user is confirmed authenticated.
  // Uses a ref (not state) because this is a fire-and-forget side effect with
  // no UI consequence. Each fetch is intercepted by the SW's NetworkFirst handler
  // and the 200 HTML response is stored in the 'pages-html' cache.
  useEffect(() => {
    if (!user || !navigator.onLine || hasWarmedUp.current) return;
    hasWarmedUp.current = true;
    WARMUP_ROUTES.forEach(route => {
      fetch(route, { credentials: 'same-origin' }).catch(() => {});
    });
  }, [user]);

  if (userLoading) return <Loading />;
  if (!user && !userLoading) return <Loading />;

  return (
    <div>
      <OfflineBanner />
      {children}
    </div>
  );
}
