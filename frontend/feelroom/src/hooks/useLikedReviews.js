// src/hooks/useLikedReviews.js
import { useState, useEffect, useCallback } from 'react';
import { userActivityAPI } from '../api/user-activity.js';

export function useLikedReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { success, data, error: errMsg } = await userActivityAPI.getLikedReviews(0);
      if (!success) throw new Error(errMsg);
      // Swagger에 따르면 data.reviews 가 실제 배열
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('좋아요한 리뷰 로드 에러:', err);
      setError(err.message || '불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return {
    reviews,         // 이제 배열입니다
    loading,
    error,
    refresh: load
  };
}
