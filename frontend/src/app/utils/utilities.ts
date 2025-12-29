"use-client";
import { jwtDecode } from "jwt-decode";
import { ITokenObjectExtensions } from "."; // assuming this interface defines token claims
import { useAuthStore } from "@/stores/useAuthStore";

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
    const decodedPayload = jwtDecode<ITokenObjectExtensions>(token);
    return JSON.stringify(decodedPayload, null, 2);
  } catch (err) {
    console.warn("Failed to decode token payload:", err);
    return "{}";
  }
}

// Extracts user role from the token payload
export function roleJsonFromToken(token: string): string {
  try {
    const decoded = jwtDecode<ITokenObjectExtensions>(token);
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    console.log("User role extracted from token:", role);
    return role?.toLowerCase() ?? "unknown";
  } catch (err) {
    console.warn("Failed to extract role from token:", err);
    return "unknown";
  }
}
