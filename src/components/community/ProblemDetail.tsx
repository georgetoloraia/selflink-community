import { Problem } from "../../api/community";
import CommentsPanel from "./CommentsPanel";
import ArtifactsPanel from "./ArtifactsPanel";

export type ProblemDetailProps = {
  problem: Problem | null;
  onLike: () => void;
  onToggleWork: (working: boolean) => void;
  onRequireLogin: () => void;
  isAuthed: boolean;
  commentsProps: React.ComponentProps<typeof CommentsPanel>;
  artifactsProps: React.ComponentProps<typeof ArtifactsPanel>;
};

const ProblemDetail = ({
  problem,
  onLike,
  onToggleWork,
  onRequireLogin,
  isAuthed,
  commentsProps,
  artifactsProps,
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

  const workingList = Array.isArray(problem.working_on_this)
    ? problem.working_on_this.slice(0, 20)
    : [];

  return (
    <section className="panel detail-panel">
      <div className="detail-header">
        <div>
          <h2>{problem.title ?? "Untitled"}</h2>
          {problem.status ? <div className="status-badge">{problem.status}</div> : null}
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
                {person.name || person.username || person.handle || "Contributor"}
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
      </div>
    </section>
  );
};

export default ProblemDetail;
