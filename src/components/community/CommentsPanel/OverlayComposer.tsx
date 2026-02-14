import type { RefObject, SyntheticEvent } from "react";
import type { CommentTemplate } from "./commentTemplates";

type OverlayComposerProps = {
  isAuthed: boolean;
  body: string;
  canSubmit: boolean;
  selectedTemplate: string;
  templates: CommentTemplate[];
  editorFontSize: number;
  overlayTextareaRef: RefObject<HTMLTextAreaElement | null>;
  onBodyChange: (value: string) => void;
  onTemplateSelect: (label: string) => void;
  onDecreaseFont: () => void;
  onResetFont: () => void;
  onIncreaseFont: () => void;
  onClose: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

const OverlayComposer = ({
  isAuthed,
  body,
  canSubmit,
  selectedTemplate,
  templates,
  editorFontSize,
  overlayTextareaRef,
  onBodyChange,
  onTemplateSelect,
  onDecreaseFont,
  onResetFont,
  onIncreaseFont,
  onClose,
  onSubmit,
}: OverlayComposerProps) => {
  return (
    <div className="sl-overlay-backdrop" onClick={onClose} role="presentation">
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
              {templates.map((template) => (
                <option key={template.label} value={template.label}>
                  {template.label}
                </option>
              ))}
            </select>
            <button type="button" className="btn secondary sl-zoom-btn" onClick={onDecreaseFont}>
              A-
            </button>
            <button type="button" className="btn secondary sl-zoom-btn" onClick={onResetFont}>
              Reset
            </button>
            <button type="button" className="btn secondary sl-zoom-btn" onClick={onIncreaseFont}>
              A+
            </button>
            <button type="button" className="btn secondary sl-overlay-close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <form className="comment-form sl-overlay-body" onSubmit={onSubmit}>
          <textarea
            name="problem-comment-overlay"
            rows={10}
            placeholder={isAuthed ? "Add a comment" : "Log in to comment"}
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            ref={overlayTextareaRef}
            style={{ fontSize: `${editorFontSize}px` }}
          />
          <button className="btn" type="submit" disabled={!canSubmit}>
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default OverlayComposer;
