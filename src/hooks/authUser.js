'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setUserLoading, logoutUser } from '@/redux/userSlice';
import { toast } from 'sonner';
import { apiFetch } from '@/utils/apiFetch';

const TWO_HOURS = 2 * 60 * 60 * 1000;
const STALE_CHECK_INTERVAL = 20 * 1000;

export default function useAuthUser() {
  // QUAL-02 fix: use refs instead of module-level mutable state
  const hasShownDeactivationToast = useRef(false);
  const hasShownOfflineToast = useRef(false);
  const { user, userLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
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
      localStorage.removeItem('cart');
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
    if (typeof window === 'undefined') return;
    if (!navigator.onLine) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      const res = await apiFetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        if (!hasShownDeactivationToast.current) {
          hasShownDeactivationToast.current = true;
          toast.error('Your account has been deactivated. Logging out...');
        }
        setTimeout(logout, 3000);
        return;
      }

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch fresh user');

      const data = await res.json();
      if (data?.user) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isChanged =
          JSON.stringify(storedUser) !== JSON.stringify(data.user);
        try {
          localStorage.setItem('userFetchedAt', String(Date.now()));
          if (isChanged) {
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch(setUser(data.user));
          }
        } catch (e) {
          console.error('Error writing to localStorage', e);
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      if (err?.message?.includes('Invalid')) logout();
    }
  }, [dispatch, logout]);

  const checkStaleAndFetch = useCallback(() => {
    if (!navigator.onLine) {
      return;
    }
    const fetchedAt = parseInt(
      localStorage.getItem('userFetchedAt') || '0',
      10
    );
    if (Date.now() - fetchedAt > TWO_HOURS) {
      fetchFreshUser();
    }
  }, [fetchFreshUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(logoutUser());
      return; // 👈 exit early if no token
    }

    dispatch(setUserLoading(true));

    try {
      if (typeof window === 'undefined') {
        dispatch(setUser(null));
        return;
      }

      if (!navigator.onLine) {
        const hasCachedUser = !!localStorage.getItem('user');
        if (isFirstLoad && !hasShownOfflineToast.current && !hasCachedUser) {
          toast.error('You are offline. Some features may be unavailable.');
          hasShownOfflineToast.current = true;
        }
      }

      // ---- initial load from localStorage ----
      const token = localStorage.getItem('token');
      const storedUser = token ? localStorage.getItem('user') : null;

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.isActive) {
          if (!hasShownDeactivationToast.current) {
            hasShownDeactivationToast.current = true;
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
      setIsFirstLoad(false);
    }

    // ---- setup interval (every 2 min) ----
    intervalRef.current = setInterval(() => {
      checkStaleAndFetch();
    }, STALE_CHECK_INTERVAL);

    // ---- refresh on reconnect ----
    const handleOnline = () => {
      checkStaleAndFetch();
    };
    window.addEventListener('online', handleOnline);

    // ---- cleanup ----
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch, logout, checkStaleAndFetch, isFirstLoad]);

  return { user, userLoading, logout, fetchFreshUser };
}
