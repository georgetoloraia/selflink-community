import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ProblemComment } from "../../api/community";
import Markdown from "../Markdown/Markdown";

type CommentsPanelProps = {
  title?: string;
  comments: ProblemComment[];
  onSubmit: (body: string) => void;
  onToggleLike: (commentId: string, hasLiked: boolean) => void;
  onRequireLogin: () => void;
  isAuthed: boolean;
  isLoading: boolean;
  error?: string | null;
};

const CommentsPanel = ({
  title = "Discussion",
  comments,
  onSubmit,
  onToggleLike,
  onRequireLogin,
  isAuthed,
  isLoading,
  error,
}: CommentsPanelProps) => {
  const [body, setBody] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const inlineTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastRoleButtonRef = useRef<HTMLButtonElement | null>(null);
  const pendingTemplateSelectRef = useRef(false);
  const PLACEHOLDER = "[Type here...]";

  const templates: Array<{ label: string; value: string }> = [
    {
      label: "Suggest an idea",
      value: `### 💡 Suggest an idea\n\nWhat problem or improvement do you see?\n- ${PLACEHOLDER}\n\nWhy would this help?\n- ${PLACEHOLDER}\n\n(Optional) Examples or references:\n- ${PLACEHOLDER}\n`,
    },
    {
      label: "Design feedback",
      value: `### 🎨 Design feedback\n\nWhat feels unclear or confusing?\n- ${PLACEHOLDER}\n\nWhat could be improved visually or UX-wise?\n- ${PLACEHOLDER}\n\n(Optional) Screenshots, sketches, or references:\n- ${PLACEHOLDER}\n`,
    },
    {
      label: "Try to reproduce",
      value: `### 🧪 Try to reproduce\n\nWhat did you try?\n- ${PLACEHOLDER}\n\nWhat happened?\n- ${PLACEHOLDER}\n\nWhat did you expect instead?\n- ${PLACEHOLDER}\n\nEnvironment (optional):\n- Browser / device: ${PLACEHOLDER}\n- OS: ${PLACEHOLDER}\n`,
    },
    {
      label: "Advice / architecture",
      value: `### 🧠 Advice / architecture\n\nHigh-level suggestion or concern:\n- ${PLACEHOLDER}\n\nReasoning:\n- ${PLACEHOLDER}\n\nTrade-offs or alternatives:\n- ${PLACEHOLDER}\n`,
    },
    {
      label: "Code fix",
      value: `### 💻 Code fix\n\nWhat part of the codebase would you change?\n- ${PLACEHOLDER}\n\nProposed approach:\n- ${PLACEHOLDER}\n\n(Optional) Links to files or PR:\n- ${PLACEHOLDER}\n`,
    },
  ];

  const applyTemplate = (template: string, target: HTMLButtonElement | null) => {
    setBody((prev) => {
      const trimmed = prev.trim();
      const next = trimmed ? `${prev}\n\n${template}` : template;
      return next;
    });
    lastRoleButtonRef.current = target;
    pendingTemplateSelectRef.current = true;
    setIsComposerOpen(true);
  };

  const handleTemplateClick = (template: string, target: HTMLButtonElement | null) => {
    applyTemplate(template, target);
  };

  const openOverlayFromInline = () => {
    if (isComposerOpen) return;
    lastRoleButtonRef.current = null;
    pendingTemplateSelectRef.current = false;
    setIsComposerOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    if (!body.trim()) return;
    onSubmit(body.trim());
    setBody("");
    setIsComposerOpen(false);
  };

  const closeOverlay = () => {
    setIsComposerOpen(false);
    setSelectedTemplate("");
    requestAnimationFrame(() => {
      if (lastRoleButtonRef.current) {
        lastRoleButtonRef.current.focus();
      } else {
        inlineTextareaRef.current?.focus();
      }
    });
  };

  useEffect(() => {
    if (!isComposerOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isComposerOpen]);

  useEffect(() => {
    if (!isComposerOpen) return;
    requestAnimationFrame(() => {
      const textarea = overlayTextareaRef.current;
      if (!textarea) return;
      textarea.focus();
      if (pendingTemplateSelectRef.current) {
        const index = textarea.value.indexOf(PLACEHOLDER);
        if (index >= 0) {
          textarea.setSelectionRange(index, index + PLACEHOLDER.length);
        } else {
          const length = textarea.value.length;
          textarea.setSelectionRange(length, length);
        }
        pendingTemplateSelectRef.current = false;
      } else {
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }
    });
  }, [isComposerOpen, body]);

  const clampFontSize = (value: number) => Math.min(22, Math.max(12, value));

  const handleTemplateSelect = (value: string) => {
    setSelectedTemplate(value);
    const selected = templates.find((template) => template.label === value);
    if (!selected) return;
    applyTemplate(selected.value, null);
    setSelectedTemplate("");
  };

  return (
    <section className="sub-panel">
      <div className="sub-panel-header">
        <h3>{title}</h3>
      </div>
      {isLoading ? <div>Loading comments...</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="empty">No comments yet.</div>
        ) : (
          <div className="sl-comments-scroll">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item sl-comment-item">
                <div className="comment-author">{comment.user?.username ?? "Anonymous"}</div>
                <Markdown className="sl-comment-markdown" value={comment.body} />
                <div className="comment-actions">
                  <button
                    className="link-btn"
                    type="button"
                    onClick={() => {
                      if (!isAuthed) {
                        onRequireLogin();
                        return;
                      }
                      onToggleLike(comment.id, comment.has_liked);
                    }}
                  >
                    {comment.has_liked ? "Unlike" : "Like"} ({comment.likes_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="comment-templates">
        <div className="comment-templates-title">How you can help</div>
        <div className="comment-templates-subtitle">Not sure what to write? Pick a role.</div>
        <div className="comment-templates-actions">
          {templates.map((template) => (
            <button
              key={template.label}
              type="button"
              className="btn secondary comment-template-btn"
              onClick={(event) => handleTemplateClick(template.value, event.currentTarget)}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
      <div className={`sl-compose${isComposerOpen ? " sl-compose--disabled" : ""}`}>
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            name="problem-comment"
            rows={3}
            placeholder={isAuthed ? "Click to write a comment (opens editor)" : "Log in to comment"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            ref={inlineTextareaRef}
            disabled={isComposerOpen}
            onFocus={openOverlayFromInline}
            onClick={openOverlayFromInline}
          />
          <button className="btn secondary" type="submit" disabled={isComposerOpen}>
            Post Comment
          </button>
        </form>
      </div>
      {isComposerOpen ? (
        <div className="sl-overlay-backdrop" onClick={closeOverlay} role="presentation">
          <div
            className="sl-overlay-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Comment editor"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sl-overlay-header">
              <div className="sl-overlay-title">Write a comment</div>
              <div className="sl-overlay-actions">
                <select
                  className="sl-template-select"
                  value={selectedTemplate}
                  onChange={(event) => handleTemplateSelect(event.target.value)}
                >
                  <option value="">Template</option>
                  {templates.map((template) => (
                    <option key={template.label} value={template.label}>
                      {template.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn secondary sl-zoom-btn"
                  onClick={() => setEditorFontSize((size) => clampFontSize(size - 1))}
                >
                  A-
                </button>
                <button
                  type="button"
                  className="btn secondary sl-zoom-btn"
                  onClick={() => setEditorFontSize(15)}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn secondary sl-zoom-btn"
                  onClick={() => setEditorFontSize((size) => clampFontSize(size + 1))}
                >
                  A+
                </button>
                <button type="button" className="btn secondary sl-overlay-close" onClick={closeOverlay}>
                  Close
                </button>
              </div>
            </div>
            <form className="comment-form sl-overlay-body" onSubmit={handleSubmit}>
              <textarea
                name="problem-comment-overlay"
                rows={10}
                placeholder={isAuthed ? "Add a comment" : "Log in to comment"}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                ref={overlayTextareaRef}
                style={{ fontSize: `${editorFontSize}px` }}
              />
              <button className="btn" type="submit">
                Post Comment
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CommentsPanel;
