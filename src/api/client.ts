import axios from "axios";

export const STORAGE_KEY = "sl_community_access";

export type StoredAuth = {
  token_type?: "Bearer" | "Token" | string;
  access?: string;
  refresh?: string;
  user?: unknown;
  [key: string]: unknown;
};

export const readStoredAuth = (): StoredAuth | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

export const writeStoredAuth = (auth: StoredAuth) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
if (!base) {
  throw new Error("VITE_API_BASE_URL is required");
}

const apiBase = `${base.replace(/\/$/, "")}/api/v1/community/`;
console.log("Community API baseURL:", apiBase);

export const apiClient = axios.create({
  baseURL: apiBase,
});

apiClient.interceptors.request.use((config) => {
  if (import.meta.env.DEV && config.baseURL?.replace(/\/$/, "") === base.replace(/\/$/, "")) {
    throw new Error("API baseURL resolved to root; expected /api/v1/community/");
  }
  return config;
});


apiClient.interceptors.request.use((config) => {
  const stored = readStoredAuth();
  const access = stored?.access;
  const tokenType = stored?.token_type;
  if (access && tokenType) {
    const prefix = tokenType === "Bearer" ? "Bearer" : tokenType === "Token" ? "Token" : tokenType;
    config.headers = config.headers ?? {};
    config.headers.Authorization = `${prefix} ${access}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearStoredAuth();
      window.dispatchEvent(new CustomEvent("sl:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const isAgreementRequired = (error: unknown) => {
  const detail = error && typeof error === "object" ? (error as any).response?.data?.detail : undefined;
  return detail === "AGREEMENT_REQUIRED";
};

export const isInvalidCredentials = (error: unknown) => {
  const detail = error && typeof error === "object" ? (error as any).response?.data?.detail : undefined;
  return detail === "INVALID_CREDENTIALS";
};

export const getErrorDetail = (error: unknown): string | null => {
  if (!error || typeof error !== "object") return null;
  const detail = (error as any).response?.data?.detail;
  if (typeof detail === "string") return detail;
  return null;
};
