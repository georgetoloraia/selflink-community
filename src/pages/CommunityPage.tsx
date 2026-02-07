import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/layout/PageShell";
import LoginModal from "../components/modals/LoginModal";
import AgreementModal from "../components/modals/AgreementModal";
import NewProblemModal from "../components/community/NewProblemModal";
import ProblemList from "../components/community/ProblemList";
import ProblemDetail from "../components/community/ProblemDetail";
import { getErrorDetail, isAgreementRequired } from "../api/client";
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

  const pendingActionRef = useRef<{ action: () => Promise<void>; consumed: boolean } | null>(null);

  const summaryQuery = useQuery({
    queryKey: ["summary"],
    queryFn: communityApi.getSummary,
  });

  const problemsQuery = useQuery({
    queryKey: ["problems"],
    queryFn: () => communityApi.listProblems(),
  });

  const problemQuery = useQuery({
    queryKey: ["problem", selectedId],
    queryFn: () => communityApi.getProblem(selectedId as number),
    enabled: selectedId !== null,
  });

  const commentsQuery = useQuery({
    queryKey: ["problem-comments", selectedId],
    queryFn: () => communityApi.listProblemComments(selectedId as number),
    enabled: selectedId !== null,
  });

  const artifactsQuery = useQuery({
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
      if (getErrorDetail(error) === "UNAUTHORIZED") {
        await logout();
        setLoginOpen(true);
        return;
      }
      setInlineError(getErrorDetail(error) ?? "Something went wrong.");
    }
  };

  const likeMutation = useMutation({
    mutationFn: (id: number) => communityApi.likeProblem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problem", selectedId] });
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });

  const workMutation = useMutation({
    mutationFn: ({ id, working }: { id: number; working: boolean }) =>
      working ? communityApi.unworkOnProblem(id) : communityApi.workOnProblem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problem", selectedId] });
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => communityApi.createProblemComment(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problem-comments", selectedId] });
    },
  });

  const createArtifactMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { type?: string; title: string; description?: string; url?: string } }) =>
      communityApi.createArtifact(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["artifacts", selectedId] });
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

  const dashboardItems = useMemo(
    () => [
      { label: "Total SelfLink Income", value: summary?.total_income ?? "--" },
      { label: "Contributors", value: summary?.contributors ?? "--" },
      { label: "Contributors Reward", value: summary?.contributors_reward ?? "--" },
    ],
    [summary]
  );

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
        <ProblemDetail
          problem={selectedProblem}
          onLike={() => runGuarded(() => likeMutation.mutateAsync(selectedId as number), selectedId)}
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
