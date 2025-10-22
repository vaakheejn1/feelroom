// src/components/comment/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComments';
import { useCommentActions } from '../../hooks/useCommentActions';
import CommentList from './CommentList';

export default function CommentSection({ reviewId, onCommentCountChange }) {
  const { user } = useAuth();
  const { comments, loading, error, hasMore, loadMore, refresh } = useComments(reviewId);
  const { create, toggleLike, remove, update } = useCommentActions();

  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // 로컬스토리지에서 직접 userId 가져오기
  const currentUserId = localStorage.getItem('userId');

  // ✅ 삭제되지 않은 댓글/답글만 카운트
  const countValidComments = (comments) => {
    return comments.reduce((sum, comment) => {
      const isParentValid = !comment.deleted;
      const validReplies = (comment.replies || []).filter(r => !r.deleted).length;
      return sum + (isParentValid ? 1 : 0) + validReplies;
    }, 0);
  };

  // ✅ 댓글 수 반영
  useEffect(() => {
    const total = countValidComments(comments);
    onCommentCountChange?.(total);
  }, [comments, onCommentCountChange]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await create(reviewId, newContent.trim());
      if (res.success) {
        setNewContent('');
        await refresh();
      } else {
        alert(`댓글 작성 실패: ${res.error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = commentData => {
    const isReply = !!commentData.parentId;
    if (!isReply) {
      setReplyTo({
        type: 'reply',
        parentId: commentData.id,
        mentionUserId: commentData.user.id,
        // displayText: `${commentData.user.nickname}님에게 답글`,
        displayText: `답글`,
      });
    } else {
      setReplyTo({
        type: 'mention',
        parentId: commentData.parentId,
        mentionUserId: commentData.user.id,
        displayText: `${commentData.user.nickname}님을 멘션`,
      });
    }
    setReplyText('');
  };

  const handleSubmitReply = async e => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const { parentId, mentionUserId } = replyTo;
      const res = await create(reviewId, replyText.trim(), parentId, mentionUserId);
      if (res.success) {
        setReplyTo(null);
        setReplyText('');
        await refresh();
      } else {
        alert(`${replyTo.type === 'reply' ? '답글' : '멘션'} 작성 실패: ${res.error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async commentId => {
    await toggleLike(commentId);
    await refresh();
  };

  const handleDelete = async commentId => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setIsSubmitting(true);
    try {
      const res = await remove(commentId);
      if (res.success) {
        await refresh();
      } else {
        alert(`댓글 삭제 실패: ${res.error}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId, newContent) => {
    const trimmed = newContent.trim();
    if (!trimmed) return alert('수정할 내용을 입력해주세요.');
    const res = await update(commentId, trimmed);
    if (res.success) {
      await refresh();
    } else {
      alert(`댓글 수정 실패: ${res.error}`);
    }
  };

  return (
    <div className="comment-section">
      {/* ✅ 유효 댓글만 카운트 */}
      <h3 style={{ marginBottom: '1rem' }}>
        댓글 {countValidComments(comments)}개
      </h3>

      {/* 댓글 입력폼 */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="댓글을 입력하세요"
          disabled={isSubmitting}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newContent.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isSubmitting || !newContent.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting || !newContent.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? '등록중...' : '등록'}
        </button>
      </form>

      {/* 답글 or 멘션 입력폼 */}
      {replyTo && (
        <form
          onSubmit={handleSubmitReply}
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px'
          }}
        >
          <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>{replyTo.displayText}:</span>
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={replyTo.type === 'reply' ? '답글을 입력하세요' : '멘션을 입력하세요'}
            disabled={isSubmitting}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #99c' }}
          />
          <button
            type="submit"
            disabled={isSubmitting || !replyText.trim()}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: isSubmitting || !replyText.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting || !replyText.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '등록중...' : '등록'}
          </button>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            취소
          </button>
        </form>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* 댓글 목록 - 로컬스토리지 userId 전달 */}
      <CommentList
        comments={comments}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onToggleLike={handleToggleLike}
        onReply={handleReply}
        onDelete={handleDelete}
        onEdit={handleEdit}
        currentUserId={currentUserId}
      />
    </div>
  );
}

CommentSection.propTypes = {
  reviewId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCommentCountChange: PropTypes.func,
};