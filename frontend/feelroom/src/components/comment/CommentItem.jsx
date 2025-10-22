import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Pencil } from 'lucide-react';
import { formatTimeAgo } from '../../utils/helpers';

export default function CommentItem({
  comment,
  onToggleLike,
  onReply,
  onDelete,
  onEdit,
  currentUserId,
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');

  const commentData = {
    id: comment.commentId ?? comment.comment_id ?? comment.id,
    content: comment.content,
    createdAt: comment.createdAt ?? comment.created_at,
    likeCount: comment.likeCount ?? comment.likes_count ?? 0,
    parentId: comment.parentCommentId ?? comment.parent_comment_id ?? comment.parentId,
    isLiked: comment.liked ?? comment.isLiked ?? false,
    deleted: comment.deleted ?? false,
    user: {
      id: comment.writer?.userId ?? comment.user?.id ?? null,
      nickname: comment.writer?.nickname ?? comment.user?.nickname ?? '익명',
      profileImageUrl: comment.writer?.profileImageUrl ?? comment.user?.profileImageUrl ?? null,
    },
    mentionedUser: comment.mentionedUser ? {
      id: comment.mentionedUser.userId,
      nickname: comment.mentionedUser.nickname,
      profileImageUrl: comment.mentionedUser.profileImageUrl,
    } : null
  };

  const isReply = !!commentData.parentId;

  // 로컬스토리지 userId와 댓글 작성자 userId를 문자열로 변환해서 비교
  const isMine = String(currentUserId) === String(commentData.user.id);

  // 시간 표시 함수 - 초 단위는 '방금 전'으로 처리
  const getDisplayTime = (createdAt) => {
    const timeAgo = formatTimeAgo(createdAt);

    // 초 단위 패턴 체크 (예: "30초 전", "1초 전" 등)
    if (timeAgo.includes('초 전') || timeAgo === '방금 전') {
      return '방금 전';
    }

    return timeAgo;
  };

  // 프로필 클릭 핸들러 추가
  const handleProfileClick = () => {
    if (commentData.user.id) {
      const localUserId = localStorage.getItem('userId');
      const commentUserId = commentData.user.id;

      // 본인 프로필이면 /profile, 다른 사람이면 /profile/{userId}
      if (String(localUserId) === String(commentUserId)) {
        navigate('/profile');
      } else {
        navigate(`/profile/${commentUserId}`);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return alert('내용을 입력해주세요.');
    await onEdit?.(commentData.id, editContent.trim());
    setIsEditing(false);
  };

  return (
    <div
      className={`comment-item ${isReply ? 'comment-item--reply' : ''}`}
      style={{
        marginLeft: isReply ? '2rem' : '0',
        paddingLeft: isReply ? '1rem' : '0',
        borderLeft: isReply ? '2px solid #e0e0e0' : 'none'
      }}
    >
      <div className="comment-item__header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* 프로필 이미지 - 클릭 이벤트 추가 */}
        <div
          style={{
            width: '1.2em',
            height: '1.2em',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={handleProfileClick}
        >
          {commentData.user.profileImageUrl ? (
            <img
              src={commentData.user.profileImageUrl}
              alt={`${commentData.user.nickname} 프로필`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.7em',
              color: '#666',
              fontWeight: 'bold'
            }}>
              {commentData.user.nickname.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* 닉네임 - 클릭 이벤트 추가 */}
        <span
          className="comment-item__author"
          style={{ cursor: 'pointer', color: '#000000ff', fontWeight: '600' }}
          onClick={handleProfileClick}
        >
          {commentData.user.nickname}
        </span>
        <span className="comment-item__timestamp" style={{ marginLeft: '0.25rem', fontSize: '0.9rem', }}>
          {getDisplayTime(commentData.createdAt)}
        </span>
      </div>

      {/* ✏️ 수정 중이면 textarea, 아니면 텍스트 */}
      {isEditing ? (
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
      ) : (
        <p className="comment-item__text" style={{ marginTop: '0.5rem' }}>
          {commentData.mentionedUser && (
            <span style={{ color: '#007bff', marginRight: '0.5rem' }}>
              @{commentData.mentionedUser.nickname}
            </span>
          )}
          {commentData.content}
        </p>
      )}

      <div className="comment-item__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        {/* ❤️ 좋아요 */}
        <button
          type="button"
          onClick={() => onToggleLike?.(commentData.id)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Heart
            size={16}
            fill={commentData.isLiked ? '#ff4757' : 'none'}
            color={commentData.isLiked ? '#ff4757' : '#666'}
          />
          <span style={{ marginLeft: 4, fontSize: '0.9rem', color: '#666' }}>
            {commentData.likeCount}
          </span>
        </button>

        {/* 💬 답글 or 멘션 */}
        {onReply && (
          <button
            type="button"
            onClick={() => onReply(commentData)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#666',
              fontSize: '0.9rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '20px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            <MessageCircle size={16} /> {isReply ? '멘션' : '답글달기'}
          </button>
        )}

        {/* ✏️ 수정 */}
        {isMine && !commentData.deleted && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#666',
              fontSize: '0.9rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '20px',
              transition: 'background-color 0.2s ease'
            }}
          >
            <Pencil size={16} /> 수정
          </button>
        )}

        {/* 수정 완료 / 취소 */}
        {isEditing && (
          <>
            <button
              type="button"
              onClick={handleEditSubmit}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer'
              }}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => {
                setEditContent(commentData.content);
                setIsEditing(false);
              }}
              style={{
                backgroundColor: '#ccc',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </>
        )}

        {/* 🗑 삭제 */}
        {isMine && !commentData.deleted && !isEditing && (
          <button
            type="button"
            onClick={() => onDelete?.(commentData.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#c33',
              fontSize: '0.9rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '20px',
              transition: 'background-color 0.2s ease'
            }}
          >
            <Trash2 size={16} /> 삭제
          </button>
        )}
      </div>
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  onToggleLike: PropTypes.func,
  onReply: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};