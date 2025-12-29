"use client";

import { useAuthStore } from "../storesNode/useAuthStoreNode";
import LoginPage from "../pages/LoginPage";

export default function Page() {
  const { isLoggedIn } = useAuthStore();

  // key forces remount on auth change, resetting styles and clearing stale states 
  return <div key={isLoggedIn ? "loggedIn" : "loggedOut"}><LoginPage /></div>;
}
