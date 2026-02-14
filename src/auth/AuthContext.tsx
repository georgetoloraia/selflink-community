import React, { useCallback, useEffect, useMemo, useState } from "react";
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from "../api/client";
import * as communityApi from "../api/community";
import { AuthContext } from "./auth-context";
import type { AuthContextValue, AuthUser } from "./auth-context";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(() => {
    const stored = readStoredAuth();
    return typeof stored?.token_type === "string" ? stored.token_type : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const stored = readStoredAuth();
    return typeof stored?.access === "string" ? stored.access : null;
  });

  const bootstrap = useCallback(async () => {
    const stored = readStoredAuth();
    const access = typeof stored?.access === "string" ? stored.access : null;
    if (!access) return;
    try {
      const me = await communityApi.me();
      setUser(me);
      setTokenType(typeof stored?.token_type === "string" ? stored.token_type : null);
      setAccessToken(access);
    } catch {
      clearStoredAuth();
      setUser(null);
      setTokenType(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void bootstrap();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [bootstrap]);

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
      setTokenType(typeof data.token_type === "string" ? data.token_type : null);
      setAccessToken(typeof data.access === "string" ? data.access : null);
      const me = await communityApi.me();
      setUser(me);
    },
    []
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
