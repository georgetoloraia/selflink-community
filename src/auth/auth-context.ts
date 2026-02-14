import { createContext } from "react";

export type AuthUser = {
  username?: string;
  handle?: string;
  name?: string;
  [key: string]: unknown;
};

export type AuthContextValue = {
  user: AuthUser | null;
  tokenType: string | null;
  accessToken: string | null;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
