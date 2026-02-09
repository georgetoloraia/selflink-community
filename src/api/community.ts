import { apiClient } from "./client";

export type Money = { amount: string; currency: string };
export type UserTiny = { id: string; username?: string; avatar_url?: string | null };

export type CommunitySummary = {
  as_of?: string;
  total_income?: Money;
  contributors_reward?: Money;
  contributors?: { count: number };
  distribution_preview?: Array<{ user: UserTiny; amount: string; currency: string }>;
};

export type ProblemStatus = "open" | "in_progress" | "resolved";

export type Problem = {
  id: string;
  title?: string;
  description?: string;
  status?: ProblemStatus;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  last_activity_at?: string;
  comments_count?: number;
  likes_count?: number;
  artifacts_count?: number;
  working_count?: number;
  has_liked?: boolean;
  is_working?: boolean;
  working_on_this?: Array<{ id?: string; username?: string; avatar_url?: string | null }>;
  views?: number;
  last_activity?: string;
  comments?: number;
  likes?: number;
  artifacts?: number;
  working?: number;
};

export type ProblemAgreement = {
  id: string;
  license_spdx?: string;
  version?: string;
  text?: string;
  is_active?: boolean;
};

export type Agreement = ProblemAgreement;
export type AgreementResponse = { agreement: ProblemAgreement | null };

export type ProblemEvent = {
  id: string;
  type: string;
  created_at: string;
  actor?: UserTiny | null;
  metadata?: Record<string, unknown> | null;
};

export type ProblemComment = {
  id: string;
  body: string;
  created_at: string;
  user: UserTiny;
  likes_count: number;
  has_liked: boolean;
};

export type WorkArtifact = {
  id: string;
  title: string;
  description: string;
  url: string;
  created_at: string;
  user: UserTiny;
};

export type WorkToggleResponse = { problem_id: string; is_working: boolean; working_count: number };
export type ProblemLikeToggleResponse = { problem_id: string; has_liked: boolean; likes_count: number };
export type CommentLikeToggleResponse = { problem_id: string; comment_id: string; has_liked: boolean; likes_count: number };

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
  const { data } = await apiClient.get<CommunitySummary>("summary/");
  return data;
};

export const listProblems = async (params?: { status?: ProblemStatus }) => {
  const { data } = await apiClient.get("problems/", { params });
  return unwrapResults<Problem>(data);
};

export const getProblem = async (id: string) => {
  const { data } = await apiClient.get<Problem>(`problems/${id}/`);
  return data;
};

export const listProblemComments = async (id: string) => {
  const { data } = await apiClient.get(`problems/${id}/comments/`);
  return unwrapResults<ProblemComment>(data);
};

export const createProblemComment = async (id: string, body: string, parent_id?: string) => {
  const { data } = await apiClient.post<ProblemComment>(`problems/${id}/comments/`, { body, parent_id });
  return data;
};

export const createProblem = async (payload: { title: string; description?: string }) => {
  const { data } = await apiClient.post<Problem>("problems/", payload);
  return data;
};

export const likeProblem = async (id: string) => {
  const { data } = await apiClient.post<ProblemLikeToggleResponse>(`problems/${id}/like/`);
  return data;
};

export const unlikeProblem = async (id: string) => {
  const { data } = await apiClient.delete<ProblemLikeToggleResponse>(`problems/${id}/like/`);
  return data;
};

export const workOnProblem = async (id: string) => {
  const { data } = await apiClient.post<WorkToggleResponse>(`problems/${id}/work/`);
  return data;
};

export const unworkOnProblem = async (id: string) => {
  const { data } = await apiClient.delete<WorkToggleResponse>(`problems/${id}/work/`);
  return data;
};

export const getAgreement = async (id: string) => {
  const { data } = await apiClient.get<AgreementResponse>(`problems/${id}/agreement/`);
  return data;
};

export const acceptAgreement = async (id: string) => {
  const { data } = await apiClient.post(`problems/${id}/agreement/accept/`);
  return data;
};

export const listProblemEvents = async (problemId: string) => {
  const { data } = await apiClient.get(`problems/${problemId}/events/`);
  return unwrapResults<ProblemEvent>(data);
};

export const listArtifacts = async (problemId: string) => {
  const { data } = await apiClient.get(`problems/${problemId}/artifacts/`);
  return unwrapResults<WorkArtifact>(data);
};

export const createArtifact = async (
  problemId: string,
  payload: { title: string; description?: string; url?: string }
) => {
  const { data } = await apiClient.post<WorkArtifact>(`problems/${problemId}/artifacts/`, payload);
  return data;
};

export const getArtifact = async (id: string) => {
  const { data } = await apiClient.get<WorkArtifact>(`artifacts/${id}/`);
  return data;
};

export const listArtifactComments = async (id: string) => {
  const { data } = await apiClient.get(`artifacts/${id}/comments/`);
  return unwrapResults<ProblemComment>(data);
};

export const createArtifactComment = async (id: string, body: string, parent_id?: string) => {
  const { data } = await apiClient.post<ProblemComment>(`artifacts/${id}/comments/`, { body, parent_id });
  return data;
};

export const likeProblemComment = async (problemId: string, commentId: string) => {
  const { data } = await apiClient.post<CommentLikeToggleResponse>(
    `problems/${problemId}/comments/${commentId}/like/`
  );
  return data;
};

export const unlikeProblemComment = async (problemId: string, commentId: string) => {
  const { data } = await apiClient.delete<CommentLikeToggleResponse>(
    `problems/${problemId}/comments/${commentId}/like/`
  );
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
