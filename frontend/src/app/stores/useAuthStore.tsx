"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { IUserLoggedIn, loginReq, CustomError, addTokenToRequestInit, hasTokenExpired } from "../utils";

type State = {
  tokens: { accessToken: string; refreshToken?: string } | null;
  isLoggedIn: boolean;
  user: IUserLoggedIn | null;
};

type Action = {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (tokens: State["tokens"]) => void;
  clearTokens: () => void;
  checkToken: () => boolean;
  fetchWithToken: (url: string, method?: string, body?: any) => Promise<any>;
};

export const useAuthStore = create<State & Action>()(
  persist(
    (set, get) => ({
      tokens: null,
      isLoggedIn: false,
      user: null,

      setTokens: (tokens) => set({ tokens }),
      clearTokens: () => set({ tokens: null }),

      checkToken: (): boolean => {
        const { tokens } = get();
        if (tokens?.accessToken && !hasTokenExpired(tokens.accessToken)) {
          set({ isLoggedIn: true });
          return true;
        } else {
          set({ isLoggedIn: false, tokens: null, user: null });
          return false;
        }
      },

      login: async (username: string, password: string) => {
        try {
          const res = await loginReq(username, password);
          if ("accessToken" in res) {
            set({ tokens: res });

            const decoded = jwtDecode<{ id: string; name: string; role: string }>(
              res.accessToken
            );

            set({
              user: { id: decoded.id, name: decoded.name, role: decoded.role?.toLowerCase() || ""},
              isLoggedIn: true,
            });
          }
        } catch (error) {
          console.error("Login failed", error);
          set({ isLoggedIn: false, user: null, tokens: null });
        }
      },

      logout: () => {
        localStorage.clear();
        set({ user: null, tokens: null, isLoggedIn: false });
      },

      fetchWithToken: async (url, method = "GET", body) => {
        const { tokens } = get();
        if (!tokens?.accessToken) throw new CustomError(401, "No tokens available");

        const requestInit: RequestInit = addTokenToRequestInit(tokens.accessToken, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        const response = await fetch(url, requestInit);
        if (!response.ok) throw new CustomError(response.status, response.statusText);

        const contentType = response.headers.get("content-type");
        return contentType?.includes("application/json") ? response.json() : null;
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.checkToken();
      },
    }
  )
);
