import type { ProblemEvent } from "../../api/community";

type ActivityPanelProps = {
  events: ProblemEvent[];
  isLoading?: boolean;
  error?: string | null;
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

const labelForEvent = (event: ProblemEvent) => {
  const actor = event.actor?.username ? `@${event.actor.username} ` : "";
  switch (event.type) {
    case "problem.created":
      return actor ? `${actor}created the problem` : "Problem created";
    case "problem.viewed":
      return actor ? `${actor}viewed` : "Viewed";
    case "problem.agreement_accepted":
      return actor ? `${actor}accepted the MIT agreement` : "MIT agreement accepted";
    case "problem.work_marked":
      return actor ? `${actor}marked working on it` : "Marked working on it";
    case "problem.work_unmarked":
      return actor ? `${actor}stopped working on it` : "Stopped working on it";
    case "problem.liked":
      return actor ? `${actor}liked this` : "Liked";
    case "problem.unliked":
      return actor ? `${actor}unliked this` : "Unliked";
    case "problem.comment_created":
      return actor ? `${actor}added a comment` : "Comment added";
    case "problem.artifact_created":
      return actor ? `${actor}added a work artifact` : "Work artifact added";
    default:
      return actor ? `${actor}${event.type}` : event.type;
  }
};

const ActivityPanel = ({ events, isLoading, error }: ActivityPanelProps) => {
  const visibleEvents = events.slice(0, 25);

  return (
    <section className="sub-panel">
      <div className="sub-panel-header">
        <h3>Activity</h3>
      </div>
      {isLoading ? <div>Loading activity...</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
      <div className="activity-list">
        {visibleEvents.length === 0 && !isLoading ? (
          <div className="empty">No activity yet.</div>
        ) : (
          visibleEvents.map((event) => (
            <div key={event.id} className="activity-item">
              <div className="activity-label">{labelForEvent(event)}</div>
              <div className="activity-time">{formatRelativeTime(event.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ActivityPanel;
