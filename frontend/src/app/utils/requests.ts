import { BASE_URL, CustomError, ITokens } from ".";

export async function loginReq(
  username: string,
  password: string
): Promise<ITokens | CustomError> {
  const url = `${BASE_URL}/authentication/login`;

  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok === false) {
    return new CustomError(response.status, "Could not login");
  }

  return (await response.json()) as ITokens;
}

export async function refreshTokens(
  accessToken: string,
  refreshToken: string
): Promise<ITokens> {
  const url: string = `${BASE_URL}/token/refresh`;

  try {
    const response: Response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Parse the response to get the new tokens
    const data = await response.json();

    // Assuming that `data` contains the new accessToken and refreshToken
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error("Failed to refresh token:", error);
    throw new Error("Failed to refresh token");
  }
}
