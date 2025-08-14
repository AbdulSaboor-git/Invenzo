'use client';
import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setUserLoading, logoutUser } from '@/redux/userSlice';
import { toast } from 'sonner';

// Module-level state shared across all hook instances
let globalFetchState = 'idle'; // 'idle' | 'in-progress' | 'done'
let globalLogoutCalled = false;

const THREE_HOURS = 0.2 * 60 * 1000; // 30s for testing

export default function useAuthUser() {
  const { user, userLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const logout = useCallback(() => {
    // ensure logout happens once app-wide
    if (globalLogoutCalled) return;
    globalLogoutCalled = true;

    if (typeof window === 'undefined') return;

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('inventoryData_')) localStorage.removeItem(key);
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userFetchedAt');
    } catch (e) {
      // ignore localStorage errors
      console.error('Error clearing localStorage on logout', e);
    }

    dispatch(logoutUser());
    toast('Logged out');
  }, [dispatch]);

  const fetchFreshUser = useCallback(async () => {
    // Use module-level fetch state so only one in-flight fetch happens app-wide
    if (globalFetchState !== 'idle') return;
    globalFetchState = 'in-progress';

    try {
      if (typeof window === 'undefined') {
        globalFetchState = 'idle';
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        // nothing to do — allow future attempts
        globalFetchState = 'idle';
        return;
      }

      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        if (!globalLogoutCalled)
          toast.error('Your account has been deactivated. Logging out...');
        // mark as done so we don't repeatedly attempt this
        globalFetchState = 'done';
        setTimeout(logout, 3000);
        return;
      }

      if (!res.ok) {
        // allow retry later
        globalFetchState = 'idle';
        throw new Error('Failed to fetch fresh user');
      }

      const data = await res.json();
      if (data?.user) {
        if (!data.user.isActive) {
          if (!globalLogoutCalled)
            toast.error('Your account has been deactivated. Logging out...');
          globalFetchState = 'done';
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
        globalFetchState = 'done';
      } else {
        globalFetchState = 'idle';
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      toast.error('Failed to refresh user data.');
      // only force logout on clearly invalid token
      if (err?.message?.includes('Invalid')) logout();
      // allow retry later
      globalFetchState = 'idle';
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
          // fetchFreshUser will be a no-op if another instance already started it
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
