// src/pages/review/LikedReview.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReviewItem_liked from '../../components/review/ReviewItem_liked';
import { useLikedReviews } from '../../hooks/useLikedReviews';

export default function LikedReview() {
  const navigate = useNavigate();
  const { reviews, loading, error, refresh } = useLikedReviews();

  const handleReviewClick = (review) => {
    const reviewId = review.reviewId || review.id;
    navigate(`/review/${reviewId}`);
  };

  const handleLikeToggle = async (reviewId) => {
    // TODO: 좋아요 토글 API 호출
    // console.log('좋아요 토글:', reviewId);
    // 성공 시 목록 새로고침
    refresh();
  };

  // 로딩 상태
  if (loading && reviews.length === 0) {
    return (
      <main className="page-liked-review" style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          좋아요한 리뷰를 불러오는 중...
        </div>
      </main>
    );
  }

  // 에러 상태
  if (error && reviews.length === 0) {
    return (
      <main className="page-liked-review" style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          gap: '1rem'
        }}>
          <div style={{ color: '#dc3545' }}>{error}</div>
          <button
            onClick={refresh}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  // API 응답을 컴포넌트에 맞게 변환
  const transformReviewData = (review) => ({
    id: review.reviewId || review.id,
    movieImage: review.movie?.posterUrl || 'https://via.placeholder.com/60x80?text=No+Image',
    movieTitle: review.movie?.title || '영화 제목',
    releaseYear: review.movie?.releaseYear || '0000',
    userImage: review.user?.profileImageUrl || review.author?.profileImageUrl || 'https://via.placeholder.com/32?text=U',
    userName: review.user?.nickname || review.author?.nickname || '사용자',
    postDate: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '날짜 없음',
    isLiked: true // 좋아요한 리뷰 목록이므로 항상 true
  });

  return (
    <main className="page-liked-review" style={{
      padding: '1rem',
      maxWidth: '100%',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* 뒤로가기 + 제목 */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.5rem 0'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '0.5rem',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} color="#374151" />
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          좋아요한 리뷰 ({reviews.length})
        </h1>
      </header>

      {/* 좋아요한 리뷰 목록 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        {reviews.length > 0 ? (
          reviews.map(review => {
            const transformedReview = transformReviewData(review);
            return (
              <ReviewItem_liked
                key={transformedReview.id}
                movieImage={transformedReview.movieImage}
                movieTitle={transformedReview.movieTitle}
                releaseYear={transformedReview.releaseYear}
                userImage={transformedReview.userImage}
                userName={transformedReview.userName}
                postDate={transformedReview.postDate}
                isLiked={transformedReview.isLiked}
                onLikeToggle={() => handleLikeToggle(transformedReview.id)}
                onClick={() => handleReviewClick(review)}
              />
            );
          })
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            좋아요한 리뷰가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
