import type { Problem } from "../../api/community";

type ProblemListProps = {
  problems: Problem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddNew: () => void;
  onRequireLogin: () => void;
  isAuthed: boolean;
};

const ProblemList = ({ problems, selectedId, onSelect, onAddNew, onRequireLogin, isAuthed }: ProblemListProps) => {
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

  const handleAdd = () => {
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    onAddNew();
  };

  return (
    <section className="panel list-panel">
      <div className="panel-header">
        <h2>Community Problems</h2>
        <button className="btn" onClick={handleAdd}>
          + Add New Problem
        </button>
      </div>
      <div className="problem-list">
        {problems.length === 0 ? (
          <div className="empty">No problems yet.</div>
        ) : (
          problems.map((problem) => {
            const isActive = problem.id === selectedId;
            const viewsCount = problem.views_count ?? problem.views ?? 0;
            const lastActivity = problem.last_activity_at ?? problem.last_activity ?? problem.created_at;
            return (
              <button
                key={problem.id}
                className={`problem-card ${isActive ? "active" : ""}`}
                onClick={() => onSelect(problem.id)}
              >
                <div className="problem-title">{problem.title ?? "Untitled"}</div>
                <div className="problem-meta">
                  {problem.status ? <span className="status-badge">{problem.status}</span> : null}
                  {typeof problem.likes_count === "number" ? <span>Likes {problem.likes_count}</span> : null}
                  {typeof problem.comments_count === "number" ? <span>Comments {problem.comments_count}</span> : null}
                  {typeof problem.artifacts_count === "number" ? <span>Artifacts {problem.artifacts_count}</span> : null}
                  {typeof problem.working_count === "number" ? <span>Working {problem.working_count}</span> : null}
                </div>
                <div className="problem-meta-secondary">
                  {viewsCount} views • active {formatRelativeTime(lastActivity)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ProblemList;
