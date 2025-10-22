// src/hooks/useReviewDetail.js (새로 생성)
import { useState, useEffect } from 'react';
import { reviewsAPI } from '../api/reviews.js';
import { commentsAPI } from '../api/comments.js';

export function useReviewDetail(reviewId) {
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 리뷰 상세 정보 로드
  const loadReviewDetail = async () => {
    if (!reviewId) return;

    try {
      setLoading(true);
      setError(null);

      // 리뷰 상세 정보와 댓글을 병렬로 가져오기
      const [reviewResponse, commentsResponse] = await Promise.all([
        reviewsAPI.getReviewDetail(reviewId),
        commentsAPI.getReviewComments(reviewId)
      ]);

      if (reviewResponse.success) {
        setReview(reviewResponse.data);
        
        // 로그인한 사용자의 좋아요 상태 확인
        const likeStatusResponse = await reviewsAPI.getReviewLikeStatus(reviewId);
        if (likeStatusResponse.success) {
          setIsLiked(likeStatusResponse.data.isLiked);
        }
      } else {
        setError(`리뷰를 불러올 수 없습니다: ${reviewResponse.error}`);
      }

      if (commentsResponse.success) {
        setComments(commentsResponse.data || []);
      } else {
        console.warn('댓글 로드 실패:', commentsResponse.error);
        setComments([]);
      }

    } catch (err) {
      console.error('리뷰 상세 로드 에러:', err);
      setError('리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      const response = await reviewsAPI.toggleReviewLike(reviewId);
      
      if (response.success) {
        setIsLiked(response.data.is_liked);
        // 리뷰 좋아요 수 업데이트
        setReview(prev => ({
          ...prev,
          likeCount: response.data.likes_count
        }));
      } else {
        console.error('좋아요 토글 실패:', response.error);
      }
    } catch (err) {
      console.error('좋아요 토글 에러:', err);
    }
  };

  // 댓글 추가
  const addComment = async (content, parentCommentId = null) => {
    try {
      const response = await commentsAPI.createComment(reviewId, content, parentCommentId);
      
      if (response.success) {
        // 댓글 목록 새로고침
        const commentsResponse = await commentsAPI.getReviewComments(reviewId);
        if (commentsResponse.success) {
          setComments(commentsResponse.data || []);
        }
        
        // 리뷰의 댓글 수 업데이트
        setReview(prev => ({
          ...prev,
          commentCount: prev.commentCount + 1
        }));
        
        return true;
      } else {
        console.error('댓글 작성 실패:', response.error);
        return false;
      }
    } catch (err) {
      console.error('댓글 작성 에러:', err);
      return false;
    }
  };

  // 리뷰 삭제
  const deleteReview = async () => {
    try {
      const response = await reviewsAPI.deleteReview(reviewId);
      
      if (response.success) {
        return true;
      } else {
        console.error('리뷰 삭제 실패:', response.error);
        return false;
      }
    } catch (err) {
      console.error('리뷰 삭제 에러:', err);
      return false;
    }
  };

  useEffect(() => {
    loadReviewDetail();
  }, [reviewId]);

  return {
    review,
    comments,
    isLiked,
    loading,
    error,
    toggleLike,
    addComment,
    deleteReview,
    refresh: loadReviewDetail
  };
}