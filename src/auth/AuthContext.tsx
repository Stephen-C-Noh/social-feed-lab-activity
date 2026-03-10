import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import type { User } from "../types";

type AuthState = {
  token: string | null;
  user: User | null;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      // Set the default Authorization header for all axios requests
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      // Remove the Authorization header if token is null
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);
  // TODO: Make useEffect that sets the default Authorization header on the axios api instance whenever the token changes
  // hint: set api.defaults.headers.common.Authorization

  async function signIn(newToken: string, newUser: User) {
    setToken(newToken);
    setUser(newUser);
  }

  async function signOut() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
