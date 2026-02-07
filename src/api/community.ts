import { apiClient } from "./client";

export type Summary = {
  total_income?: number | string;
  contributors?: number | string;
  contributors_reward?: number | string;
  [key: string]: unknown;
};

export type Problem = {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  like_count?: number;
  comment_count?: number;
  artifact_count?: number;
  working_count?: number;
  working_on_this?: Array<{ id?: number; name?: string; handle?: string; username?: string }>;
  has_liked?: boolean;
  is_working?: boolean;
  [key: string]: unknown;
};

export type Comment = {
  id: number;
  body?: string;
  author?: { id?: number; name?: string; handle?: string; username?: string };
  created_at?: string;
  [key: string]: unknown;
};

export type Artifact = {
  id: number;
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  created_at?: string;
  created_by?: { id?: number; name?: string; handle?: string; username?: string };
  [key: string]: unknown;
};

export type Agreement = {
  license_spdx?: string;
  version?: string;
  text?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  token_type: "Bearer" | "Token" | string;
  access: string;
  refresh?: string;
  user?: unknown;
  [key: string]: unknown;
};

const unwrapResults = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
};

export const getSummary = async () => {
  const { data } = await apiClient.get<Summary>("summary/");
  return data;
};

export const listProblems = async (params?: { status?: string }) => {
  const { data } = await apiClient.get("problems/", { params });
  return unwrapResults<Problem>(data);
};

export const getProblem = async (id: number) => {
  const { data } = await apiClient.get<Problem>(`problems/${id}/`);
  return data;
};

export const listProblemComments = async (id: number) => {
  const { data } = await apiClient.get(`problems/${id}/comments/`);
  return unwrapResults<Comment>(data);
};

export const createProblemComment = async (id: number, body: string, parent_id?: number) => {
  const { data } = await apiClient.post<Comment>(`problems/${id}/comments/`, { body, parent_id });
  return data;
};

export const createProblem = async (payload: { title: string; description?: string; status?: string }) => {
  const { data } = await apiClient.post<Problem>("problems/", payload);
  return data;
};

export const likeProblem = async (id: number) => {
  const { data } = await apiClient.post(`problems/${id}/like/`);
  return data;
};

export const workOnProblem = async (id: number) => {
  const { data } = await apiClient.post(`problems/${id}/work/`);
  return data;
};

export const unworkOnProblem = async (id: number) => {
  const { data } = await apiClient.delete(`problems/${id}/work/`);
  return data;
};

export const getAgreement = async (id: number) => {
  const { data } = await apiClient.get<Agreement>(`problems/${id}/agreement/`);
  return data;
};

export const acceptAgreement = async (id: number) => {
  const { data } = await apiClient.post(`problems/${id}/agreement/accept/`);
  return data;
};

export const listArtifacts = async (problemId: number) => {
  const { data } = await apiClient.get(`problems/${problemId}/artifacts/`);
  return unwrapResults<Artifact>(data);
};

export const createArtifact = async (
  problemId: number,
  payload: { type?: string; title: string; description?: string; url?: string }
) => {
  const { data } = await apiClient.post<Artifact>(`problems/${problemId}/artifacts/`, payload);
  return data;
};

export const getArtifact = async (id: number) => {
  const { data } = await apiClient.get<Artifact>(`artifacts/${id}/`);
  return data;
};

export const listArtifactComments = async (id: number) => {
  const { data } = await apiClient.get(`artifacts/${id}/comments/`);
  return unwrapResults<Comment>(data);
};

export const createArtifactComment = async (id: number, body: string, parent_id?: number) => {
  const { data } = await apiClient.post<Comment>(`artifacts/${id}/comments/`, { body, parent_id });
  return data;
};

export const login = async (username: string, password: string) => {
  const { data } = await apiClient.post<LoginResponse>("auth/login/", { username, password });
  return data;
};

export const me = async () => {
  const { data } = await apiClient.get("auth/me/");
  return data;
};

export const logout = async () => {
  const { data } = await apiClient.post("auth/logout/");
  return data;
};
