"use client";
import {jwtDecode} from "jwt-decode";
import { IUserLoggedIn } from "./interfaces"; // adjust path as needed

// Adds the Authorization header to a fetch request
export function addTokenToRequestInit(
  accessToken?: string,
  options?: RequestInit
): RequestInit {
  const requestObject: RequestInit = { ...options };

  if (accessToken) {
    requestObject.headers = {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  return requestObject;
}

// Checks whether a JWT token has expired
export function hasTokenExpired(token?: string): boolean {
  if (!token) return true;

  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return true; // No expiration field — treat as expired
    const expire = decoded.exp * 1000; // Convert seconds → milliseconds
    return Date.now() > expire;
  } catch (err) {
    console.warn("Invalid token:", err);
    return true;
  }
}

// Converts decoded payload to JSON string for debugging or inspection
export function payloadJsonFromToken(token: string): string {
  try {
    const decodedPayload = jwtDecode(token);
    return JSON.stringify(decodedPayload, null, 2);
  } catch (err) {
    console.warn("Failed to decode token payload:", err);
    return "{}";
  }
}

// Extracts user info from token payload
export function userFromToken(token: string): IUserLoggedIn | null {
  try {
    const decoded = jwtDecode<{ id: string; name: string; role: string }>(token);
    return {
      _id: decoded.id,
      name: decoded.name,
      role: decoded.role?.toLowerCase() ?? "unknown",
    };
  } catch (err) {
    console.warn("Failed to extract user from token:", err);
    return null;
  }
}
