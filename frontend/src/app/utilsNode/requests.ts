import { BASE_URL, CustomError, ITokens } from ".";

export async function loginReq(
  username: string,
  password: string
): Promise<ITokens> {
  const url = `${BASE_URL}/auth/login`; // Node.js route for login

  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    // Parse backend error if available
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || "Could not login";
    throw new CustomError(response.status, message);
  }

  // Expect backend to return { accessToken, refreshToken? }
  return (await response.json()) as ITokens;
}

export async function refreshTokens(
  refreshToken: string
): Promise<ITokens> {
  const url = `${BASE_URL}/auth/refresh`; // Node.js route for token refresh

  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || "Failed to refresh token";
    throw new CustomError(response.status, message);
  }

  return (await response.json()) as ITokens;
}
