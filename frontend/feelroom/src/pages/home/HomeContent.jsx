// HomeContent.jsx
import React, { useEffect, useRef } from 'react';
import ReviewItem from '../../components/review/ReviewItem';
import { Filter, Users, TrendingUp, Bot } from 'lucide-react';
import BackgroundComponent from '../../BackgroundComponent.jsx';
import list_title from '../../assets/home_feed.png';
import filter_feed from '../../assets/feed_filter_3.png';
import filter_feed_mobile from '../../assets/feed_filter_2.png';

export const HomeContent = ({
    isMobile,
    handleRecommendReviewClick,
    reviews,
    userNickname,
    userProfileImageUrl,
    transformReviewData,
    navigate,
    loading,
    loadingMore,
    error,
    selectedFeedTypes,
    hasMore,
    onLoadMore
}) => {
    const containerRef = useRef(null);
    const isLoadingRef = useRef(false); // 중복 호출 방지

    // 스크롤 이벤트 처리
    const handleScroll = () => {
        if (!containerRef.current || isLoadingRef.current || loadingMore || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

        if (scrollHeight - scrollTop <= clientHeight + 100) {
            isLoadingRef.current = true;
            onLoadMore();

            setTimeout(() => {
                isLoadingRef.current = false;
            }, 2000);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore, loadingMore]);

    useEffect(() => {
        if (!loadingMore) isLoadingRef.current = false;
    }, [loadingMore]);

    const getFeedTypeInfo = (feedType) => {
        switch (feedType) {
            case 'following':
                return { text: '팔로잉', color: '#3b82f6', icon: <Users size={16} /> };
            case 'popular':
                return { text: '인기', color: '#ef4444', icon: <TrendingUp size={16} /> };
            case 'ai':
                return { text: 'AI추천', color: '#8b5cf6', icon: <Bot size={16} /> };
            default:
                return { text: '리뷰', color: '#666', icon: null };
        }
    };

    const LoadingSpinner = () => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#666', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                더 많은 리뷰를 불러오는 중...
            </p>
        </div>
    );

    return (
        <div ref={containerRef} style={{ maxWidth: '980px', width: '100%', margin: '0 auto', position: 'relative' }}>
            {/* 추천 리뷰 섹션 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '940px',
                justifyContent: 'space-between',
                padding: '1rem 0',
                marginBottom: '0.1rem',
                backgroundColor: 'transparent',
                top: '0',
                zIndex: 10,
                paddingLeft: isMobile ? '2rem' : '1.5rem',
                paddingBottom: isMobile ? '0.5rem' : '1rem',
                paddingRight: isMobile ? '1rem' : '0',
                position: 'relative' // 필터 이미지 절대 위치 기준
            }}>
                {/* 왼쪽 텍스트 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.3rem' : '0.5rem', flex: 1 }}>
                    <img src={list_title} alt="추천 리뷰" style={{ height: isMobile ? '1.5rem' : '1.8rem', margin: 0, padding: 0, display: 'block' }} />
                </div>

                {/* 오른쪽 필터 이미지 (절대 위치) */}
                <div
                    onClick={handleRecommendReviewClick}
                    style={{
                        position: isMobile ? 'absolute' : 'relative',
                        right: isMobile ? '2rem' : '0',
                        top: isMobile ? '50%' : 'auto',
                        transform: isMobile ? 'translateY(-50%)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: isMobile ? '4px' : '6px',
                        borderRadius: '8px',
                        marginTop: '4px',
                        marginBottom: isMobile ? '-8px' : '-16px',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        zIndex: 100,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = isMobile ? 'translateY(-50%) scale(1.05)' : 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = isMobile ? 'translateY(-50%) scale(1)' : 'scale(1)'; }}
                >
                    <img
                        src={isMobile ? filter_feed_mobile : filter_feed}
                        alt={isMobile ? '필터 설정(모바일)' : '필터 설정(데스크탑)'}
                        style={{ height: isMobile ? '20px' : '28px', width: 'auto', display: 'block', marginBottom: isMobile ? '-4px' : '0px' }}
                    />
                </div>
            </div>

            {/* 리뷰 리스트 */}
            {reviews.map((review, index) => {
                const globalUserInfo = { userNickname, userProfileImageUrl };
                const transformedReview = transformReviewData(review, globalUserInfo);
                const reviewId = review.reviewId || review.id || index;
                const feedTypeInfo = getFeedTypeInfo(review.feedType);

                return (
                    <div key={`${reviewId}-${index}`} style={{ marginBottom: isMobile ? '1rem' : '3rem' }}>
                        <ReviewItem
                            movie={transformedReview.movie}
                            user={transformedReview.user}
                            userRating={transformedReview.userRating}
                            title={transformedReview.title}
                            content={transformedReview.content}
                            likeCount={transformedReview.likeCount}
                            commentCount={transformedReview.commentCount}
                            createdAt={transformedReview.createdAt}
                            tags={review.tags || []}
                            onClick={() => navigate(`/review/${reviewId}`)}
                            isMobile={isMobile}
                            topRightIcon={feedTypeInfo.icon}
                            topRightText={feedTypeInfo.text}
                            topRightColor={feedTypeInfo.color}
                        />
                    </div>
                );
            })}

            {/* 로딩 및 상태 표시 */}
            {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>리뷰를 불러오는 중...</div>}
            {loadingMore && <LoadingSpinner />}
            {!loading && !loadingMore && reviews.length > 0 && !hasMore &&
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '16px 24px', backgroundColor: '#f8f9fa', color: '#666', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: '1px solid #e9ecef' }}>
                        모든 조회가 끝났습니다
                    </div>
                </div>
            }
            {error && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#ff6b6b', backgroundColor: '#fff5f5', margin: '1rem 0', borderRadius: '8px', border: '1px solid #ffebee' }}>❌ {error}</div>}
            {reviews.length === 0 && !loading && !error && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>데이터가 더 이상 존재하지 않습니다.</div>}

            <style>
                {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
        </div>
    );
};
