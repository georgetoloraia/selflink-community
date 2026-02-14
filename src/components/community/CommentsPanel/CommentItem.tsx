import type { ProblemComment } from "../../../api/community";
import Markdown from "../../Markdown/Markdown";

type CommentItemProps = {
  comment: ProblemComment;
  onLikeClick: (commentId: string, hasLiked: boolean) => void;
};

const CommentItem = ({ comment, onLikeClick }: CommentItemProps) => {
  return (
    <div className="comment-item sl-comment-item">
      <div className="comment-author">{comment.user?.username ?? "Anonymous"}</div>
      <Markdown className="sl-comment-markdown" value={comment.body} />
      <div className="comment-actions">
        <button
          className="link-btn"
          type="button"
          onClick={() => onLikeClick(comment.id, comment.has_liked)}
        >
          {comment.has_liked ? "Unlike" : "Like"} ({comment.likes_count})
        </button>
      </div>
    </div>
  );
};

export default CommentItem;
