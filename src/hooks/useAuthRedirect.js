import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export const useAuthRedirect = () => {
  const router = useRouter();
  const user = useSelector((state) => state.user.user);
  const userLoading = useSelector((state) => state.user.loading);

  useEffect(() => {
    if (!userLoading) {
      if (user) {
        router.push("/inventory");
      } else {
        router.push("/login");
      }
    }
  }, [router, user, userLoading]);
};
