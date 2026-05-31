import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from './authUser';
import usePreferences from './usePreferences';

export const useAuthRedirect = () => {
  const router = useRouter();
  const { user, userLoading } = useAuthUser();
  const { prefs, loading: prefsLoading } = usePreferences(user?.id, user?.role);

  useEffect(() => {
    // Wait until both loading states have settled before redirecting.
    if (userLoading || prefsLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'superadmin') {
      router.push('/super-admin-panel');
    } else if (user.role === 'cashier') {
      router.push('/pos');
    } else {
      router.push(`/${prefs.defaultPage}`);
    }
  }, [router, user, userLoading, prefs, prefsLoading]);

  return { userLoading, prefsLoading };
};
