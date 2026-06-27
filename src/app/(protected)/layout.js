'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAuthUser from '@/hooks/authUser';
import Loading from '../loading';
import OfflineBanner from '@/components/OfflineBanner';

/**
 * BUG-03 fix:
 * The original code called redirect() from next/navigation inside a useEffect.
 * redirect() is designed for Server Components / Server Actions — calling it
 * from a Client Component throws a NEXT_REDIRECT error caught by the error
 * boundary instead of navigating the user.
 *
 * Fix: use router.replace() for client-side navigation, which is the correct
 * API in a Client Component.
 */
export default function ProtectedLayout({ children }) {
  const { user, userLoading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return <Loading />;
  }

  if (!user && !userLoading) {
    return <Loading />;
  }

  return (
    <div>
      <OfflineBanner />
      {children}
    </div>
  );
}
