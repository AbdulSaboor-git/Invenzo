'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setUserLoading, logoutUser } from '@/redux/userSlice';
import { toast } from 'sonner';

const THREE_HOURS = 3 * 60 * 60 * 1000;
const REFRESH_INTERVAL = 10 * 60 * 1000; // 3 minutes

let hasShownDeactivationToast = false;

export default function useAuthUser() {
  const { user, userLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
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

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    dispatch(logoutUser());
  }, [dispatch]);

  const fetchFreshUser = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        if (!hasShownDeactivationToast) {
          hasShownDeactivationToast = true;
          toast.error('Your account has been deactivated. Logging out...');
        }
        setTimeout(logout, 3000);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch fresh user');

      const data = await res.json();
      if (data?.user) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isChanged =
          JSON.stringify(storedUser) !== JSON.stringify(data.user);

        if (isChanged) {
          try {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userFetchedAt', String(Date.now()));
          } catch (e) {
            console.error('Error writing user to localStorage', e);
          }
          dispatch(setUser(data.user));
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      toast.error('Failed to refresh user data.');
      if (err?.message?.includes('Invalid')) logout();
    }
  }, [dispatch, logout]);

  const checkStaleAndFetch = useCallback(() => {
    const fetchedAt = parseInt(
      localStorage.getItem('userFetchedAt') || '0',
      10
    );
    if (Date.now() - fetchedAt > THREE_HOURS && navigator.onLine) {
      fetchFreshUser();
    }
  }, [fetchFreshUser]);

  useEffect(() => {
    dispatch(setUserLoading(true));

    try {
      if (typeof window === 'undefined') {
        dispatch(setUser(null));
        return;
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.isActive) {
          if (!hasShownDeactivationToast) {
            hasShownDeactivationToast = true;
            toast.error('Your account has been deactivated. Logging out...');
          }
          logout();
          return;
        }

        dispatch(setUser(parsedUser));
        checkStaleAndFetch();
      } else {
        dispatch(setUser(null));
      }
    } catch (err) {
      console.error('Error loading user from localStorage', err);
      dispatch(setUser(null));
    } finally {
      dispatch(setUserLoading(false));
    }

    intervalRef.current = setInterval(checkStaleAndFetch, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, logout, checkStaleAndFetch]);

  return { user, userLoading, logout };
}
