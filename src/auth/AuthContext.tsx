import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from "../api/client";
import * as communityApi from "../api/community";

export type AuthContextValue = {
  user: any | null;
  tokenType: string | null;
  accessToken: string | null;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const syncFromStorage = useCallback(() => {
    const stored = readStoredAuth();
    setTokenType((stored?.token_type as string) ?? null);
    setAccessToken((stored?.access as string) ?? null);
  }, []);

  const bootstrap = useCallback(async () => {
    const stored = readStoredAuth();
    if (!stored?.access) return;
    try {
      const me = await communityApi.me();
      setUser(me);
      setTokenType((stored.token_type as string) ?? null);
      setAccessToken((stored.access as string) ?? null);
    } catch {
      clearStoredAuth();
      setUser(null);
      setTokenType(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();
    void bootstrap();
  }, [syncFromStorage, bootstrap]);

  useEffect(() => {
    const handler = () => {
      clearStoredAuth();
      setUser(null);
      setTokenType(null);
      setAccessToken(null);
    };
    window.addEventListener("sl:unauthorized", handler);
    return () => window.removeEventListener("sl:unauthorized", handler);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await communityApi.login(username, password);
      writeStoredAuth(data);
      syncFromStorage();
      const me = await communityApi.me();
      setUser(me);
    },
    [syncFromStorage]
  );

  const logout = useCallback(async () => {
    try {
      await communityApi.logout();
    } catch {
      // ignore
    }
    clearStoredAuth();
    setUser(null);
    setTokenType(null);
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      tokenType,
      accessToken,
      isAuthed: Boolean(accessToken),
      login,
      logout,
    };
  }, [accessToken, login, logout, tokenType, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
