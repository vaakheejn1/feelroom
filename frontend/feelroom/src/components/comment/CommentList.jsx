// src/components/comment/CommentList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import CommentItem from './CommentItem';

export default function CommentList({
  comments,
  loading,
  hasMore,
  onLoadMore,
  onToggleLike,
  onReply,
  onDelete,
  onEdit,
  currentUserId,
  reviewAuthorId,
}) {
  if (!comments?.length) {
    return (
      <div className="comment-list--empty">
        <p style={{ textAlign: 'center', color: '#666', padding: '2rem', fontStyle: 'italic' }}>
          아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map((comment, idx) => {
        const id = comment.commentId ?? comment.comment_id ?? comment.id;
        const replies = comment.replies || [];
        const isParentDeleted = comment.deleted === true;
        const allRepliesDeleted = replies.length > 0 && replies.every(r => r.deleted);

        // 🔥 대댓글 없이 삭제된 댓글 → 렌더링 생략
        if (isParentDeleted && replies.length === 0) return null;

        // 🔥 부모 댓글 삭제 + 대댓글도 모두 삭제 → 전체 블록 제거
        if (isParentDeleted && replies.length > 0 && allRepliesDeleted) return null;

        return (
          <div key={id ?? idx} className="comment-thread" style={{ marginBottom: '1.5rem' }}>
            {/* 부모 댓글 표시 */}
            {!isParentDeleted ? (
              <CommentItem
                comment={comment}
                onToggleLike={onToggleLike}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
                currentUserId={currentUserId}
                reviewAuthorId={reviewAuthorId}
              />
            ) : (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                color: '#999',
                fontStyle: 'italic',
              }}>
                삭제된 댓글입니다.
              </div>
            )}

            {/* 대댓글 출력 */}
            {replies.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {replies.map((reply, ridx) => {
                  const rid = reply.commentId ?? reply.comment_id ?? reply.id;
                  const isReplyDeleted = reply.deleted === true;

                  return (
                    <div key={rid ?? `r-${idx}-${ridx}`}>
                      {isReplyDeleted ? (
                        <div style={{
                          padding: '0.5rem 1rem',
                          marginLeft: '2rem',
                          borderLeft: '2px solid #eee',
                          color: '#999',
                          fontStyle: 'italic'
                        }}>
                          삭제된 댓글입니다.
                        </div>
                      ) : (
                        <CommentItem
                          comment={reply}
                          onToggleLike={onToggleLike}
                          onReply={isParentDeleted ? undefined : onReply}
                          onDelete={onDelete}
                          onEdit={onEdit}
                          currentUserId={currentUserId}
                          reviewAuthorId={reviewAuthorId}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          style={{
            margin: '1rem auto',
            display: 'block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          더보기
        </button>
      )}

      {loading && (
        <p style={{ padding: '1rem', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
          불러오는 중…
        </p>
      )}
    </div>
  );
}

CommentList.propTypes = {
  comments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onToggleLike: PropTypes.func,
  onReply: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reviewAuthorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};