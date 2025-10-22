// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import { commentsAPI } from '../api/comments.js';

export function useComments(reviewId, initialPage = 0, pageSize = 20) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [page, setPage]         = useState(initialPage);
  const [hasMore, setHasMore]   = useState(false);

  const loadComments = useCallback(async (p = initialPage, append = false) => {
    // console.log('🔍 댓글 로딩 시작:', { reviewId, page: p, append });
    setLoading(true); 
    setError(null);
    
    const { success, data, error: errMsg } = await commentsAPI.getReviewComments(reviewId, p, pageSize);
    
    // console.log('🔍 API 응답:', { success, data, error: errMsg });
    
    if (success) {
      const items = data.content ?? data;
      // console.log('🔍 받은 댓글 items:', items);
      
      setComments(prev => {
        const newComments = append ? [...prev, ...items] : items;
        // console.log('🔍 설정될 댓글들:', newComments);
        return newComments;
      });
      
      setHasMore(!data.last);
      setPage(p);
    } else {
      console.error('❌ 댓글 로딩 실패:', errMsg);
      setError(errMsg);
    }
    setLoading(false);
  }, [reviewId, initialPage, pageSize]);

  useEffect(() => { 
    // console.log('🔍 useEffect 댓글 로딩 시작');
    loadComments(initialPage, false); 
  }, [loadComments, initialPage]);

  const loadMore = () => { 
    if (hasMore && !loading) {
      // console.log('🔍 더보기 클릭');
      loadComments(page + 1, true);
    }
  };
  
  const refresh = () => {
    // console.log('🔍 댓글 새로고침');
    loadComments(initialPage, false);
  };

  // 현재 상태 로그
  // console.log('🔍 useComments 현재 상태:', { 
  //   commentsLength: comments.length, 
  //   loading, 
  //   error, 
  //   hasMore 
  // });

  return { comments, loading, error, hasMore, loadMore, refresh };
}