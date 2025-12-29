"use client";

import { useAuthStore } from "../storesNode/useAuthStoreNode";



export function useAuthContext() {
  return useAuthStore();
}
