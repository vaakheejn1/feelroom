// src/hooks/useMyComments.js (새로 생성)
import { useState, useEffect, useCallback } from 'react';
import { userActivityAPI } from '../api/user-activity.js';

export function useMyComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMyComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userActivityAPI.getMyComments(0);

      if (response.success) {
        setComments(response.data.content || response.data || []);
      } else {
        setError(`내 댓글을 불러올 수 없습니다: ${response.error}`);
      }
    } catch (err) {
      console.error('내 댓글 로드 에러:', err);
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyComments();
  }, [loadMyComments]);

  return {
    comments,
    loading,
    error,
    refresh: loadMyComments
  };
}