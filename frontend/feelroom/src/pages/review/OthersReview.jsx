import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ReviewItem_inProfile from '../../components/review/ReviewItem_inProfile';
import subtitle from '../../assets/title_others_review.png'


const OthersReview = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // URL 파라미터에서 userId 가져오기
    const location = useLocation(); // location state에서 사용자 정보 가져오기

    const [reviews, setReviews] = useState([]);
    const [userNickname, setUserNickname] = useState('');
    const [userProfileImageUrl, setUserProfileImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // 기본 프로필 이미지 SVG
    const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMzAgMzJjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTIiIGZpbGw9IiM2Yzc1N2QiLz48L3N2Zz4=';

    // 모바일 감지를 위한 리사이즈 핸들러
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (userId) {
            // location state에서 사용자 정보 먼저 설정
            if (location.state?.userNickname) {
                setUserNickname(location.state.userNickname);
            }
            if (location.state?.userProfileImageUrl) {
                setUserProfileImageUrl(location.state.userProfileImageUrl);
            }

            fetchReviews();
        }
    }, [userId, location.state]);

    const fetchReviews = async () => {
        setIsLoading(true);
        setError('');

        try {
            // 로컬스토리지에서 토큰 가져오기
            const token = localStorage.getItem('authToken');

            if (!token) {
                throw new Error('인증 토큰을 찾을 수 없습니다.');
            }

            if (!userId) {
                throw new Error('유저 ID를 찾을 수 없습니다.');
            }

            // URL 파라미터의 userId 사용
            const response = await fetch(`https://i13d208.p.ssafy.io/api/v1/users/${userId}/reviews`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 리뷰 목록을 가져오는데 실패했습니다.`);
            }

            const data = await response.json();
            // console.log('API 응답:', data);

            // location state가 있으면 우선 사용, 없으면 API 응답 사용
            setUserNickname(location.state?.userNickname || data.userNickname || '');
            setUserProfileImageUrl(location.state?.userProfileImageUrl || data.userProfileImageUrl || '');
            setReviews(data.reviews || []);

        } catch (err) {
            console.error('리뷰 목록 가져오기 오류:', err);
            setError(err.message || '리뷰 목록을 가져오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

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

    const formatDate = (dateString) => {
        const now = new Date();
        const reviewDate = new Date(dateString);
        const diffTime = Math.abs(now - reviewDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes}분 전`;
        } else if (diffHours < 24) {
            return `${diffHours}시간 전`;
        } else {
            return `${diffDays}일 전`;
        }
    };

    const handleCreateReview = () => {
        navigate('/movie-selection');
    };

    if (isLoading) {
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

    if (error) {
        return (
            <div style={{
                padding: '1rem',
                textAlign: 'center',
                marginTop: '2rem',
                color: '#ef4444'
            }}>
                <p>오류: {error}</p>
                <button
                    onClick={fetchReviews}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div style={{
            padding: isMobile ? '0.5rem' : '1rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    fontSize: '16px',
                    marginBottom: '1rem',
                    cursor: 'pointer'
                }}
            >
                ← 뒤로가기
            </button>

            {/* 한 줄: 이미지 + 닉네임 + 서브타이틀 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '0.5rem',
                marginLeft: isMobile ? '1rem' : '0rem'
            }}>
                <img
                    src={userProfileImageUrl || defaultProfileImage}
                    alt={userNickname || '사용자'}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultProfileImage;
                    }}
                    style={{
                        width: isMobile ? '28px' : '32px',
                        height: isMobile ? '28px' : '32px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '1px solid #6b6b6bff',
                        flexShrink: 0
                    }}
                />
                <div style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: '600',
                    color: '#007bff'
                }}>
                    {userNickname || '사용자'}
                </div>
                <img
                    src={subtitle}
                    alt="others review subtitle"
                    style={{
                        height: isMobile ? '18px' : '24px',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* 총 개수 */}
            <div style={{
                marginBottom: '1.5rem',
                textAlign: 'right',
                marginRight: isMobile ? '0.8rem' : '0rem',
                marginTop: '-0.6rem'
            }}>
                <span style={{
                    fontSize: isMobile ? '0.7rem' : '0.9rem',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '0.25rem 0.45rem',
                    borderRadius: '12px'
                }}>
                    총 {reviews.length}개
                </span>
            </div>

            {/* 리뷰 목록 - 그리드 형식 */}
            {reviews.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: '#6b7280'
                }}>
                    <p>작성된 리뷰가 없습니다.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? 'repeat(2, 1fr)'
                        : 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: isMobile ? '16px' : '24px',
                    justifyItems: 'center'
                }}>
                    {reviews.map((review, index) => {
                        const transformedReview = transformReviewData(review, userNickname, userProfileImageUrl);
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
            )}
        </div>
    );
};

export default OthersReview;