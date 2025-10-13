'use client';

import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAuthUser from '@/hooks/authUser';
import Loading from '../loading';
import NotFound from '../not-found';

export default function ProtectedLayout({ children }) {
  const { user, userLoading } = useAuthUser();
  // const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      redirect('/login');
    }
  }, [user, userLoading]);

  if (userLoading) {
    return <Loading />;
  }

  if (!user && !userLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
