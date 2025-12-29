import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from './authUser';
import usePreferences from './usePreferences';
import { toast } from 'sonner';
import Loading from '@/app/loading';

export const useAuthRedirect = () => {
  const router = useRouter();
  const { user, userLoading } = useAuthUser();
  const { prefs, loading: prefsLoading } = usePreferences(user?.id, user?.role);

  useEffect(() => {
    if (userLoading || prefsLoading) {
      <Loading />;
    }

    if (!user) {
      router.push('/login');
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
};
