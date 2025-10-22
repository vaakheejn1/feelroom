import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ReviewItem_inProfile from '../../components/review/ReviewItem_inProfile';
import title_myReview from '../../assets/title_myReview.png';

const MyReview = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // 더미 데이터
    const dummyReview = {
        reviewId: 'dummy-1',
        title: '정말 감동적인 영화였습니다',
        rating: 8.5,
        likesCount: 12,
        commentsCount: 5,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
        movie: {
            title: '기생충',
            releaseYear: '2019',
            posterUrl: 'https://img.cgv.co.kr/Movie/Thumbnail/Poster/000079/79416_320.jpg'
        },
        userNickname: '영화광',
        userProfileImageUrl: 'https://via.placeholder.com/40x40/4299E1/FFFFFF?text=U'
    };

    // 모바일 감지를 위한 리사이즈 핸들러
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 토큰 가져오기 함수
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.warn('⚠️ authToken이 없습니다.');
            return null;
        }
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    };

    // 내 리뷰 목록 가져오기
    const fetchMyReviews = async (pageNum = 0, isRefresh = false) => {
        try {
            // console.log(`📖 내 리뷰 목록 조회 - 페이지: ${pageNum}`);

            setLoading(true);
            if (isRefresh) {
                setError(null);
            }

            const authToken = getAuthToken();
            if (!authToken) {
                // 토큰이 없을 때 더미 데이터 사용
                // console.log('🎭 토큰이 없어 더미 데이터를 사용합니다.');
                setTimeout(() => {
                    setReviews([dummyReview]);
                    setHasMore(false);
                    setPage(0);
                    setLoading(false);
                }, 500); // 로딩 시뮬레이션
                return;
            }

            const headers = {
                'Authorization': authToken,
                'Content-Type': 'application/json'
            };

            // 페이지네이션 파라미터 추가
            const url = `https://i13d208.p.ssafy.io/api/v1/users/me/reviews?page=${pageNum}&size=20`;

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            // console.log('📡 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API 에러 응답:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}: 리뷰를 불러올 수 없습니다.`);
            }

            const data = await response.json();
            // console.log('✅ 내 리뷰 목록 조회 성공:', data);

            // API 응답 구조에 따라 데이터 추출
            const reviewList = data.reviews || data.content || data || [];
            const userNickname = data.userNickname;
            const userProfileImageUrl = data.userProfileImageUrl;
            const isLastPage = data.last !== undefined ? data.last : (reviewList.length < 20);

            if (isRefresh || pageNum === 0) {
                // 새로고침이거나 첫 페이지인 경우 기존 데이터 교체
                setReviews(reviewList.map(review => ({ ...review, userNickname, userProfileImageUrl })));
                setPage(0);
            } else {
                // 추가 로드인 경우 기존 데이터에 추가
                setReviews(prev => [...prev, ...reviewList.map(review => ({ ...review, userNickname, userProfileImageUrl }))]);
            }

            setHasMore(!isLastPage);
            setPage(pageNum);

        } catch (err) {
            console.error('❌ 내 리뷰 목록 조회 실패:', err);
            // 에러 발생 시에도 더미 데이터 표시
            if (pageNum === 0) {
                // console.log('🎭 API 에러로 인해 더미 데이터를 사용합니다.');
                setReviews([dummyReview]);
                setHasMore(false);
            }
            setError(err.message || '리뷰를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 새로고침
    const refresh = () => {
        fetchMyReviews(0, true);
    };

    // 더 보기
    const loadMore = () => {
        if (!loading && hasMore) {
            fetchMyReviews(page + 1, false);
        }
    };

    // 컴포넌트 마운트 시 첫 페이지 로드
    useEffect(() => {
        fetchMyReviews(0, true);
    }, []);

    // API 데이터를 ReviewItem_inProfile props에 맞게 변환 (수정된 부분)
    const transformReviewData = (review, userNickname, userProfileImageUrl) => ({
        id: review.reviewId || review.id,
        movieImage: review.movie?.posterUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==',
        movieTitle: review.movie?.title || '제목 없음',
        releaseYear: review.movie?.releaseYear || (review.movie?.releaseDate ? new Date(review.movie.releaseDate).getFullYear().toString() : '알 수 없음'),
        reviewTitle: review.title || '', // 리뷰 제목
        userImage: userProfileImageUrl || review.author?.profileImageUrl || review.user?.profileImageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VPC90ZXh0Pjwvc3ZnPg==',
        userName: userNickname || review.author?.nickname || review.user?.nickname || '익명',
        postDate: formatTimeAgo(review.createdAt || new Date().toISOString()),
        // API에서 받은 실제 데이터 사용
        userRating: review.rating || 0, // API의 rating 필드 사용
        likeCount: review.likesCount || 0, // API의 likesCount 필드 사용
        commentCount: review.commentsCount || 0 // API의 commentsCount 필드 사용
    });

    // 시간 포맷 함수
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return '방금 전';
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}분 전`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        } else if (diffInSeconds < 2592000) {
            return `${Math.floor(diffInSeconds / 86400)}일 전`;
        } else if (diffInSeconds < 31536000) {
            return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
        } else {
            return `${Math.floor(diffInSeconds / 31536000)}년 전`;
        }
    };

    const handleCreateReview = () => {
        navigate('/movie-selection');
    };

    // 로딩 상태 (첫 로드)
    if (loading && reviews.length === 0) {
        return (
            <div style={{ padding: '1rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    fontSize: '1.1rem'
                }}>
                    리뷰를 불러오는 중...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: isMobile ? '0.5rem' : '1rem',
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: isMobile ? '-1rem' : '1rem'
        }}>
            {/* 제목과 작성하기 버튼 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',  // 추가: 세로 방향으로 변경
                gap: '1rem',              // 추가: 간격 추가
                margin: '2rem 0 0.5rem',
                padding: isMobile ? '0 0.5rem' : '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                        src={title_myReview}
                        alt="작성한 리뷰"
                        style={{
                            height: isMobile ? '24px' : '30px',
                            marginBottom: isMobile ? '-6px' : '-6px',
                            marginLeft: isMobile ? '6px' : '6px',
                            width: 'auto'
                        }}
                    />
                    <span style={{
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        marginLeft: isMobile ? '-6px' : '-4px',
                        marginTop: isMobile ? '6px' : '-4px',
                    }}>
                        총 {reviews.length}개
                    </span>
                </div>

                {/* 작성하기 버튼을 별도 div로 분리 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',  // 오른쪽 정렬 유지
                    paddingRight: isMobile ? '0.8rem' : '0',
                    marginBottom: isMobile ? '-1.5rem' : '0'
                }}>
                    <button
                        onClick={handleCreateReview}
                        style={{
                            // 기존 스타일 그대로, marginRight만 제거
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: isMobile ? '0.4rem 0.6rem' : '0.5rem 0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        리뷰 작성하기
                    </button>
                </div>
            </div>

            {/* 리뷰 목록 - 그리드 형식 */}
            <div style={{
                marginTop: '2rem',
                padding: isMobile ? '0 0.5rem' : '0',
                display: 'grid',
                gridTemplateColumns: isMobile
                    ? 'repeat(2, 1fr)'
                    : 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: isMobile ? '16px' : '24px',
                justifyItems: 'center'
            }}>
                {reviews.map((review, index) => {
                    const transformedReview = transformReviewData(review, review.userNickname, review.userProfileImageUrl);
                    return (
                        <ReviewItem_inProfile
                            key={`${transformedReview.id}-${index}`}
                            movieImage={transformedReview.movieImage}
                            movieTitle={transformedReview.movieTitle}
                            releaseYear={transformedReview.releaseYear}
                            reviewTitle={transformedReview.reviewTitle}
                            userImage={transformedReview.userImage}
                            userName={transformedReview.userName}
                            postDate={transformedReview.postDate}
                            onClick={() => navigate(`/review/${transformedReview.id}`)}
                            isMobile={isMobile}
                            userRating={transformedReview.userRating}
                            likeCount={transformedReview.likeCount}
                            commentCount={transformedReview.commentCount}
                        />
                    );
                })}
            </div>

            {/* 로딩 상태 (더 로드할 때) */}
            {loading && reviews.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div>더 많은 리뷰를 불러오는 중...</div>
                </div>
            )}

            {/* 더 보기 버튼 */}
            {hasMore && !loading && reviews.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <button
                        onClick={loadMore}
                        style={{
                            padding: '1rem 2rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        더 보기
                    </button>
                </div>
            )}
            {/* CSS 애니메이션 */}
            <style jsx>{`
       

        /* 가로 스크롤바 완전 제거 */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden !important;
        }
      `}</style>

            {/* 모든 데이터 로드 완료 */}
            {!hasMore && reviews.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2rem',
                    color: '#6b7280'
                }}>
                    모든 리뷰를 확인했습니다.
                </div>
            )}

            {/* 에러 표시 (데이터가 있을 때) */}
            {error && reviews.length > 0 && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    margin: '1rem 0',
                    color: '#856404'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* 개발자 정보 */}
            {/* <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#666',
                margin: isMobile ? '2rem 0.5rem 1rem' : '2rem 0 1rem'
            }}>
                💡 <strong>개발 정보:</strong>
                총 리뷰 수: {reviews.length}개,
                현재 페이지: {page},
                더 보기 가능: {hasMore ? 'Yes' : 'No'},
                로딩 상태: {loading ? 'Loading' : 'Complete'},
                모바일 모드: {isMobile ? 'Yes' : 'No'},
                {!getAuthToken() && (
                    <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        더미 데이터 모드 활성화
                    </span>
                )}
            </div> */}
        </div>
    );
};

export default MyReview;