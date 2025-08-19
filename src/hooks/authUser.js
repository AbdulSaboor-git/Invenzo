'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setUserLoading, logoutUser } from '@/redux/userSlice';
import { toast } from 'sonner';

const TEN_MINUTES = 10 * 60 * 1000;
const STALE_CHECK_INTERVAL = 2 * 60 * 1000;

let hasShownDeactivationToast = false;
let hasShownOfflineToast = false;

export default function useAuthUser() {
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
      console.log('Skipped fetch: offline');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

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

      if (res.status === 401) {
        toast.error('Something went wrong');
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
      if (err?.message?.includes('Invalid')) logout();
    }
  }, [dispatch, logout]);

  const checkStaleAndFetch = useCallback(() => {
    if (!navigator.onLine) {
      console.log('Skipped stale check: offline');
      return;
    }
    const fetchedAt = parseInt(
      localStorage.getItem('userFetchedAt') || '0',
      10
    );
    if (Date.now() - fetchedAt > TEN_MINUTES) {
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

      if (!navigator.onLine) {
        if (isFirstLoad && !hasShownOfflineToast) {
          toast.error('You are offline. Some features may be unavailable.');
          hasShownOfflineToast = true;
        } else {
          console.log('Offline: skipping user load');
        }
      }

      // ---- initial load from localStorage ----
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
      setIsFirstLoad(false);
    }

    // ---- setup interval (every 2 min) ----
    intervalRef.current = setInterval(() => {
      checkStaleAndFetch();
    }, STALE_CHECK_INTERVAL);

    // ---- refresh on reconnect ----
    const handleOnline = () => {
      console.log('Back online → refreshing user');
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
