"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../storesNode/useAuthStoreNode";


interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const checkToken = useAuthStore(State => State.checkToken);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isTokenValid = checkToken;
  const isAllowed = isLoginPage || isTokenValid;

  useEffect(() => {
    if (!isTokenValid && !isLoginPage) {
      alert("Session expired, you have been logged out.");
      router.replace("/login");
    }
  }, [isTokenValid, isLoginPage, router]);

  // Only render children if allowed
  if (!isAllowed) return null;

  return <>{children}</>;
}
