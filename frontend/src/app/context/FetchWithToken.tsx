"use client";

import { useAuthContext } from "../hooks";
import { addTokenToRequestInit, CustomError } from "../utils";



export const fetchWithToken = async (url: string): Promise<any> => {
    const {tokens} = useAuthContext();
    if (!tokens) {
      throw new CustomError(401, "No tokens available for authentication.");
    }

    const requestInit: RequestInit = addTokenToRequestInit(tokens.accessToken, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await fetch(url, requestInit);

    if (!response.ok) {
      throw new CustomError(response.status, response.statusText);
    }

    return response.json();
  };