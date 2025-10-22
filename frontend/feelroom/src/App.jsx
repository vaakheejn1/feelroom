// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Sidebar2 from './components/Sidebar2';
import BottomNav from './components/BottomNav';
import AI_Modal from './components/AI_Modal';

// 기존 페이지
import Home from './pages/home/Home';
import Search from './pages/search/Search';
import BoxOffice from './pages/movie/BoxOffice';
import Profile from './pages/profile/Profile';
import Login from './pages/auth/login/Login';
import SignUp from './pages/auth/signup/SignUp';

// 새로 추가된 페이지들
import MovieSelection from './pages/review/MovieSelection';
import ReviewCreate from './pages/review/post/ReviewCreate';
import ReviewEdit from './pages/review/post/ReviewEdit';
import ReviewDetail from './pages/review/ReviewDetail';
import LikedReview from './pages/review/LikedReview';
import FriendList from './pages/profile/FriendList';
import UserActivity from './pages/settings/UserActivity';
import EditProfile from './pages/profile/EditProfile';
import FindID from './pages/auth/settings/FindID';
import FindAccount from './pages/auth/settings/FindAccount';
import ResetPassword from './pages/auth/settings/ResetPassword';
import Onboarding from './pages/home/Onboarding';
import Notifications from './pages/home/Notifications';
import WrittenReviews from './pages/review/WrittenReviews';
import Unregister from './pages/settings/Unregister';
import MyPickMovie from './pages/movie/MyPickMovie';
import MyReview from './pages/review/MyReview';
import Settings from './pages/settings/Settings';
import AccountSettings from './pages/settings/AccountSettings';
import ChangePassword from './pages/auth/settings/ChangePassword';
import MovieDetail from './pages/movie/MovieDetail';
import OthersProfile from './pages/profile/OthersProfile';
import OthersReview from './pages/review/OthersReview';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Home에서만 사용
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 페이지가 Home인지 확인
  const isHomePage = location.pathname === '/home';

  // 로그인·회원가입 페이지 여부 판단
  const isAuthRoute = location.pathname === '/' ||
    location.pathname === '/signup' ||
    location.pathname === '/find-account' ||
    location.pathname === '/find-id' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/onboarding';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Home에서만 스크롤 감지 (window 스크롤 사용 - Home.jsx와 동일)
  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    handleScroll(); // 초기값 설정
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // AI 모달 열기/닫기 함수
  const handleAIModalOpen = () => setIsAIModalOpen(true);
  const handleAIModalClose = () => setIsAIModalOpen(false);

  // 하단/사이드바에서 active 탭 표시용
  const getActiveTab = () => {
    switch (location.pathname) {
      case '/home': return '홈';
      case '/search': return '검색';
      case '/boxOffice': return '현재 상영작';
      case '/profile': return '프로필';
      case '/movie-selection': return '글쓰기';
      case '/liked-review': return '좋아요';
      case '/myPickMovie': return '좋아요한 영화';
      case '/friends': return '친구';
      case '/user-activity': return '내활동';
      default: return '';
    }
  };
  const activeTab = getActiveTab();

  const handleTabClick = (tabRoute) => {
    // AI 추천 버튼인 경우 모달 열기
    if (tabRoute === 'ai-recommendation') {
      handleAIModalOpen();
      return;
    }
    navigate(tabRoute);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
        width: '100%',
        maxWidth: '100vw'
      }}>
        {/* 데스크탑 사이드바 - Home에서만 스크롤에 따라 변경 */}
        {!isAuthRoute && !isMobile && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '16rem',
            height: '100vh',
            zIndex: 1000,
            transition: 'all 0.3s ease-in-out'
          }}>
            {isHomePage && isScrolled ? (
              <Sidebar2 activeTab={activeTab} onTabClick={handleTabClick} />
            ) : (
              <Sidebar activeTab={activeTab} onTabClick={handleTabClick} />
            )}
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <main
          id="main-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100%',
            minHeight: '100vh',
            marginLeft: !isAuthRoute && !isMobile ? '16rem' : '0',
            paddingBottom: !isAuthRoute && isMobile ? '4rem' : 0,
          }}
        >
          <Routes>
            {/* 인증 */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/find-account" element={<FindAccount />} />
            <Route path="/find-id" element={<FindID />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            {/* 온보딩 */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* 기본 기능 */}
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/boxOffice" element={<BoxOffice />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/others-profile" element={<OthersProfile />} />
            <Route path="/editProfile" element={<EditProfile />} />

            {/* 다른 사용자 프로필 - ReviewDetail에서 사용하는 경로 */}
            <Route path="/profile/:userId" element={<OthersProfile />} />

            {/* 리뷰 작성 흐름 */}
            <Route path="/movie-selection" element={<MovieSelection />} />
            <Route path="/review-create" element={<ReviewCreate />} />
            <Route path="/review/:id/edit" element={<ReviewEdit />} />

            {/* 리뷰 상세 */}
            <Route path="/review/:id" element={<ReviewDetail />} />

            {/* 내 활동 */}
            <Route path="/liked-review" element={<LikedReview />} />
            <Route path="/friends" element={<FriendList />} />
            <Route path="/user-activity" element={<UserActivity />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/written-reviews" element={<WrittenReviews />} />
            <Route path="/myPickMovie" element={<MyPickMovie />} />
            <Route path="/myReview" element={<MyReview />} />

            {/* 다른 사용자의 리뷰 리스트 */}
            <Route path="/others-review" element={<OthersReview />} />
            <Route path="/users/:userId/reviews" element={<OthersReview />} />

            {/* 팔로워/팔로잉 목록 */}
            <Route path="/users/:userId/followers" element={<FriendList />} />
            <Route path="/users/:userId/following" element={<FriendList />} />

            {/* 탈퇴 */}
            <Route path="/unregister" element={<Unregister />} />
            {/* 내 설정 */}
            <Route path="/profile/settings" element={<Settings />} />
            <Route path="/account-settings" element={<AccountSettings />} />

            {/* 영화 상세 페이지 */}
            <Route path="/movieDetail/:movieId" element={<MovieDetail />} />
          </Routes>
        </main>
      </div>

      {/* 모바일 하단 네비 */}
      {!isAuthRoute && isMobile && (
        <BottomNav
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onAIClick={handleAIModalOpen}
        />
      )}

      {/* AI 추천 모달 */}
      <AI_Modal
        isOpen={isAIModalOpen}
        onClose={handleAIModalClose}
        onMovieClick={(movieId) => {
          setIsAIModalOpen(false);
          navigate(`/movieDetail/${movieId}`);
        }}
      />
    </div>
  );
}

export default App;