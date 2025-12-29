"use client";

import { ReactElement, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../storesNode/useAuthStoreNode";

interface AuthGuardProps {
  children: ReactElement;
  redirectPath?: string;
}

export const AuthGuard = ({ children, redirectPath = "/login" }: AuthGuardProps) => {
  const { isLoggedIn, tokens, user, checkToken, logout, hydrated } = useAuthStore(
    useShallow(state => ({
      isLoggedIn: state.isLoggedIn,
      tokens: state.tokens,
      user: state.user,
      hydrated: state.hydrated,
      checkToken: state.checkToken,
      logout: state.logout,
    }))
  );

  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState<null | boolean>(null);

  useEffect(() => {
    // Wait until Zustand hydration finishes
    if (!hydrated) return;

    const valid = checkToken();

    if (!valid || !isLoggedIn || !user) {
      logout();
      router.replace(redirectPath);
      setAuthorized(false);
      return;
    }

    const role = user?.role?.toLowerCase() || "";

    const rolePaths: Record<string, string> = {
      student: "/studentpage",
      teacher: "/teacherpage",
      admin: "/adminpage",
    };

    const allowedPath = rolePaths[role];

    if (!allowedPath) {
      logout();
      router.replace(redirectPath);
      setAuthorized(false);
      return;
    }

    // Redirect only if on wrong page
    if (pathname !== allowedPath) {
      router.replace(allowedPath);
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }, [hydrated, isLoggedIn, tokens, user, pathname, router, checkToken, redirectPath, logout]);

  // Prevent flicker: don't render until hydrated & authorized == true
  if (!hydrated || authorized !== true) return null;

  return children;
};
