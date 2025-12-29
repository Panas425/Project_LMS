"use client";

import {
  createContext,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  hasTokenExpired,
  IAuthContext,
  ITokenObjectExtensions,
  IUserLoggedIn,
  loginReq,
} from "../utils";
import { useLocalStorage } from "../hooks/useTokenStorage";
import { jwtDecode } from "jwt-decode";

interface IAuthProviderProps {
  children: ReactNode;
}
export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export function AuthProvider({ children }: IAuthProviderProps): ReactElement {
  const { tokens, setTokens, clearTokens } = useLocalStorage();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);


  const [user, setUser ] = useState<IUserLoggedIn | null>(null);

  useEffect(() => {
    if (tokens && tokens.accessToken && !hasTokenExpired(tokens.accessToken)) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [tokens]);

  const login = async (username: string, password: string) => {
    try {
      const res = await loginReq(username, password);
      if ("accessToken" in res) {
        setTokens(res); // Save tokens to localStorage

        // Decode the access token to get user info
        const decoded = jwtDecode<ITokenObjectExtensions>(res.accessToken);
        const id =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ]!;
        const name =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ]!.toLowerCase();
        const role =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ]!.toLowerCase();

        // Set the user state based on the decoded token
        setUser({ id, name, role });

        setIsLoggedIn(true); // Mark user as logged in
        return res;
      }
      return res;
    } catch (error) {
      console.error("Login failed", error);
      setIsLoggedIn(false);
      return;
    }
  };

  const logout = (): void => {
    localStorage.clear();
    setUser(null);
    clearTokens();
    setIsLoggedIn(false);
    
  };

  return (
    <AuthContext.Provider value={{ tokens, isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}
