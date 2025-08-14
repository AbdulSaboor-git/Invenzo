'use client';
import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setUserLoading, logoutUser } from '@/redux/userSlice';
import { toast } from 'sonner';

const THREE_HOURS = 0.1 * 60 * 1000; // 30s for testing

export default function useAuthUser() {
  const { user, userLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Clear inventory keys safely
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('inventoryData_'))
          localStorage.removeItem(key);
      }
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userFetchedAt');
    } catch (e) {
      console.error('Error clearing localStorage on logout', e);
    }

    dispatch(logoutUser());
    toast('Logged out');
  }, [dispatch]);

  const fetchFreshUser = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        toast.error('Your account has been deactivated. Logging out...');
        setTimeout(logout, 3000);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch fresh user');
      }

      const data = await res.json();
      if (data?.user) {
        if (!data.user.isActive) {
          toast.error('Your account has been deactivated. Logging out...');
          setTimeout(logout, 3000);
          return;
        }

        try {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userFetchedAt', String(Date.now()));
        } catch (e) {
          console.error('Error writing user to localStorage', e);
        }

        dispatch(setUser(data.user));
        toast('Fetched fresh user data');
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      toast.error('Failed to refresh user data.');
      if (err?.message?.includes('Invalid')) {
        logout();
      }
    }
  }, [dispatch, logout]);

  useEffect(() => {
    dispatch(setUserLoading(true));

    try {
      if (typeof window === 'undefined') {
        dispatch(setUser(null));
        return;
      }

      const storedUser = localStorage.getItem('user');
      const fetchedAt = parseInt(
        localStorage.getItem('userFetchedAt') || '0',
        10
      );

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser.isActive) {
          logout();
          return;
        }

        dispatch(setUser(parsedUser));

        const isStale = Date.now() - fetchedAt > THREE_HOURS;
        if (isStale && navigator.onLine) {
          fetchFreshUser();
        }
      } else {
        dispatch(setUser(null));
      }
    } catch (err) {
      console.error('Error loading user from localStorage', err);
      dispatch(setUser(null));
    } finally {
      dispatch(setUserLoading(false));
    }
  }, [dispatch, fetchFreshUser, logout]);

  return { user, userLoading, logout };
}
