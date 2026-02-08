import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/layout/PageShell";
import LoginModal from "../components/modals/LoginModal";
import AgreementModal from "../components/modals/AgreementModal";
import NewProblemModal from "../components/community/NewProblemModal";
import ProblemList from "../components/community/ProblemList";
import ProblemDetail from "../components/community/ProblemDetail";
import { getErrorDetail, getStatus, isAgreementRequired } from "../api/client";
import * as communityApi from "../api/community";
import { useAuth } from "../auth/useAuth";

const CommunityPage = () => {
  const queryClient = useQueryClient();
  const { isAuthed, logout } = useAuth();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [agreementProblemId, setAgreementProblemId] = useState<number | null>(null);
  const [newProblemOpen, setNewProblemOpen] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [staleNotice, setStaleNotice] = useState<string | null>(null);

  const pendingActionRef = useRef<{ action: () => Promise<void>; consumed: boolean } | null>(null);

  const summaryQuery = useQuery<communityApi.CommunitySummary>({
    queryKey: ["summary"],
    queryFn: communityApi.getSummary,
  });

  const problemsQuery = useQuery<communityApi.Problem[]>({
    queryKey: ["problems"],
    queryFn: () => communityApi.listProblems(),
  });

  const problemQuery = useQuery<communityApi.Problem>({
    queryKey: ["problem", selectedId],
    queryFn: () => communityApi.getProblem(selectedId as number),
    enabled: selectedId !== null,
  });

  const commentsQuery = useQuery<communityApi.ProblemComment[]>({
    queryKey: ["problem-comments", selectedId],
    queryFn: () => communityApi.listProblemComments(selectedId as number),
    enabled: selectedId !== null,
  });

  const artifactsQuery = useQuery<communityApi.WorkArtifact[]>({
    queryKey: ["artifacts", selectedId],
    queryFn: () => communityApi.listArtifacts(selectedId as number),
    enabled: selectedId !== null,
  });

  useEffect(() => {
    if (!selectedId && problemsQuery.data && problemsQuery.data.length > 0) {
      setSelectedId(problemsQuery.data[0].id);
    }
  }, [problemsQuery.data, selectedId]);

  useEffect(() => {
    if (!problemsQuery.data) return;
    if (selectedId === null) return;
    const exists = problemsQuery.data.some((problem) => problem.id === selectedId);
    if (!exists) {
      setSelectedId(problemsQuery.data[0]?.id ?? null);
      setStaleNotice("This problem no longer exists. Select another.");
    }
  }, [problemsQuery.data, selectedId]);

  useEffect(() => {
    if (!problemsQuery.data || selectedId === null) return;
    const exists = problemsQuery.data.some((problem) => problem.id === selectedId);
    if (exists) {
      setStaleNotice(null);
    }
  }, [problemsQuery.data, selectedId]);

  useEffect(() => {
    if (problemQuery.isError && getStatus(problemQuery.error) === 404) {
      setSelectedId(null);
      setStaleNotice("This problem no longer exists. Select another.");
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    }
  }, [problemQuery.isError, problemQuery.error, queryClient]);

  useEffect(() => {
    if (commentsQuery.isError && getStatus(commentsQuery.error) === 404) {
      setSelectedId(null);
      setStaleNotice("This problem no longer exists. Select another.");
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    }
  }, [commentsQuery.isError, commentsQuery.error, queryClient]);

  useEffect(() => {
    if (artifactsQuery.isError && getStatus(artifactsQuery.error) === 404) {
      setSelectedId(null);
      setStaleNotice("This problem no longer exists. Select another.");
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    }
  }, [artifactsQuery.isError, artifactsQuery.error, queryClient]);

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("sl:unauthorized", handler);
    return () => window.removeEventListener("sl:unauthorized", handler);
  }, []);

  const setAgreementFor = (problemId: number | null, action: () => Promise<unknown>) => {
    setAgreementProblemId(problemId);
    pendingActionRef.current = {
      consumed: false,
      action: async () => {
        try {
          await action();
        } catch (error) {
          if (isAgreementRequired(error)) {
            setInlineError("Agreement still required.");
          } else {
            setInlineError(getErrorDetail(error) ?? "Something went wrong.");
          }
        }
      },
    };
    setAgreementOpen(true);
  };

  const runGuarded = async (action: () => Promise<unknown>, problemId?: number | null) => {
    if (!isAuthed) {
      setLoginOpen(true);
      return;
    }
    setInlineError(null);
    try {
      await action();
    } catch (error) {
      if (isAgreementRequired(error)) {
        setAgreementFor(problemId ?? selectedId ?? null, action);
        return;
      }
      if (getStatus(error) === 401) {
        await logout();
        setLoginOpen(true);
        return;
      }
      setInlineError(getErrorDetail(error) ?? "Something went wrong.");
    }
  };

  const likeMutation = useMutation({
    mutationFn: ({ id, hasLiked }: { id: number; hasLiked: boolean }) =>
      hasLiked ? communityApi.unlikeProblem(id) : communityApi.likeProblem(id),
    onSuccess: (data) => {
      if (selectedId !== null) {
        queryClient.setQueryData<communityApi.Problem>(["problem", selectedId], (prev) =>
          prev
            ? { ...prev, has_liked: data.has_liked, likes_count: data.likes_count }
            : prev
        );
      }
      queryClient.setQueryData<communityApi.Problem[]>(["problems"], (prev) =>
        (prev ?? []).map((problem) =>
          problem.id === data.problem_id
            ? { ...problem, has_liked: data.has_liked, likes_count: data.likes_count }
            : problem
        )
      );
    },
  });

  const workMutation = useMutation({
    mutationFn: ({ id, working }: { id: number; working: boolean }) =>
      working ? communityApi.unworkOnProblem(id) : communityApi.workOnProblem(id),
    onSuccess: (data) => {
      if (selectedId !== null) {
        queryClient.setQueryData<communityApi.Problem>(["problem", selectedId], (prev) =>
          prev
            ? { ...prev, is_working: data.is_working, working_count: data.working_count }
            : prev
        );
      }
      queryClient.setQueryData<communityApi.Problem[]>(["problems"], (prev) =>
        (prev ?? []).map((problem) =>
          problem.id === data.problem_id
            ? { ...problem, is_working: data.is_working, working_count: data.working_count }
            : problem
        )
      );
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => communityApi.createProblemComment(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problem-comments", selectedId] });
    },
  });

  const createArtifactMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { title: string; description?: string; url?: string } }) =>
      communityApi.createArtifact(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["artifacts", selectedId] });
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: ({ problemId, commentId, hasLiked }: { problemId: number; commentId: number; hasLiked: boolean }) =>
      hasLiked
        ? communityApi.unlikeProblemComment(problemId, commentId)
        : communityApi.likeProblemComment(problemId, commentId),
    onSuccess: (data) => {
      queryClient.setQueryData<communityApi.ProblemComment[]>(["problem-comments", selectedId], (prev) =>
        (prev ?? []).map((comment) =>
          comment.id === data.comment_id
            ? { ...comment, has_liked: data.has_liked, likes_count: data.likes_count }
            : comment
        )
      );
    },
  });

  const createArtifactCommentMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => communityApi.createArtifactComment(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["artifact-comments", variables.id] });
    },
  });

  const summary = summaryQuery.data;
  const problems = problemsQuery.data ?? [];
  const selectedProblem = problemQuery.data ?? null;

  const fmtMoney = (value: { amount: string; currency: string } | null | undefined) => {
    if (!value) return "—";
    const amount = value.amount;
    const currency = value.currency;
    if (!amount || !currency) return "—";
    return `${amount} ${currency}`;
  };

  const dashboardItems = useMemo(() => {
    if (summaryQuery.isError) {
      return [
        { label: "Total SelfLink Income", value: "—" },
        { label: "Contributors", value: "—" },
        { label: "Contributors Reward", value: "—" },
      ];
    }
    return [
      { label: "Total SelfLink Income", value: fmtMoney(summary?.total_income) },
      { label: "Contributors", value: summary?.contributors?.count ?? 0 },
      { label: "Contributors Reward", value: fmtMoney(summary?.contributors_reward) },
    ];
  }, [summary, summaryQuery.isError]);

  const handleAgreementAccepted = () => {
    const pending = pendingActionRef.current;
    if (!pending || pending.consumed) return;
    pending.consumed = true;
    void pending.action();
  };

  const handleAgreementClose = () => {
    pendingActionRef.current = null;
    setAgreementProblemId(null);
    setAgreementOpen(false);
  };

  const handleNotFound = () => {
    setSelectedId(null);
    void queryClient.invalidateQueries({ queryKey: ["problems"] });
  };

  return (
    <PageShell onLoginClick={() => setLoginOpen(true)}>
      <div className="dashboard-row">
        {dashboardItems.map((item) => (
          <div key={item.label} className="dashboard-card">
            <div className="dashboard-label">{item.label}</div>
            <div className="dashboard-value">{item.value}</div>
          </div>
        ))}
      </div>

      {inlineError ? <div className="error-banner">{inlineError}</div> : null}

      <div className="split-view">
        <ProblemList
          problems={problems}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddNew={() => setNewProblemOpen(true)}
          onRequireLogin={() => setLoginOpen(true)}
          isAuthed={isAuthed}
        />
        <div className="detail-stack">
          {staleNotice ? <div className="notice-banner">{staleNotice}</div> : null}
          <ProblemDetail
            problem={selectedProblem}
            onLike={() =>
              runGuarded(
                () =>
                  likeMutation.mutateAsync({
                    id: selectedId as number,
                    hasLiked: Boolean(selectedProblem?.has_liked),
                  }),
                selectedId
              )
            }
            onToggleWork={(working) =>
              runGuarded(
                () => workMutation.mutateAsync({ id: selectedId as number, working }),
                selectedId
              )
            }
            onRequireLogin={() => setLoginOpen(true)}
            isAuthed={isAuthed}
            commentsProps={{
              comments: commentsQuery.data ?? [],
              onSubmit: (body) =>
                runGuarded(() => createCommentMutation.mutateAsync({ id: selectedId as number, body }), selectedId),
              onToggleLike: (commentId, hasLiked) =>
                runGuarded(
                  () =>
                    toggleCommentLikeMutation.mutateAsync({
                      problemId: selectedId as number,
                      commentId,
                      hasLiked,
                    }),
                  selectedId
                ),
              onRequireLogin: () => setLoginOpen(true),
              isAuthed,
              isLoading: commentsQuery.isLoading,
              error: commentsQuery.isError ? "Unable to load comments." : null,
            }}
            artifactsProps={{
              problemId: selectedId,
              artifacts: artifactsQuery.data ?? [],
              isLoading: artifactsQuery.isLoading,
              isAuthed,
              onRequireLogin: () => setLoginOpen(true),
              onNotFound: handleNotFound,
              onCreate: (payload) =>
                runGuarded(
                  () => createArtifactMutation.mutateAsync({ id: selectedId as number, payload }),
                  selectedId
                ),
              onCreateComment: (artifactId, body) =>
                runGuarded(() => createArtifactCommentMutation.mutateAsync({ id: artifactId, body }), selectedId),
              error: artifactsQuery.isError ? "Unable to load artifacts." : null,
            }}
          />
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <AgreementModal
        isOpen={agreementOpen}
        problemId={agreementProblemId}
        onClose={handleAgreementClose}
        onAccepted={handleAgreementAccepted}
      />
      <NewProblemModal
        isOpen={newProblemOpen}
        onClose={() => setNewProblemOpen(false)}
        onCreated={(problem) => {
          void queryClient.invalidateQueries({ queryKey: ["problems"] });
          setSelectedId(problem.id);
        }}
        onError={(message) => setInlineError(message)}
      />
    </PageShell>
  );
};

export default CommunityPage;
