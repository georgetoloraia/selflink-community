import { FormEvent, useState } from "react";
import { Comment } from "../../api/community";

type CommentsPanelProps = {
  title?: string;
  comments: Comment[];
  onSubmit: (body: string) => void;
  onRequireLogin: () => void;
  isAuthed: boolean;
  isLoading: boolean;
  error?: string | null;
};

const CommentsPanel = ({
  title = "Discussion",
  comments,
  onSubmit,
  onRequireLogin,
  isAuthed,
  isLoading,
  error,
}: CommentsPanelProps) => {
  const [body, setBody] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthed) {
      onRequireLogin();
      return;
    }
    if (!body.trim()) return;
    onSubmit(body.trim());
    setBody("");
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
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-author">
                {comment.author?.name || comment.author?.username || comment.author?.handle || "Anonymous"}
              </div>
              <div className="comment-body">{comment.body}</div>
            </div>
          ))
        )}
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder={isAuthed ? "Add a comment" : "Log in to comment"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="btn secondary" type="submit">
          Post Comment
        </button>
      </form>
    </section>
  );
};

export default CommentsPanel;
