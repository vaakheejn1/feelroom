// ===== 3. 홈 데이터 관리 훅 =====
// src/hooks/useHomeData.js (새로 생성)
import { useState, useEffect, useCallback } from 'react';
import { homeAPI } from '../api/home.js';

export function useHomeData() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // 리뷰 데이터 로드
  const loadReviews = useCallback(async (page = 0, append = false) => {
    try {
      setError(null);
      if (page === 0) setLoading(true);
      
      const response = await homeAPI.getFeed('popular', page);
      
      let newReviews = [];
      let isLast = true;
      
      if (response.success) {
        newReviews = response.data.content || [];
        isLast = response.data.last || false;
      } else {
        // API 실패 시 목업 데이터 사용
        console.warn('API 실패, 목업 데이터 사용:', response.error);
        newReviews = response.mockData?.content || [];
        isLast = response.mockData?.last || false;
      }
      
      if (append) {
        setReviews(prev => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }
      
      setHasMore(!isLast);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('리뷰 로드 에러:', err);
      setError('리뷰를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadReviews(0);
  }, [loadReviews]);

  // 더 많은 리뷰 로드 (무한 스크롤)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadReviews(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, loadReviews]);

  // 새로고침
  const refresh = useCallback(() => {
    setCurrentPage(0);
    loadReviews(0);
  }, [loadReviews]);

  return {
    reviews,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}