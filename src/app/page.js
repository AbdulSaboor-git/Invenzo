'use client';
import React, { useEffect } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import Loading from './loading';

export default function Home() {
  const { userLoading, prefsLoading } = useAuthRedirect();

  if (userLoading || prefsLoading) {
    return <Loading />;
  }
  return (
    <main className={`flex flex-col items-center justify-between`}>
      <div className="max-w-[1440px] w-full"></div>
    </main>
  );
}
