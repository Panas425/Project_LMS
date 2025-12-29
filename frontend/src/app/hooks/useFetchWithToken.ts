"use client";

import { useState } from "react";
import {
  addTokenToRequestInit,
  CustomError,
  hasTokenExpired,
  ITokens,
  refreshTokens,
  TOKENS,
} from "../utils";
import { useLocalStorage } from "usehooks-ts";

interface IUseFetchWithTokenReturn<T> {
  data: T | null;
  error: CustomError | null;
  isLoading: boolean;
  requestFunc: () => Promise<void>; // Ensure it returns a Promise
}

export function useFetchWithToken<T>(
  url: RequestInfo | URL,
  options?: RequestInit
): IUseFetchWithTokenReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useLocalStorage<ITokens | null>(TOKENS, null);
  const [error, setError] = useState<CustomError | null>(null);

  // Fetch function that handles the API call
  async function generatedFetch(accessToken: string): Promise<T> {
    const requestInit: RequestInit = addTokenToRequestInit(accessToken, options);
    const response: Response = await fetch(url, requestInit);

    if (!response.ok) {
      throw new CustomError(response.status, response.statusText);
    }

    return response.json() as Promise<T>;
  }

  // Main request function
  async function requestFunc() {
    setError(null);  // Reset error state
    setIsLoading(true);  // Set loading state to true

    try {
      // Check if tokens are available
      if (!tokens?.accessToken) {
        throw new CustomError(401, "Access token is missing.");
      }

      // Check if the token is expired
      const tokenIsExpired = hasTokenExpired(tokens.accessToken);

      let accessToken = tokens.accessToken;

      // Refresh tokens if expired
      if (tokenIsExpired) {
        console.log("Token is expired, refreshing...");
        const refreshedTokens = await refreshTokens(tokens.accessToken, tokens.refreshToken);
        setTokens(refreshedTokens);
        accessToken = refreshedTokens.accessToken;
      }

      // Fetch data using the (possibly refreshed) access token
      const data = await generatedFetch(accessToken);
      setData(data);
    } catch (err) {
      // Handle errors: differentiate between CustomError and unexpected errors
      const customError = err instanceof CustomError ? err : new CustomError(500, "Failed to fetch data.");
      setError(customError);
      console.error("Error occurred:", customError);
    } finally {
      setIsLoading(false);  // Reset loading state
    }
  }

  return { data, isLoading, error, requestFunc };
}
