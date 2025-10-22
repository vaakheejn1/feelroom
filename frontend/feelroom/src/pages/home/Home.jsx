// Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewItem from '../../components/review/ReviewItem';
import HomeModal from './HomeModal';
import OnboardingButton from './OnboardingButton';
import { useHomeData } from './useHomeData';
import { useHomeEffects } from './useHomeEffects';
import { HomeHeader } from './HomeHeader';
import HomeHeader2 from './HomeHeader2';
import { HomeContent } from './HomeContent';
import create_button from '../../assets/create_review_button_2.png';
import create_button_2 from '../../assets/create_review_button_3.png';
import BackgroundComponent from '../../BackgroundComponent2.jsx';

export default function Home() {
  const navigate = useNavigate();

  // 상태 관리
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [userNickname, setUserNickname] = useState('');
  const [userProfileImageUrl, setUserProfileImageUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [selectedFeedTypes, setSelectedFeedTypes] = useState(['following', 'popular', 'ai']);
  const [scrollY, setScrollY] = useState(0);

  // 스크롤 이벤트 핸들러 수정
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // console.log('현재 스크롤 위치:', currentScrollY); // 디버깅용
      setScrollY(currentScrollY);
    };

    // 초기 스크롤 위치 설정
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 진입 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  // 헤더 표시 조건 수정 - 더 명확하게
  const showHeader2 = scrollY > 10;

  // console.log('스크롤 상태:', { scrollY, showHeader2 }); // 디버깅용

  // 커스텀 훅 사용
  const {
    getUserInfo,
    getAuthToken,
    checkUnreadNotifications,
    fetchMovieDetails,
    fetchFollowingReviews,
    fetchPopularReviews,
    deduplicateAndSortReviews,
    fetchReviews,
    transformReviewData
  } = useHomeData({
    setHasUnreadNotifications,
    setReviews,
    setError,
    setLoading,
    setLoadingMore,
    setHasMore,
    setPage
  });

  // 이펙트 훅 사용
  useHomeEffects({
    getUserInfo,
    checkUnreadNotifications,
    setUserNickname,
    setUserProfileImageUrl,
    showProfileDropdown,
    setShowProfileDropdown,
    setIsMobile,
    fetchReviews,
    selectedFeedTypes
  });

  // 이벤트 핸들러들
  const handleLogoClick = () => {
    navigate('/home');
  };

  const refresh = () => {
    fetchReviews(selectedFeedTypes, true);
  };

  const handleWriteReview = () => {
    navigate('/movie-selection');
  };

  const handleRecommendReviewClick = () => {
    setShowModal(true);
  };

  const handleModalSelect = useCallback((selections) => {
    // console.log('선택된 추천 타입:', selections);
    setSelectedFeedTypes(selections);
    setReviews([]);
    setShowModal(false);
    setError(null);
    fetchReviews(selections, true);
  }, [fetchReviews]);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleLoadMore = useCallback(() => {
    // console.log('🔄 더보기 버튼 클릭됨, 현재 페이지:', page, 'hasMore:', hasMore);
    if (!loadingMore && hasMore) {
      fetchReviews(selectedFeedTypes, false, page + 1);
    }
  }, [fetchReviews, selectedFeedTypes, page, hasMore, loadingMore]);

  // 디버깅을 위한 콘솔 로그 추가
  // console.log('🔍 Home 컴포넌트 상태:', {
  //   hasMore,
  //   loading,
  //   loadingMore,
  //   reviewsCount: reviews.length,
  //   page,
  //   selectedFeedTypes
  // });

  return (
    <main className="page-home" style={{
      backgroundColor: 'transparent',
      margin: '0',
      padding: '0',
      minHeight: '100vh',
      position: 'relative',
      top: '0',
      left: '0',
      width: '100%',
      maxWidth: '100%', // 최대 너비 제한
      overflowX: 'hidden', // 가로 스크롤 방지
      boxSizing: 'border-box'
    }}>
      <BackgroundComponent />

      {/* HomeHeader는 스크롤 10px 이하일 때만 - 조건부 렌더링 수정 */}
      {!showHeader2 && (
        <HomeHeader
          isMobile={isMobile}
          handleLogoClick={() => navigate('/home')}
          showProfileDropdown={showProfileDropdown}
          setShowProfileDropdown={setShowProfileDropdown}
          navigate={navigate}
          hasUnreadNotifications={hasUnreadNotifications}
          handleNotificationClick={() => navigate('/notifications')}
        />
      )}

      {/* HomeHeader2는 스크롤 10px 이상일 때 표시 - position fixed로 고정 */}
      {showHeader2 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? 0 : '16rem', // 데스크탑에서는 사이드바 너비만큼 오른쪽으로
          right: 0,
          zIndex: 1100 // 사이드바보다 위에
        }}>
          <HomeHeader2
            isMobile={isMobile}
            hasUnreadNotifications={hasUnreadNotifications}
            scrollY={scrollY}
          />
        </div>
      )}

      {/* HomeContent에 paddingTop 추가하여 고정 헤더와 겹치지 않게 */}
      <div style={{
        paddingTop: showHeader2 ? '4rem' : '0', // HomeHeader2가 보일 때 padding 추가
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <HomeContent
          isMobile={isMobile}
          handleRecommendReviewClick={() => setShowModal(true)}
          reviews={reviews}
          userNickname={userNickname}
          userProfileImageUrl={userProfileImageUrl}
          transformReviewData={transformReviewData}
          navigate={navigate}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          selectedFeedTypes={selectedFeedTypes}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>

      <HomeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleModalSelect}
      />

      {/* 플로팅 버튼 - 모달이 열려있을 때 숨김 */}
      {!showModal && (
        <img
          src={isMobile ? create_button_2 : create_button}
          alt="리뷰 작성하기"
          onClick={handleWriteReview}
          style={{
            position: 'fixed',
            bottom: isMobile ? '60px' : '10px',
            right: isMobile ? '-10px' : '10px',
            padding: '10px 15px',
            color: 'white',
            width: isMobile ? '130px' : '180px',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 3vw, 14px)',
            zIndex: 1200,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        />
      )}

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: scaleX(0);
          }
          50% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0);
          }
        }

        /* 모바일에서 플로팅 버튼 위치 조정 */
        @media (max-width: 768px) {
          button[style*="position: fixed"] {
            bottom: 75px !important;
            padding: 6px 14px !important;
            margin-right: -8px; 
          }
        }

        /* 가로 스크롤바 완전 제거 */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden !important;
        }
      `}</style>
    </main >
  );
}