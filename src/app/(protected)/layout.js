'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAuthUser from '@/hooks/authUser';
import Loading from '../loading';
import NotFound from '../not-found';

export default function ProtectedLayout({ children }) {
  const { user, userLoading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      // router.replace('/login');
      return;
    }
  }, [user, userLoading]);

  if (userLoading) {
    return <Loading />;
  }

  if (!user && !userLoading) {
    return <NotFound />;
  }

  return <>{children}</>;
}
