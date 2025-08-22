import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from './authUser';

export const useAuthRedirect = () => {
  const router = useRouter();
  const { user, userLoading } = useAuthUser();
  // const user = useSelector((state) => state.user.user);
  // const userLoading = useSelector((state) => state.user.userLoading);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        if (user.role === 'superadmin') {
          router.push('/super-admin');
        } else {
          router.push('/inventory');
        }
      } else {
        router.push('/login');
      }
    }
  }, [router, user, userLoading]);
};
