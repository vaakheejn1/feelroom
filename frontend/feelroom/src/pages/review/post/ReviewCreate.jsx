// src/pages/review/post/ReviewCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import defaultPosterImage2 from '../../../assets/img2.png';

// 경로 수정 (3단계 상위로)
import useAuth from '../../../hooks/useAuth';
import ReviewForm from '../../../components/review/ReviewForm';

export default function ReviewCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // MovieSelection에서 전달받은 영화 정보
  const selectedMovie = location.state?.movie;

  // 영화 상세 정보 상태
  const [movieDetails, setMovieDetails] = useState(null);
  const [loadingMovieDetails, setLoadingMovieDetails] = useState(false);
  const [movieDetailsError, setMovieDetailsError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 해시태그 관련 상태 (새 API 기준)
  const [recommendedTags, setRecommendedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagError, setTagError] = useState(null);

  // 관리자 확인 및 클립보드 복사 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 관리자 확인
  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    setIsAdmin(nickname == '오늘도영화' || nickname == '영화보러가자' || nickname == '집콕시네마' || nickname == '영화보는펭귄');
  }, []);

  // 클립보드 복사 함수
  const handleSecretCopy = async () => {
    const secretText = '코미디 영화는 극장 분위기에 좌우된단 말이 있는데 가족단위 관객들이 많았구 정말 많이 웃으시더라구요. 웃음도 전염된다고 들었는데 극장 분위기가 너무 좋아서 올 여름 가족 단위로 극장 나들이 하기에 정말 좋은 영화일듯해요!';

    try {
      await navigator.clipboard.writeText(secretText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      // fallback: 텍스트 선택 방식
      const textArea = document.createElement('textarea');
      textArea.value = secretText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback 복사도 실패:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // 영화가 선택되지 않은 경우 리다이렉트
  if (!selectedMovie) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        gap: '1rem'
      }}>
        <div>영화를 먼저 선택해주세요.</div>
        <button
          onClick={() => navigate('/movie-selection')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          영화 선택하기
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

  // 새로운 해시태그 추천 API 호출
  const fetchRecommendedTags = async (title, content) => {
    if (!title || !content) {
      setTagError('내용을 10자 이상 입력 후 해시태그를 생성해주세요.');
      return;
    }

    setLoadingTags(true);
    setTagError(null);
    setRecommendedTags([]); // 기존 태그 초기화

    try {
      // console.log('🏷️ 새 해시태그 추천 API 호출 시작');

      // 요청 데이터
      const requestData = {
        title: title,
        content: content,
        count: 15,
        max_content_length: 500
      };

      // console.log('🏷️ 해시태그 요청 데이터:', requestData);

      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/reviews/tags/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

      if (data.success && data.hashtags && Array.isArray(data.hashtags)) {
        // hashtag_id와 hashtag만 추출
        const tags = data.hashtags.map(tag => ({
          id: tag.hashtag_id,
          name: tag.hashtag
        }));
        setRecommendedTags(tags);
      } else {
        console.warn('⚠️ 예상하지 못한 응답 형식:', data);
        setRecommendedTags([]);
      }

    } catch (err) {
      console.error('❌ 해시태그 추천 에러:', err);
      setTagError(err.message || '해시태그를 불러오는 중 오류가 발생했습니다.');
    } finally {
      // 최소 1초간 로딩 표시
      setTimeout(() => {
        setLoadingTags(false);
      }, 1000);
    }
  };

  // 해시태그 토글 함수
  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 컴포넌트 마운트 시 영화 상세정보 호출
  useEffect(() => {
    if (selectedMovie?.id) {
      fetchMovieDetails(selectedMovie.id);
    }
  }, [selectedMovie?.id]);

  // ReviewForm 컴포넌트에서 사용할 영화 데이터 (상세정보 우선 사용)
  const movieForForm = {
    posterUrl: movieDetails?.posterUrl || selectedMovie.movieImage || defaultPosterImage2,
    title: movieDetails?.title || selectedMovie.movieTitle || selectedMovie.title,
    releaseDate: movieDetails?.releaseDate || selectedMovie.releaseDate,
    genres: movieDetails?.genres || selectedMovie.genres || [],
    runtime: movieDetails?.runtime || selectedMovie.runtime || 0
  };

  const handleSubmit = async (formData) => {
    if (!formData.title.trim() || !formData.content.trim() || formData.userRating === 0) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (!selectedMovie?.id) {
      setError('영화 정보가 올바르지 않습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // console.log('📝 리뷰 작성 시작, movieId:', selectedMovie.id);

      // localStorage에서 토큰 가져오기
      const authToken = localStorage.getItem('authToken');
      // console.log('🔐 토큰 확인:', !!authToken);

      if (!authToken) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      // 요청 데이터 구성 - 선택된 태그 ID들 포함
      const reviewData = {
        movieId: selectedMovie.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        rating: formData.userRating,
        tagIds: selectedTags.map(tag => tag.id) // 선택된 태그 ID들
      };

      // console.log('📋 전송할 데이터:', reviewData);
      // console.log('🏷️ 선택된 해시태그:', selectedTags);

      // Bearer 토큰 헤더 설정
      const headers = {
        'Content-Type': 'application/json'
      };

      // Bearer 접두사 확인 및 추가
      if (authToken.startsWith('Bearer ')) {
        headers.Authorization = authToken;
      } else {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // console.log('🔗 요청 헤더:', headers);

      // API 요청
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/reviews', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(reviewData)
      });

      // console.log('📡 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API 에러 응답:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: 리뷰 작성에 실패했습니다.`);
      }

      const result = await response.json();
      // console.log('✅ API 응답 성공:', result);

      // 작성 완료 후 해당 리뷰 상세 페이지로 이동
      if (result.reviewId || result.id) {
        navigate(`/review/${result.reviewId || result.id}`, { replace: true });
      } else {
        // reviewId가 없다면 홈으로 이동
        navigate('/home', { replace: true });
      }

    } catch (err) {
      console.error('❌ 리뷰 작성 에러:', err);
      setError(err.message || '리뷰 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // 로딩 애니메이션 컴포넌트
  const LoadingDots = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
      padding: '1rem'
    }}>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
          }
          .loading-dot {
            width: 8px;
            height: 8px;
            background-color: #007bff;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
          }
          .loading-dot:nth-child(1) { animation-delay: -0.32s; }
          .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        `}
      </style>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  );

  return (
    <main className="page-review-create" style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      {/* 헤더 */}
      <header style={{ marginBottom: '2rem', position: 'relative' }}>
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
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>리뷰 작성</h1>

        {/* 관리자 전용 비밀 버튼 */}
        {isAdmin && (
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleSecretCopy}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid #ddd',
                backgroundColor: copySuccess ? '#28a745' : '#f8f9fa',
                color: copySuccess ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: 0.7
              }}
              title="비밀 템플릿 복사"
              onMouseEnter={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '0.7';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {copySuccess ? '✓' : '🔐'}
            </button>
            {copySuccess && (
              <span style={{
                fontSize: '0.8rem',
                color: '#28a745',
                opacity: 0.8
              }}>
                복사됨
              </span>
            )}
          </div>
        )}
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
            리뷰를 작성하는 중...
          </div>
        </div>
      )}

      {/* 기존 ReviewForm 컴포넌트 활용 */}
      <ReviewForm
        movie={movieForForm}
        initialData={{
          title: '',
          content: '',
          userRating: 0,
          tags: []
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel={loading ? '작성 중...' : '리뷰 등록'}
        // AI 태그 추천 props - 새 API 기준으로 수정
        recommendedTags={recommendedTags}
        selectedTags={selectedTags}
        loadingTags={loadingTags}
        tagError={tagError}
        onToggleTag={toggleTag}
        onGenerateTags={fetchRecommendedTags} // fetchRecommendedTags 함수 전달
        LoadingDots={LoadingDots} // 로딩 컴포넌트 전달
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
          💡 <strong>개발 정보:</strong> 영화 ID {selectedMovie.id}의 상세정보 로드됨.
          장르: {movieDetails.genres?.join(', ') || '정보 없음'}
          {selectedTags.length > 0 && (
            <div>선택된 태그: {selectedTags.map(tag => tag.name).join(', ')}</div>
          )}
        </div>
      )} */}
    </main>
  );
}