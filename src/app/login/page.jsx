'use client';

import React, { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/userSlice';
import { toast } from 'sonner';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import Footer from '@/components/footer';
import Loading from '../loading';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { user, userLoading } = useAuthUser();
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (!userLoading && user) {
  //     router.push('/inventory');
  //   }
  // }, [user, userLoading, router]);
  const { userLoading, prefsLoading } = useAuthRedirect();

  if (userLoading || prefsLoading) {
    return <Loading />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      toast.error(
        'Network not available. Please check your internet connection.'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 403) {
        // User is inactive or forbidden
        toast.error('Your account has been deactivated.');
        return;
      }

      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        throw new Error(data.error || 'Login failed');
      }

      // Handle successful login (e.g., store token, user info, redirect user)
      // Set the cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userFetchedAt', Date.now());
      }
      toast.success('Logged in successfully');
      dispatch(setUser(data.user)); // Store user in Redux
      setTimeout(() => {
        router.push('/');
      }, 0); // Redirect to a different page after successful login
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center ">
      {/* Header */}
      <header className="sticky top-0 w-full bg-white shadow px-4 md:px-6 py-3">
        <img
          src="/invenzo_logo.png"
          alt="Invenzo Logo"
          draggable={false}
          className="max-h-10 md:max-h-12"
        />
      </header>
      {/* Login Form */}
      <div className="flex w-full min-h-[80vh] flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/invenzo_icon.png"
              alt="Invenzo Icon"
              draggable={false}
              className="rounded-full shadow-sm w-[60px] aspect-square"
            />
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-800 mb-8">
            Welcome Back
          </h2>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-5 text-gray-700 text-sm font-medium"
          >
            <div>
              <label className="block mb-2" htmlFor="email">
                Email
              </label>
              <input
                spellCheck="false"
                autoCorrect="off"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                id="email"
                type="email"
                placeholder="you@invenzo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                required
              />
            </div>

            <div>
              <label className="block mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                id="password"
                type="password"
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-center mt-6">
              <button
                disabled={loading}
                className={`w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 transition-all duration-200 shadow-sm ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                type="submit"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
