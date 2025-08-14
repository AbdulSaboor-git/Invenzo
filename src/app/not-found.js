import Header from '@/components/header';
import useAuthUser from '@/hooks/authUser';
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  const { user, logout } = useAuthUser();
  return (
    <main className=" w-full bg-white">
      <Header user={user} logout={logout} />
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="max-w-md p-6">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
