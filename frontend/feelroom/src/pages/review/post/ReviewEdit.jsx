// src/pages/review/post/ReviewEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import defaultPosterImage2 from '../../../assets/img2.png';

import useAuth from '../../../hooks/useAuth';
import { reviewsAPI } from '../../../api/reviews';
import ReviewForm from '../../../components/review/ReviewForm';

export default function ReviewEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();

  // ReviewDetail에서 state로 받아온 리뷰 데이터
  const reviewData = location.state?.review;

  // 영화 상세 정보 상태
  const [movieDetails, setMovieDetails] = useState(null);
  const [loadingMovieDetails, setLoadingMovieDetails] = useState(false);
  const [movieDetailsError, setMovieDetailsError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 해시태그 관련 상태
  const [recommendedTags, setRecommendedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagError, setTagError] = useState(null);

  // 리뷰 데이터가 없으면 안내 후 돌아가기
  if (!reviewData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        gap: '1rem'
      }}>
        <div>수정할 리뷰 정보를 찾을 수 없습니다.</div>
        <button
          onClick={() => navigate(`/review/${id}`)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          리뷰로 돌아가기
        </button>
      </div>
    );
  }

  // 영화 상세 정보 가져오기
  const fetchMovieDetails = async (movieId) => {
    setLoadingMovieDetails(true);
    setMovieDetailsError(null);

    try {
      // console.log('🎬 영화 상세정보 API 호출 시작, movieId:', movieId);

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}`);

      // console.log('🎬 영화 상세정보 API 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error('영화 상세정보를 불러올 수 없습니다.');
      }

      const data = await response.json();
      // console.log('✅ 영화 상세정보 성공:', data);

      if (data.details) {
        setMovieDetails(data.details);
      } else {
        console.warn('⚠️ 예상하지 못한 응답 형식:', data);
        setMovieDetailsError('영화 정보 형식이 올바르지 않습니다.');
      }

    } catch (err) {
      console.error('❌ 영화 상세정보 에러:', err);
      setMovieDetailsError(err.message || '영화 상세정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingMovieDetails(false);
    }
  };

  // 해시태그 추천 API 호출
  const fetchRecommendedTags = async () => {
    if (!reviewData?.movie?.movieId) return;

    setLoadingTags(true);
    setTagError(null);

    try {
      // console.log('🏷️ 해시태그 추천 API 호출 시작, movieId:', reviewData.movie.movieId);

      // localStorage에서 토큰 가져오기
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setTagError('로그인이 필요합니다.');
        return;
      }

      // 요청 데이터 (현재 리뷰의 평점과 내용 사용)
      const requestData = {
        movieId: reviewData.movie.movieId,
        rating: reviewData.rating || 1,
        reviewContent: reviewData.content || "test"
      };

      // Bearer 토큰 헤더 설정
      const headers = {
        'Content-Type': 'application/json'
      };

      if (authToken.startsWith('Bearer ')) {
        headers.Authorization = authToken;
      } else {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // console.log('🏷️ 해시태그 요청 데이터:', requestData);

      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/reviews/tags/recommend', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });

      // console.log('🏷️ 해시태그 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 해시태그 API 에러:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: 해시태그를 불러올 수 없습니다.`);
      }

      const data = await response.json();
      // console.log('✅ 해시태그 추천 성공:', data);

      if (data.tags && Array.isArray(data.tags)) {
        setRecommendedTags(data.tags);
      } else {
        console.warn('⚠️ 예상하지 못한 응답 형식:', data);
        setRecommendedTags([]);
      }

    } catch (err) {
      console.error('❌ 해시태그 추천 에러:', err);
      setTagError(err.message || '해시태그를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingTags(false);
    }
  };

  // 해시태그 토글 함수
  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 컴포넌트 마운트 시 영화 상세정보 및 해시태그 추천 API 호출
  useEffect(() => {
    if (reviewData?.movie?.movieId) {
      fetchMovieDetails(reviewData.movie.movieId);
      fetchRecommendedTags();
    }

    // 기존 태그를 selectedTags에 설정
    if (reviewData?.tags && Array.isArray(reviewData.tags)) {
      setSelectedTags(reviewData.tags);
    }
  }, [reviewData?.movie?.movieId]);

  // 개봉연도 추출 함수
  const extractYear = (dateString) => {
    if (!dateString) return '';

    // YYYY-MM-DD 또는 YYYY 형식에서 연도 추출
    const yearMatch = dateString.match(/^(\d{4})/);
    return yearMatch ? yearMatch[1] : '';
  };

  // ReviewForm 컴포넌트에서 사용할 영화 데이터
  const movieForForm = movieDetails ? {
    movieId: reviewData.movie.movieId,
    posterUrl: movieDetails.posterUrl || defaultPosterImage2,
    title: movieDetails.title,
    releaseDate: movieDetails.releaseDate,
    releaseYear: extractYear(movieDetails.releaseDate),
    genres: movieDetails.genres || [],
    runtime: movieDetails.runtime || 0
  } : {
    movieId: reviewData.movie.movieId,
    posterUrl: reviewData.movie?.posterUrl || defaultPosterImage2,
    title: reviewData.movie?.title || '영화 제목 로딩 중...',
    releaseDate: reviewData.movie?.releaseDate || '',
    releaseYear: extractYear(reviewData.movie?.releaseDate),
    genres: reviewData.movie?.genres || [],
    runtime: reviewData.movie?.runtime || 0
  };

  // ReviewForm 초기 데이터
  const initialFormData = {
    title: reviewData.title || '',
    content: reviewData.content || '',
    userRating: reviewData.rating || 0,
    tags: reviewData.tags || []
  };

  const handleSubmit = async (formData) => {
    if (!formData.title.trim() || !formData.content.trim() || formData.userRating === 0) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // console.log('📝 리뷰 수정 시작, reviewId:', id);
      // console.log('🏷️ 선택된 해시태그:', selectedTags);

      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        rating: formData.userRating,
        visibility_value: 'public', // 필요에 따라 변경
        tags: selectedTags // 선택된 해시태그 포함
      };

      // console.log('📋 전송할 수정 데이터:', updateData);

      const response = await reviewsAPI.updateReview(id, updateData);
      if (response.success) {
        navigate(`/review/${id}`, { replace: true });
      } else {
        setError(`리뷰 수정에 실패했습니다: ${response.error}`);
      }
    } catch (err) {
      console.error('리뷰 수정 에러:', err);
      setError('리뷰 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/review/${id}`);
  };

  return (
    <main className="page-review-edit" style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      {/* 헤더 */}
      <header style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        >
          ← 뒤로가기
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>리뷰 수정</h1>
      </header>

      {/* 영화 상세정보 로딩 */}
      {loadingMovieDetails && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          영화 정보를 불러오는 중...
        </div>
      )}

      {/* 영화 상세정보 에러 */}
      {movieDetailsError && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          영화 정보: {movieDetailsError} (기본 정보로 진행됩니다)
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fee',
          color: '#c33',
          border: '1px solid #fcc',
          borderRadius: '4px',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            fontSize: '1.1rem'
          }}>
            리뷰를 수정하는 중...
          </div>
        </div>
      )}

      {/* 기존 ReviewForm 컴포넌트 활용 */}
      <ReviewForm
        movie={movieForForm}
        initialData={initialFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel={loading ? '수정 중...' : '수정 완료'}
        // AI 태그 추천 props 추가
        recommendedTags={recommendedTags}
        selectedTags={selectedTags}
        loadingTags={loadingTags}
        tagError={tagError}
        onToggleTag={toggleTag}
        onRetryTags={fetchRecommendedTags}
      />

      {/* 개발 정보 */}
      {/* {movieDetails && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          💡 <strong>개발 정보:</strong> 영화 ID {reviewData?.movie?.movieId}의 상세정보 로드됨.
          장르: {movieDetails.genres?.join(', ') || '정보 없음'},
          런타임: {movieDetails.runtime ? `${movieDetails.runtime}분` : '정보 없음'}
        </div>
      )} */}
    </main>
  );
}