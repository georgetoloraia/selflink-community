import type { ProblemComment } from "../../../api/community";
import CommentItem from "./CommentItem";

type CommentListProps = {
  comments: ProblemComment[];
  onLikeClick: (commentId: string, hasLiked: boolean) => void;
};

const CommentList = ({ comments, onLikeClick }: CommentListProps) => {
  return (
    <div className="comment-list">
      {comments.length === 0 ? (
        <div className="empty">No comments yet.</div>
      ) : (
        <div className="sl-comments-scroll">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onLikeClick={onLikeClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
