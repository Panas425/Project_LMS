"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import {
    hasTokenExpired,
    IUserLoggedIn,
    loginReq,
    CustomError,
    addTokenToRequestInit,
} from "../utilsNode";

type State = {
    tokens: { accessToken: string; refreshToken?: string } | null;
    isLoggedIn: boolean;
    user: IUserLoggedIn | null;
    hydrated: boolean;
};

type Action = {
    login: (username: string, password: string) => Promise<boolean>;
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

            hydrated: false,

            setTokens: (tokens) => set({ tokens }),

            clearTokens: () => set({ tokens: null, user: null, isLoggedIn: false }),

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

                    if (!("accessToken" in res)) {
                        // throw error if accessToken is missing
                        throw new Error("Invalid credentials");
                    }

                    set({ tokens: res });
                    const decoded = jwtDecode<{ _id: string; name: string; role: string }>(
                        res.accessToken
                    );
                    set({
                        user: {
                            _id: decoded._id,
                            name: decoded.name,
                            role: decoded.role || "",
                            lastLogin: new Date(), // assume now
                        },
                        isLoggedIn: true,
                    });

                    return true; // optional: indicate success
                } catch (error: any) {
                    console.error("Login failed", error);
                    set({ isLoggedIn: false, user: null, tokens: null });
                    throw error;
                }
            },


            logout: () => {
                localStorage.clear();
                set({ user: null, tokens: null, isLoggedIn: false });
            },

            fetchWithToken: async (url, method = "GET", body) => {
                const { tokens } = get();
                if (!tokens?.accessToken) {
                    throw new CustomError(401, "No tokens available for authentication.");
                }

                const requestInit: RequestInit = addTokenToRequestInit(tokens.accessToken, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: body ? JSON.stringify(body) : undefined,
                });

                const response = await fetch(url, requestInit);

                if (!response.ok) {
                    throw new CustomError(response.status, response.statusText);
                }

                const contentType = response.headers.get("content-type");
                return contentType?.includes("application/json")
                    ? response.json()
                    : null;
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
                // Mark hydration complete
                if (state) {
                    state.hydrated = true;
                }

                // Auto check token
                state?.checkToken();
            },
        }
    )
);
