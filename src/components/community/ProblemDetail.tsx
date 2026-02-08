import type { Problem } from "../../api/community";
import CommentsPanel from "./CommentsPanel";
import ArtifactsPanel from "./ArtifactsPanel";
import ActivityPanel from "./ActivityPanel";

export type ProblemDetailProps = {
  problem: Problem | null;
  onLike: () => void;
  onToggleWork: (working: boolean) => void;
  onRequireLogin: () => void;
  isAuthed: boolean;
  commentsProps: React.ComponentProps<typeof CommentsPanel>;
  artifactsProps: React.ComponentProps<typeof ArtifactsPanel>;
  eventsProps: React.ComponentProps<typeof ActivityPanel>;
};

const ProblemDetail = ({
  problem,
  onLike,
  onToggleWork,
  onRequireLogin,
  isAuthed,
  commentsProps,
  artifactsProps,
  eventsProps,
}: ProblemDetailProps) => {
  if (!problem) {
    return (
      <section className="panel detail-panel">
        <div className="empty">Select a problem to see details.</div>
      </section>
    );
  }

  const handleLike = () => {
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    onLike();
  };

  const handleWork = () => {
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    onToggleWork(Boolean(problem.is_working));
  };

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return "—";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "—";
    const diffMs = Math.max(0, Date.now() - parsed.getTime());
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const workingList = Array.isArray(problem.working_on_this)
    ? problem.working_on_this.slice(0, 20)
    : [];
  const viewsCount = problem.views_count ?? problem.views ?? 0;
  const lastActivity = problem.last_activity_at ?? problem.last_activity ?? problem.created_at;

  return (
    <section className="panel detail-panel">
      <div className="detail-header">
        <div>
          <h2>{problem.title ?? "Untitled"}</h2>
          {problem.status ? <div className="status-badge">{problem.status}</div> : null}
          <div className="detail-meta">
            Views: {viewsCount} • Last activity: {formatRelativeTime(lastActivity)}
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn secondary" onClick={handleLike}>
            {problem.has_liked ? "Liked" : "Like"}
          </button>
          <button className="btn" onClick={handleWork}>
            {problem.is_working ? "Working on it" : "Mark working on it"}
          </button>
        </div>
      </div>
      <p className="problem-description">{problem.description ?? "No description provided."}</p>
      <div className="working-row">
        {workingList.length > 0 ? (
          <div className="working-list">
            {workingList.map((person, idx) => (
              <span key={`${person.id ?? idx}`} className="working-pill">
                {person.username || "Contributor"}
              </span>
            ))}
          </div>
        ) : typeof problem.working_count === "number" ? (
          <div className="working-count">{problem.working_count} working on this</div>
        ) : null}
      </div>
      <div className="detail-sections">
        <CommentsPanel {...commentsProps} />
        <ArtifactsPanel {...artifactsProps} />
        <ActivityPanel {...eventsProps} />
      </div>
    </section>
  );
};

export default ProblemDetail;
