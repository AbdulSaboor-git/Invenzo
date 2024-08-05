// hooks/useAuthRedirect.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAuthRedirect = () => {
  const router = useRouter();

  const isAuthenticated = () => {
    return true;
  };

  useEffect(() => {
    const user = isAuthenticated();

    if (user) {
      router.push(`/user/`);
    } else {
      router.push("/login");
    }
  }, [router]);
};
