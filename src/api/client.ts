import axios from "axios";
import type { AxiosError } from "axios";

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
console.log("Community API health check:", `${apiBase}summary/`);

export const apiClient = axios.create({
  baseURL: apiBase,
});

apiClient.interceptors.request.use((config) => {
  if (
    import.meta.env.DEV &&
    config.baseURL &&
    !config.baseURL.includes("/api/v1/community/")
  ) {
    throw new Error("API baseURL missing /api/v1/community/");
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
  (response) => {
    if (import.meta.env.DEV) {
      const method = response.config.method?.toUpperCase();
      const url = response.config.baseURL
        ? `${response.config.baseURL}${response.config.url ?? ""}`
        : response.config.url;
      console.log("[API OK]", method, url, response.status, response.data);
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if (import.meta.env.DEV) {
      const method = error?.config?.method?.toUpperCase();
      const url = error?.config?.baseURL
        ? `${error.config.baseURL}${error.config.url ?? ""}`
        : error?.config?.url;
      console.log("[API ERROR]", method, url, status, error?.response?.data);
    }
    if (status === 401) {
      clearStoredAuth();
      window.dispatchEvent(new CustomEvent("sl:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const isAgreementRequired = (error: unknown) => {
  const detail = getAxiosErrorDetail(error);
  return detail === "AGREEMENT_REQUIRED";
};

export const isInvalidCredentials = (error: unknown) => {
  const detail = getAxiosErrorDetail(error);
  return detail === "INVALID_CREDENTIALS";
};

export const getErrorDetail = (error: unknown): string | null => {
  const detail = getAxiosErrorDetail(error);
  if (typeof detail === "string") return detail;
  return null;
};

export const getStatus = (error: unknown): number | null => {
  const status = toAxiosError(error)?.response?.status;
  return typeof status === "number" ? status : null;
};

export const isNotFound = (error: unknown): boolean => getStatus(error) === 404;

export const isNetworkError = (error: unknown): boolean => {
  const axiosError = toAxiosError(error);
  if (!axiosError) return false;
  return !axiosError.response;
};

const toAxiosError = (error: unknown): AxiosError<{ detail?: unknown }> | null =>
  axios.isAxiosError(error) ? error : null;

const getAxiosErrorDetail = (error: unknown): unknown => toAxiosError(error)?.response?.data?.detail;
