import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as communityApi from "../../api/community";

export type ArtifactsPanelProps = {
  problemId: number | null;
  artifacts: communityApi.Artifact[];
  isLoading: boolean;
  isAuthed: boolean;
  onRequireLogin: () => void;
  onCreate: (payload: { title: string; description?: string; url?: string }) => void;
  onCreateComment: (artifactId: number, body: string) => void;
  error?: string | null;
};

const ArtifactComments = ({
  artifactId,
  isAuthed,
  onRequireLogin,
  onCreateComment,
}: {
  artifactId: number;
  isAuthed: boolean;
  onRequireLogin: () => void;
  onCreateComment: (artifactId: number, body: string) => void;
}) => {
  const [body, setBody] = useState("");
  const commentsQuery = useQuery({
    queryKey: ["artifact-comments", artifactId],
    queryFn: () => communityApi.listArtifactComments(artifactId),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    if (!body.trim()) return;
    onCreateComment(artifactId, body.trim());
    setBody("");
  };

  return (
    <div className="artifact-comments">
      {commentsQuery.isLoading ? <div>Loading comments...</div> : null}
      <div className="comment-list">
        {(commentsQuery.data ?? []).length === 0 ? (
          <div className="empty">No comments yet.</div>
        ) : (
          (commentsQuery.data ?? []).map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-author">{comment.user?.username ?? "Anonymous"}</div>
              <div className="comment-body">{comment.body}</div>
            </div>
          ))
        )}
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder={isAuthed ? "Add a comment" : "Log in to comment"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="btn secondary" type="submit">
          Post Comment
        </button>
      </form>
    </div>
  );
};

const ArtifactsPanel = ({
  problemId,
  artifacts,
  isLoading,
  isAuthed,
  onRequireLogin,
  onCreate,
  onCreateComment,
  error,
}: ArtifactsPanelProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});

  const handleCreateArtifact = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: body.trim() || undefined,
      url: url.trim() || undefined,
    });
    setTitle("");
    setBody("");
    setUrl("");
  };

  const toggleComments = (artifactId: number) => {
    setOpenComments((prev) => ({ ...prev, [artifactId]: !prev[artifactId] }));
    if (!openComments[artifactId]) {
      void queryClient.invalidateQueries({ queryKey: ["artifact-comments", artifactId] });
    }
  };

  return (
    <section className="sub-panel">
      <div className="sub-panel-header">
        <h3>Work</h3>
      </div>
      {isLoading ? <div>Loading artifacts...</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
      <div className="artifact-list">
        {artifacts.length === 0 ? (
          <div className="empty">No artifacts yet.</div>
        ) : (
          artifacts.map((artifact) => (
            <div key={artifact.id} className="artifact-card">
              <div className="artifact-title-row">
                <div className="artifact-title">{artifact.title ?? "Untitled"}</div>
              </div>
              {artifact.url ? <div className="artifact-url">{artifact.url}</div> : null}
              <div className="artifact-meta">
                <span>{artifact.user?.username ?? "Unknown"}</span>
                {artifact.created_at ? <span>{artifact.created_at}</span> : null}
              </div>
              <button className="link-btn" onClick={() => toggleComments(artifact.id)}>
                {openComments[artifact.id] ? "Hide comments" : "Show comments"}
              </button>
              {openComments[artifact.id] ? (
                <ArtifactComments
                  artifactId={artifact.id}
                  isAuthed={isAuthed}
                  onRequireLogin={onRequireLogin}
                  onCreateComment={onCreateComment}
                />
              ) : null}
            </div>
          ))
        )}
      </div>
      <form className="artifact-form" onSubmit={handleCreateArtifact}>
        <h4>Add Artifact</h4>
        <label className="field">
          <span>Title</span>
          <input
            placeholder={isAuthed ? "Title" : "Log in to add"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Body</span>
          <textarea
            rows={3}
            placeholder="Body (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <label className="field">
          <span>URL</span>
          <input placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <button className="btn secondary" type="submit">
          Add Artifact
        </button>
      </form>
      {problemId === null ? <div className="empty">Select a problem to view artifacts.</div> : null}
    </section>
  );
};

export default ArtifactsPanel;
