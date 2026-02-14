import type { FormEvent } from "react";
import type { ProblemComment } from "../../api/community";
import Markdown from "../Markdown/Markdown";
import { COMMENT_TEMPLATES, PLACEHOLDER } from "./CommentsPanel/commentTemplates";
import { useCommentComposer } from "./CommentsPanel/useCommentComposer";

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
  const {
    body,
    setBody,
    isComposerOpen,
    openOverlayFromInline,
    closeOverlay,
    applyTemplateFromButton,
    editorFontSize,
    setEditorFontSize,
    clampFontSize,
    selectedTemplate,
    onTemplateSelect,
    inlineTextareaRef,
    overlayTextareaRef,
  } = useCommentComposer(PLACEHOLDER);

  const canSubmit = isAuthed && body.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    if (!body.trim()) return;
    onSubmit(body.trim());
    setBody("");
    closeOverlay();
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
          {COMMENT_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              className="btn secondary comment-template-btn"
              onClick={(event) => applyTemplateFromButton(template.value, event.currentTarget)}
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
          <button className="btn secondary" type="submit" disabled={isComposerOpen || !canSubmit}>
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
                  onChange={(event) => onTemplateSelect(event.target.value)}
                >
                  <option value="">Template</option>
                  {COMMENT_TEMPLATES.map((template) => (
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
              <button className="btn" type="submit" disabled={!canSubmit}>
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
