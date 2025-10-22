// src/pages/review/ReviewDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import RatingStars from '../../components/review/RatingStars';
import CommentSection from '../../components/comment/CommentSection';
import useAuth from '../../hooks/useAuth';
import { reviewsAPI } from '../../api/reviews';
import img2 from '../../assets/img2.png';
import BackgroundComponent from '../../BackgroundComponent2.jsx';

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [review, setReview] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200); // 1200px 기준 모바일

  // 팔로우 관련 state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      setIsMobile(window.innerWidth < 1200); // 1200px 기준으로 모바일 상태 업데이트
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 영화 상세정보 가져오기
  const fetchMovieDetails = async (movieId) => {
    try {
      // console.log('🎬 영화 상세정보 API 호출, movieId:', movieId);
      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}`);

      if (response.ok) {
        const data = await response.json();
        // console.log('✅ 영화 상세정보 성공:', data);
        setMovieDetails(data.details);
      } else {
        console.warn('⚠️ 영화 상세정보 로드 실패');
      }
    } catch (err) {
      console.error('❌ 영화 상세정보 에러:', err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await reviewsAPI.getReviewDetail(id);
      if (res.success) {
        setReview(res.data);
        setIsLiked(res.data.liked ?? false);

        // 영화 상세정보 가져오기
        if (res.data.movie?.movieId) {
          fetchMovieDetails(res.data.movie.movieId);
        }

        // 팔로우 상태 확인
        if (res.data.author?.userId && currentUser) {
          checkFollowStatus(res.data.author.userId);
        }
      } else {
        setError(res.error);
      }
      setLoading(false);
    })();
  }, [id]);

  // 팔로우 관련 함수들
  const checkFollowStatus = async (targetUserId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${targetUserId}/follow`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
      }
    } catch (err) {
      console.error('팔로우 상태 확인 오류:', err);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!review?.author?.userId) return;

    setFollowLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${review.author.userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(true);
      } else {
        alert('팔로우에 실패했습니다.');
      }
    } catch (err) {
      console.error('팔로우 오류:', err);
      alert('팔로우에 실패했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!review?.author?.userId) return;

    setFollowLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${review.author.userId}/unfollow`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(false);
        setShowUnfollowModal(false);
      } else {
        alert('언팔로우에 실패했습니다.');
      }
    } catch (err) {
      console.error('언팔로우 오류:', err);
      alert('언팔로우에 실패했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    const res = await reviewsAPI.toggleReviewLike(id);
    if (res.success) {
      setIsLiked(res.data.liked);
      setReview(prev => ({ ...prev, likeCount: res.data.likesCount }));
    }
  };

  const editReview = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    navigate(`/review/${id}/edit`, { state: { review } });
  };

  const deleteReview = async () => {
    if (!window.confirm('정말 삭제할까요?')) return;
    const res = await reviewsAPI.deleteReview(id);
    if (res.success) navigate('/home');
    else alert('삭제에 실패했습니다.');
  };

  // 프로필 클릭 핸들러
  const handleProfileClick = () => {
    if (review?.author?.userId) {
      const localUserId = localStorage.getItem('userId');
      const authorUserId = review.author.userId;

      if (String(localUserId) === String(authorUserId)) {
        navigate('/profile');
      } else {
        navigate(`/profile/${authorUserId}`);
      }
    }
  };

  // 영화 카드 클릭 핸들러 추가
  const handleMovieClick = () => {
    if (review?.movie?.movieId) {
      navigate(`/movieDetail/${review.movie.movieId}`);
    }
  };

  if (loading) return <div>로딩 중…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!review) return <div>리뷰를 찾을 수 없습니다.</div>;

  const {
    movie, author, rating, likeCount,
    title, content, createdAt, tags = [], commentCount
  } = review;

  // 영화 정보 - 상세정보 우선 사용
  const displayMovie = {
    title: movieDetails?.title || movie.title,
    posterUrl: movieDetails?.posterUrl || movie.posterUrl,
    releaseDate: movieDetails?.releaseDate || movie.releaseDate,
    genres: movieDetails?.genres || movie.genres || [],
    runtime: movieDetails?.runtime || movie.runtime
  };

  const releaseYear = displayMovie.releaseDate?.slice(0, 4) || '----';

  // 장르와 런타임 표시 문자열 생성
  const movieInfo = [];
  if (releaseYear !== '----') movieInfo.push(releaseYear);
  if (displayMovie.genres && displayMovie.genres.length > 0) {
    movieInfo.push(displayMovie.genres.join(', '));
  }
  if (displayMovie.runtime && displayMovie.runtime > 0) {
    movieInfo.push(`${displayMovie.runtime}분`);
  }
  const movieInfoString = movieInfo.length > 0 ? movieInfo.join(' · ') : '정보 없음';

  const localUserId = localStorage.getItem('userId');
  const apiUserId = author.userId;
  const isMatch = String(localUserId) === String(apiUserId);

  // console.log('🔍 리뷰 작성자 확인:');
  // console.log('API에서 받은 리뷰의 userId:', apiUserId, typeof apiUserId);
  // console.log('로컬스토리지의 userId:', localUserId, typeof localUserId);
  // console.log('두 ID가 일치하는지:', isMatch);

  return (
    <div style={{
      padding: 16,
      maxWidth: 1024,
      margin: '0 auto',
      fontFamily: 'sans-serif'
    }}>
      {/* 언팔로우 확인 모달 */}
      {showUnfollowModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
              팔로우 취소
            </h3>
            <p style={{ margin: '0 0 24px', color: '#666', lineHeight: '1.5' }}>
              {author.nickname}님의 팔로우를 정말 취소하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowUnfollowModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleUnfollow}
                disabled={followLoading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: followLoading ? 'not-allowed' : 'pointer',
                  opacity: followLoading ? 0.7 : 1
                }}
              >
                {followLoading ? '처리중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#007bff',
          fontSize: 16,
          fontWeight: 500,
          marginBottom: 16,
          cursor: 'pointer'
        }}
      >
        ← 뒤로가기
      </button>

      <div style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        gap: 24
      }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* MOVIE CARD - 모바일에서 레이아웃 변경 */}
          <div
            onClick={handleMovieClick}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : (isDesktop ? 'row' : 'column'),
              background: '#efefefff',
              borderRadius: 8,
              border: '1px solid #ddd',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              padding: 12,
              cursor: 'pointer'
            }}
          >
            <img
              src={displayMovie.posterUrl || img2}
              alt={displayMovie.title}
              style={{
                width: 80,
                height: 120,
                borderRadius: 4,
                objectFit: 'cover',
                flexShrink: 0
              }}
              onError={e => { e.currentTarget.src = img2; }}
            />
            <div style={{
              flex: 1,
              marginLeft: isMobile ? 12 : (isDesktop ? 12 : 0),
              marginTop: isMobile ? '0.4rem' : '0.2rem',
              marginBottom: isMobile ? '-0.2rem' : '0rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  margin: isMobile ? '0 0 4px' : '0 0 8px',

                  fontSize: 20,
                  color: '#2b2b2bff',
                  ...(isMobile && {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  })
                }}>
                  {isMobile && displayMovie.title.length > 14
                    ? `${displayMovie.title.substring(0, 14)}...`
                    : displayMovie.title
                  }
                </h2>

                {isMobile ? (
                  // 모바일 레이아웃: 세로로 나열
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 14, color: '#777' }}>
                      {releaseYear !== '----' && displayMovie.runtime && displayMovie.runtime > 0
                        ? `${releaseYear} · ${displayMovie.runtime}분`
                        : releaseYear !== '----'
                          ? releaseYear
                          : displayMovie.runtime && displayMovie.runtime > 0
                            ? `${displayMovie.runtime}분`
                            : '정보 없음'
                      }
                    </div>

                    {displayMovie.genres && displayMovie.genres.length > 0 && (
                      <div style={{ fontSize: 14, color: '#777' }}>
                        {displayMovie.genres.join(', ')}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#555'
                    }}>
                      <RatingStars value={rating / 2} readOnly size={12} />
                      <span>{rating.toFixed(1)}/10.0</span>
                    </div>
                  </div>
                ) : (
                  // 기존 레이아웃
                  <>
                    <div style={{
                      fontSize: 14,
                      color: '#777',
                      marginBottom: 8
                    }}>
                      {movieInfoString}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: '#777',
                      marginBottom: 8
                    }}>
                      {likeCount}명이 좋아요
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,

                      fontSize: 12,
                      color: '#555'
                    }}>
                      <RatingStars value={rating / 2} readOnly size={12} />
                      <span>{rating.toFixed(1)}/10.0</span>
                      <span></span>
                      <span></span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* AUTHOR ROW */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div
              onClick={handleProfileClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flex: 1,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px'
              }}
            >
              <img
                src={author.profileImageUrl || img2}
                alt={author.nickname}
                style={{
                  width: 32, height: 32, borderRadius: '50%', objectFit: 'cover'
                }}
              />
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#000000ff' }}>
                  {author.nickname}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {new Date(createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>

            {/* 팔로우 버튼 - 본인이 아닐 때만 표시 */}
            {!isMatch && currentUser && (
              <button
                onClick={isFollowing ? () => setShowUnfollowModal(true) : handleFollow}
                disabled={followLoading}
                style={{
                  padding: '6px 12px',
                  border: isFollowing ? '1px solid #ddd' : '1px solid #007bff',
                  borderRadius: '16px',
                  backgroundColor: isFollowing ? '#f8f9fa' : '#007bff',
                  color: isFollowing ? '#666' : 'white',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: followLoading ? 'not-allowed' : 'pointer',
                  opacity: followLoading ? 0.7 : 1
                }}
              >
                {followLoading ? '처리중...' : isFollowing ? '팔로잉' : '팔로우'}
              </button>
            )}

            {/* 수정/삭제 버튼들 - 작성자만 볼 수 있음 */}
            {String(localStorage.getItem('userId')) === String(author.userId) && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={editReview}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#3b82f6'
                  }}
                >
                  수정
                </button>
                <button
                  onClick={deleteReview}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#c33',
                    fontSize: 14
                  }}
                >
                  <Trash2 size={16} /> 삭제
                </button>
              </div>
            )}
          </div>
          <BackgroundComponent />

          {/* CONTENT BOX */}
          <div style={{
            background: '#ecececff',
            borderRadius: 8,
            //boxShadow: '0 1px 4px rgba(43, 41, 41, 0.1)',
            //border: isMobile ? '1px solid #ddd' : '1px solid #9a9a9aff',
            marginTop: isMobile ? '-8px' : '-8px',
            overflow: 'hidden'
          }}>
            {/* 제목 영역 */}
            <div style={{
              padding: isMobile ? '10px 16px 8px' : '10px 21px 8px',
              borderBottom: '1px solid #f0f0f0',
              background: '#ffffffff'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: '#111827',
                lineHeight: '1.4'
              }}>
                {title}
              </h3>
            </div>

            {/* 콘텐츠 영역 */}
            <div style={{
              padding: isMobile ? '20px 16px' : '24px 20px',
              minHeight: 80,
              background: '#ffffffff'
            }}>
              <pre style={{
                margin: 0,
                lineHeight: '1.6',
                color: '#3f3f3fff',
                fontFamily: `'Malgun Gothic', 'Gulim', sans-serif`,
                fontSize: '16px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {content}
              </pre>
            </div>
          </div>

          {/* RATING & LIKE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0px 0 20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <RatingStars value={rating / 2} readOnly size={18} />
              <span style={{ fontSize: 14, color: '#555' }}>
                {rating.toFixed(1)}/10.0
              </span>
            </div>
            <button
              onClick={toggleLike}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: isLiked ? '#e11d48' : '#666'
              }}
            >
              <Heart size={24} fill={isLiked ? '#e11d48' : 'none'} color={isLiked ? '#e11d48' : '#666'} />
              {review.likeCount}
            </button>
          </div>

          {/* TAGS */}
          {tags && tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: isMobile ? '-21px' : '4px',
              marginTop: isMobile ? '-21px' : '-14px',
              lineHeight: 1.6
            }}>
              {tags.map(t => (
                <span key={t} style={{
                  padding: '4px 8px',
                  borderRadius: 16,
                  background: '#007bff',
                  color: '#ffffff',
                  fontSize: 14,
                  cursor: 'pointer',
                  margin: '2px 0', // 위아래 마진 추가하여 겹침 방지
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0, 123, 255, 0.3)',
                  transition: 'transform 0.1s ease'
                }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* COMMENTS COLUMN */}
        <div style={{
          flex: isDesktop ? '0 0 320px' : '1'
        }}>
          <CommentSection reviewId={id} onCommentCountChange={() => { }} />
        </div>
      </div>

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
          💡 <strong>개발 정보:</strong> 영화 ID {movie.movieId}의 상세정보 로드됨.
          장르: {movieDetails.genres?.join(', ') || '정보 없음'},
          런타임: {movieDetails.runtime ? `${movieDetails.runtime}분` : '정보 없음'}
        </div>
      )} */}
    </div>
  );
}