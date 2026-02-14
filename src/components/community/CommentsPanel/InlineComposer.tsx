import type { RefObject, SyntheticEvent } from "react";

type InlineComposerProps = {
  isComposerOpen: boolean;
  isAuthed: boolean;
  body: string;
  canSubmit: boolean;
  inlineTextareaRef: RefObject<HTMLTextAreaElement | null>;
  onBodyChange: (value: string) => void;
  onOpenOverlay: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

const InlineComposer = ({
  isComposerOpen,
  isAuthed,
  body,
  canSubmit,
  inlineTextareaRef,
  onBodyChange,
  onOpenOverlay,
  onSubmit,
}: InlineComposerProps) => {
  return (
    <div className={`sl-compose${isComposerOpen ? " sl-compose--disabled" : ""}`}>
      <form className="comment-form" onSubmit={onSubmit}>
        <textarea
          name="problem-comment"
          rows={3}
          placeholder={isAuthed ? "Click to write a comment (opens editor)" : "Log in to comment"}
          value={body}
          onChange={(event) => onBodyChange(event.target.value)}
          ref={inlineTextareaRef}
          disabled={isComposerOpen}
          onFocus={onOpenOverlay}
          onClick={onOpenOverlay}
        />
        <button className="btn secondary" type="submit" disabled={isComposerOpen || !canSubmit}>
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default InlineComposer;
