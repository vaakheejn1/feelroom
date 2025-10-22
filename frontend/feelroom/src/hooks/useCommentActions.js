import { useState } from 'react';
import { commentsAPI } from '../api/comments.js';

export function useCommentActions() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const create     = async (...args) => {
    setLoading(true); setError(null);
    const res = await commentsAPI.createComment(...args);
    if (!res.success) setError(res.error);
    setLoading(false);
    return res;
  };

  const update     = async (commentId, content) => {
    setLoading(true); setError(null);
    const res = await commentsAPI.updateComment(commentId, content);
    if (!res.success) setError(res.error);
    setLoading(false);
    return res;
  };

  // remove 함수 인자에서 reviewId 제거
const remove = async (commentId) => {
  setLoading(true); setError(null);
  const res = await commentsAPI.deleteComment(commentId); // ✅ 수정
  if (!res.success) setError(res.error);
  setLoading(false);
  return res;
};

  const toggleLike = async (commentId) => {
    setLoading(true); setError(null);
    const res = await commentsAPI.toggleLikeComment(commentId);
    if (!res.success) setError(res.error);
    setLoading(false);
    return res;
  };

  return { create, update, remove, toggleLike, loading, error };
}
