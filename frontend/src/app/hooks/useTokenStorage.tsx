"use client";

import { useState, useEffect } from "react";

const TOKEN_KEY = "auth_tokens";

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export const useLocalStorage = () => {
  const [tokens, setTokensState] = useState<ITokens | null>(null);

  // Initialize tokens only on the client
  useEffect(() => {
    const storedTokens = localStorage.getItem(TOKEN_KEY);
    if (storedTokens) {
      setTokensState(JSON.parse(storedTokens));
    }
  }, []);

  const setTokens = (newTokens: ITokens | null) => {
    setTokensState(newTokens);
    if (newTokens) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const clearTokens = () => {
    setTokensState(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return { tokens, setTokens, clearTokens };
};
