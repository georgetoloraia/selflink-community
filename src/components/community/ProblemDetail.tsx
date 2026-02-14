import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "../../api/community";
import CommentsPanel from "./CommentsPanel";
import ArtifactsPanel from "./ArtifactsPanel";
import ActivityPanel from "./ActivityPanel";
import Markdown from "../Markdown/Markdown";

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
  const [isReadingMode, setIsReadingMode] = useState(() => {
    try {
      return localStorage.getItem("sl_reading_mode") === "true";
    } catch {
      return false;
    }
  });
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [tocHeadings, setTocHeadings] = useState<Array<{ id: string; text: string; level: 2 | 3 }>>([]);
  const descriptionText = problem?.description ?? "No description provided.";
  const shouldShowToc = tocHeadings.length >= 3 || (descriptionText.length >= 600 && tocHeadings.length > 0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const toggleReadingMode = () => {
    setIsReadingMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sl_reading_mode", String(next));
      } catch {
        // Ignore localStorage access issues.
      }
      return next;
    });
  };

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
    if (!problem) return;
    onToggleWork(Boolean(problem.is_working));
  };

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return "—";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "—";
    const diffMs = Math.max(0, currentTimeMs - parsed.getTime());
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const slugify = (value: string) => {
    const base = value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return base || "section";
  };

  useEffect(() => {
    if (!problem) {
      const timeoutId = window.setTimeout(() => {
        setTocHeadings([]);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
    const container = descriptionRef.current;
    if (!container) {
      const timeoutId = window.setTimeout(() => {
        setTocHeadings([]);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
    const headings = Array.from(container.querySelectorAll("h2, h3"));
    const seen = new Map<string, number>();
    const nextHeadings: Array<{ id: string; text: string; level: 2 | 3 }> = headings.map((heading) => {
      const text = heading.textContent?.trim() ?? "";
      const level: 2 | 3 = heading.tagName.toLowerCase() === "h3" ? 3 : 2;
      const baseSlug = slugify(text);
      const count = seen.get(baseSlug) ?? 0;
      const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
      seen.set(baseSlug, count + 1);
      heading.id = slug;
      return { id: slug, text: text || "Section", level };
    });
    const timeoutId = window.setTimeout(() => {
      setTocHeadings(nextHeadings);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [descriptionText, problem]);

  const tocItems = useMemo(
    () =>
      tocHeadings.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`toc-item${item.level === 3 ? " level-3" : ""}`}
          onClick={() => {
            const target = descriptionRef.current?.querySelector<HTMLElement>(`#${item.id}`);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          {item.text}
        </button>
      )),
    [tocHeadings]
  );

  if (!problem) {
    return (
      <section className="panel detail-panel">
        <div className="empty">Select a problem to see details.</div>
      </section>
    );
  }

  const workingList = Array.isArray(problem.working_on_this)
    ? problem.working_on_this.slice(0, 20)
    : [];
  const viewsCount = problem.views_count ?? problem.views ?? 0;
  const lastActivity = problem.last_activity_at ?? problem.last_activity ?? problem.created_at;

  return (
    <section className={`panel detail-panel${isReadingMode ? " sl-reading-mode" : ""}`}>
      <div className="detail-header">
        <div>
          <h2>{problem.title ?? "Untitled"}</h2>
          {problem.status ? <div className="status-badge">{problem.status}</div> : null}
          <div className="detail-meta">
            Views: {viewsCount} • Last activity: {formatRelativeTime(lastActivity)}
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn secondary reading-toggle" onClick={toggleReadingMode} type="button">
            Reading mode {isReadingMode ? "On" : "Off"}
          </button>
          <button className="btn secondary" onClick={handleLike}>
            {problem.has_liked ? "Liked" : "Like"}
          </button>
          <button className="btn" onClick={handleWork}>
            {problem.is_working ? "Working on it" : "Mark working on it"}
          </button>
        </div>
      </div>
      {isReadingMode && shouldShowToc ? (
        <div className="toc-card">
          <div className="toc-title">On this page</div>
          <div className="toc-list">{tocItems}</div>
        </div>
      ) : null}
      <div className="problem-description-wrap" ref={descriptionRef}>
        <Markdown className="problem-description" value={descriptionText} />
      </div>
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
        {!isReadingMode && shouldShowToc ? (
          <section className="sub-panel toc-panel">
            <div className="sub-panel-header">
              <h3>On this page</h3>
            </div>
            <div className="toc-list">{tocItems}</div>
          </section>
        ) : null}
        <CommentsPanel {...commentsProps} />
        <ArtifactsPanel {...artifactsProps} />
        <ActivityPanel {...eventsProps} />
      </div>
    </section>
  );
};

export default ProblemDetail;
