import type { SyntheticEvent } from "react";
import type { ProblemComment } from "../../api/community";
import { COMMENT_TEMPLATES, PLACEHOLDER } from "./CommentsPanel/commentTemplates";
import CommentList from "./CommentsPanel/CommentList";
import CommentTemplates from "./CommentsPanel/CommentTemplates";
import InlineComposer from "./CommentsPanel/InlineComposer";
import OverlayComposer from "./CommentsPanel/OverlayComposer";
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

  const handleLikeClick = (commentId: string, hasLiked: boolean) => {
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    onToggleLike(commentId, hasLiked);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
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
      <CommentList comments={comments} onLikeClick={handleLikeClick} />
      <CommentTemplates templates={COMMENT_TEMPLATES} onTemplateClick={applyTemplateFromButton} />
      <InlineComposer
        isComposerOpen={isComposerOpen}
        isAuthed={isAuthed}
        body={body}
        canSubmit={canSubmit}
        inlineTextareaRef={inlineTextareaRef}
        onBodyChange={setBody}
        onOpenOverlay={openOverlayFromInline}
        onSubmit={handleSubmit}
      />
      {isComposerOpen ? (
        <OverlayComposer
          isAuthed={isAuthed}
          body={body}
          canSubmit={canSubmit}
          selectedTemplate={selectedTemplate}
          templates={COMMENT_TEMPLATES}
          editorFontSize={editorFontSize}
          overlayTextareaRef={overlayTextareaRef}
          onBodyChange={setBody}
          onTemplateSelect={onTemplateSelect}
          onDecreaseFont={() => setEditorFontSize((size) => clampFontSize(size - 1))}
          onResetFont={() => setEditorFontSize(15)}
          onIncreaseFont={() => setEditorFontSize((size) => clampFontSize(size + 1))}
          onClose={closeOverlay}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
};

export default CommentsPanel;
