// src/hooks/useMyReviews.js
import { useState, useEffect, useCallback } from 'react';

export function useMyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // 토큰 가져오기
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const loadReviews = useCallback(async (page = 0, append = false) => {
    try {
      setError(null);
      if (page === 0) setLoading(true);

      const authToken = getAuthToken();
      if (!authToken) {
        setError('로그인이 필요합니다.');
        return;
      }

      // console.log(`📖 useMyReviews - 페이지 ${page} 로드 중...`);

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/me/reviews?page=${page}&size=20`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 리뷰를 불러올 수 없습니다.`);
      }

      const data = await response.json();
      // console.log('✅ useMyReviews API 응답:', data);

      const newReviews = data.reviews || data.content || [];
      const isLastPage = data.last !== undefined ? data.last : (newReviews.length < 20);
      
      if (append) {
        setReviews(prev => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }
      
      setHasMore(!isLastPage);
      setCurrentPage(page);

    } catch (err) {
      console.error('❌ useMyReviews 에러:', err);
      setError(err.message || '리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(0);
  }, [loadReviews]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadReviews(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, loadReviews]);

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
    refresh
  };
}

// src/hooks/useLikedReviews.js  
export function useLikedReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 토큰 가져오기
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const loadLikedReviews = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const authToken = getAuthToken();
      if (!authToken) {
        setError('로그인이 필요합니다.');
        return;
      }

      // console.log('💖 useLikedReviews - 좋아요한 리뷰 로드 중...');

      // TODO: 실제 좋아요한 리뷰 API로 변경 필요
      // 현재는 내 리뷰에서 liked: true인 것만 필터링
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/users/me/reviews?page=0&size=20', {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 좋아요한 리뷰를 불러올 수 없습니다.`);
      }

      const data = await response.json();
      // console.log('✅ useLikedReviews API 응답:', data);

      const allReviews = data.reviews || [];
      const likedReviews = allReviews.filter(review => review.liked === true);
      
      setReviews(likedReviews);

    } catch (err) {
      console.error('❌ useLikedReviews 에러:', err);
      setError(err.message || '좋아요한 리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLikedReviews();
  }, [loadLikedReviews]);

  const refresh = useCallback(() => {
    loadLikedReviews();
  }, [loadLikedReviews]);

  return {
    reviews,
    loading,
    error,
    refresh
  };
}

// src/hooks/useMyComments.js
export function useMyComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComments = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // TODO: 실제 댓글 API 구현 필요
      // console.log('💬 useMyComments - 임시로 빈 배열 반환');
      
      // 임시로 빈 배열 설정
      setComments([]);

    } catch (err) {
      console.error('❌ useMyComments 에러:', err);
      setError(err.message || '댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const refresh = useCallback(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    refresh
  };
}