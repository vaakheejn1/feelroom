import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronDown } from 'lucide-react';

const ReviewItemInMovie = ({ review, onClick }) => (
    <div
        onClick={() => onClick(review)}
        style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
            backgroundColor: 'white'
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* 프로필 이미지, 닉네임, 날짜 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                        src={review.author.profileImageUrl}
                        alt={review.author.nickname}
                        style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                            flexShrink: 0
                        }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                        {review.author.nickname}
                    </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {new Date(review.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })}
                </span>
            </div>

            {/* 리뷰 제목 */}
            <h3 style={{
                margin: 0,
                fontWeight: '500',
                color: '#111827',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                paddingLeft: '0.25rem'
            }}>
                {review.title}
            </h3>

            {/* 평점 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                paddingLeft: '0.25rem'
            }}>
                {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    const rating = review.rating / 2;
                    let fill = 'none';
                    if (rating >= starValue) {
                        fill = '#fbbf24';
                    } else if (rating >= starValue - 0.5) {
                        fill = 'url(#halfStar)';
                    }

                    return (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={fill} stroke="#fbbf24" strokeWidth="2">
                            <defs>
                                <linearGradient id="halfStar">
                                    <stop offset="50%" stopColor="#fbbf24" />
                                    <stop offset="50%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                    );
                })}
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{review.rating}/10</span>
            </div>

            {/* 좋아요수와 댓글수 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.75rem',
                color: '#9ca3af',
                paddingLeft: '0.25rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Heart size={12} fill="none" stroke="currentColor" />
                    <span>{review.likeCount}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{review.commentCount}</span>
                </div>
            </div>
        </div>
    </div>
);

const MovieReviewsSection = ({ movieId, movieData }) => {
    const navigate = useNavigate();
    const [reviewSortType, setReviewSortType] = useState('likes');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

    useEffect(() => {
        const onResize = () => {
            setIsMobile(window.innerWidth < 1200);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
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

    // 정렬 옵션에 따른 sortBy 매개변수 매핑
    const getSortByParam = (sortType) => {
        switch (sortType) {
            case 'latest':
                return 'latest';
            case 'likes':
                return 'likes';
            case 'comments':
                return 'comments';
            default:
                return 'likes';
        }
    };

    // 리뷰 데이터 가져오기
    useEffect(() => {
        const fetchReviews = async () => {
            if (!movieId) return;

            setReviewsLoading(true);
            try {
                const authToken = getAuthToken();
                if (!authToken) {
                    console.warn('⚠️ authToken이 없어서 리뷰를 가져올 수 없습니다.');
                    return;
                }

                const sortBy = getSortByParam(reviewSortType);
                const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/${movieId}/reviews?sortBy=${sortBy}&page=0&size=10`, {
                    method: 'GET',
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 리뷰 목록 API 응답 상태:', response.status, '정렬:', sortBy);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ 리뷰 목록 조회 성공:', data);

                    // 각 리뷰의 상세 정보를 가져오기
                    const reviewsWithDetails = await Promise.all(
                        data.reviews.map(async (review) => {
                            try {
                                const detailResponse = await fetch(`https://i13d208.p.ssafy.io/api/v1/reviews/${review.reviewId}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': authToken,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                if (detailResponse.ok) {
                                    const detailData = await detailResponse.json();
                                    console.log(`✅ 리뷰 ${review.reviewId} 상세 정보 조회 성공:`, detailData);
                                    return detailData;
                                } else {
                                    console.warn(`⚠️ 리뷰 ${review.reviewId} 상세 정보 조회 실패: ${detailResponse.status}`);
                                }
                                return null;
                            } catch (error) {
                                console.error(`❌ 리뷰 ${review.reviewId} 상세 정보 로드 에러:`, error);
                                return null;
                            }
                        })
                    );

                    // null 값 필터링
                    const validReviews = reviewsWithDetails.filter(review => review !== null);
                    setReviews(validReviews);
                    setReviewStats(data.reviewStats);
                } else if (response.status === 401) {
                    console.warn('⚠️ 리뷰 목록 조회 인증 실패:', response.status);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('❌ 리뷰 정보 조회 실패:', errorData);
                }
            } catch (err) {
                console.error('❌ 리뷰 정보 로드 에러:', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [movieId, reviewSortType]);

    // 리뷰 작성 버튼 클릭
    const handleCreateReview = () => {
        if (!movieData) {
            alert('영화 정보가 로드되지 않았습니다.');
            return;
        }

        console.log('📝 리뷰 작성 버튼 클릭 - 영화 정보:', movieData);

        // ReviewCreate 컴포넌트에서 요구하는 형식으로 영화 데이터 구성
        const movieForReview = {
            id: parseInt(movieId),
            movieTitle: movieData.title,
            title: movieData.title,
            movieImage: movieData.posterUrl,
            releaseDate: movieData.releaseDate,
            genres: movieData.genres || [],
            runtime: movieData.runtime || 0
        };

        // 영화 정보를 state로 전달하여 /review-create로 이동
        navigate('/review-create', {
            state: {
                movie: movieForReview
            }
        });
    };

    const handleReviewClick = (review) => {
        navigate(`/review/${review.reviewId}`);
    };

    // 정렬 옵션 변경 핸들러
    const handleSortChange = (sortType) => {
        console.log('📊 정렬 옵션 변경:', sortType);
        setReviewSortType(sortType);
        setShowSortDropdown(false);
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                    fontWeight: 'bold',
                    marginLeft: isMobile ? '0.2rem' : '0rem',
                    marginBottom: isMobile ? '-0.4rem' : '0rem'
                }}>
                    이 영화의 리뷰 ({reviewStats.totalReviews})
                </h2>

                {/* 정렬 드롭다운과 리뷰 작성 버튼 */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* 정렬 드롭다운 */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #d1d5db',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.775rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {reviewSortType === 'latest' && '최신순'}
                            {reviewSortType === 'likes' && '좋아요순'}
                            {reviewSortType === 'comments' && '댓글수순'}
                            <ChevronDown size={16} style={{
                                transform: showSortDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }} />
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {showSortDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '0.25rem',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                minWidth: '120px'
                            }}>
                                <button
                                    onClick={() => handleSortChange('likes')}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        border: 'none',
                                        backgroundColor: reviewSortType === 'likes' ? '#f3f4f6' : 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    좋아요순
                                </button>
                                <button
                                    onClick={() => handleSortChange('latest')}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        border: 'none',
                                        backgroundColor: reviewSortType === 'latest' ? '#f3f4f6' : 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    최신순
                                </button>
                                <button
                                    onClick={() => handleSortChange('comments')}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        border: 'none',
                                        backgroundColor: reviewSortType === 'comments' ? '#f3f4f6' : 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        borderRadius: '0 0 6px 6px'
                                    }}
                                >
                                    댓글수순
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 리뷰 작성 버튼 */}
                    <button
                        onClick={handleCreateReview}
                        style={{
                            padding: '0.5rem 0.5rem',
                            border: '1px solid #10b981',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.775rem',
                            fontWeight: '500',
                        }}
                    >
                        리뷰 작성하기
                    </button>
                </div>
            </div>

            {/* 리뷰 리스트 */}
            <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                {reviewsLoading ? (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        리뷰를 불러오는 중...
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        아직 작성된 리뷰가 없습니다.
                    </div>
                ) : (
                    reviews.map(review => (
                        <ReviewItemInMovie
                            key={review.reviewId}
                            review={review}
                            onClick={handleReviewClick}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MovieReviewsSection;