// hooks/useAuthRedirect.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAuthRedirect = () => {
  const router = useRouter();

  const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
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
