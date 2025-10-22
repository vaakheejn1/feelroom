import { Settings, Plus, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo3.png';
import notificationIcon from '../assets/notification_on.png';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isNarrow, setIsNarrow] = useState(false);

  // 창 크기 모니터링
  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 768); // 768px 미만일 때 좁은 화면으로 간주
    };

    handleResize(); // 초기값 설정
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const getHeaderIcons = () => {
    switch (currentPath) {
      case '/home':
        return (
          <>
            <Plus
              style={{ width: '24px', height: '24px', color: '#6b7280', cursor: 'pointer' }}
              onClick={() => navigate('/movie-selection')}
            />
            <img
              src={notificationIcon}
              alt="Notifications"
              onClick={handleNotificationClick}
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <Settings
              style={{ width: '24px', height: '24px', color: '#6b7280', cursor: 'pointer' }}
              onClick={() => navigate('/profile/settings')}
            />
          </>
        );

      case '/search':
        return (
          <Settings
            style={{ width: '24px', height: '24px', color: '#6b7280', cursor: 'pointer' }}
            onClick={() => navigate('/profile/settings')}
          />
        );

      case '/boxOffice':
        return (
          <img
            src={notificationIcon}
            alt="Notifications"
            onClick={handleNotificationClick}
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          />
        );

      case '/notifications':
        return (
          <Settings
            style={{ width: '24px', height: '24px', color: '#6b7280', cursor: 'pointer' }}
            onClick={() => navigate('/profile/settings')}
          />
        );

      case '/profile':
        return (
          <>
            <img
              src={notificationIcon}
              alt="Notifications"
              onClick={handleNotificationClick}
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <Settings
              style={{ width: '24px', height: '24px', color: '#6b7280', cursor: 'pointer' }}
              onClick={() => navigate('/profile/settings')}
            />
          </>
        );

      default:
        return (
          <>
            <img
              src={notificationIcon}
              alt="Notifications"
              onClick={handleNotificationClick}
              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            />
            <Settings
              style={{ width: '24px', height: '24px', color: '#6b7280', cursor: 'pointer' }}
              onClick={() => navigate('/profile/settings')}
            />
          </>
        );
    }
  };

  // 검색바를 숨겨야 하는 페이지들
  const shouldHideSearchBar = currentPath === '/search' || currentPath === '/profile';

  return (
    <header
      style={{
        backgroundColor: '#ffffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1rem',
      }}
    >
      <img
        src={logo}
        alt="FeelRoom Logo"
        onClick={handleLogoClick}
        style={{
          height: '3rem',
          objectFit: 'contain',
          cursor: 'pointer',
          transition: 'opacity 0.2s ease',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)' // ✅ 로고를 정확히 중앙에 고정
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '1';
        }}
        onLoad={(e) => {
          // console.log('✅ Logo loaded successfully from src/assets/logo1.png');
        }}
        onError={(e) => {
          console.error('❌ Failed to load logo from src/assets/logo1.png');
          // console.log('Import path:', logo);
          e.target.style.display = 'none';
          const fallbackText = document.createElement('span');
          fallbackText.textContent = 'FeelRoom';
          fallbackText.style.fontSize = '1.5rem';
          fallbackText.style.fontWeight = 'bold';
          fallbackText.style.color = '#111827';
          fallbackText.style.cursor = 'pointer';
          fallbackText.onclick = handleLogoClick;
          e.target.parentNode.appendChild(fallbackText);
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {/* 검색탭과 프로필탭에서는 검색바 숨김 */}
        {!shouldHideSearchBar && (
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: '#9ca3af',
                zIndex: 1
              }}
            />
            <input
              type="text"
              placeholder="검색"
              disabled
              style={{
                width: isNarrow ? '100px' : '180px', // 좁은 화면에서 2/3로 축소
                height: '2.25rem',
                padding: '0 12px 0 36px', // 왼쪽 패딩을 늘려서 돋보기 아이콘 공간 확보
                borderRadius: '9999px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f3f4f6',
                color: '#9ca3af',
                fontSize: '14px',
                pointerEvents: 'none',
                transition: 'width 0.3s ease' // 부드러운 전환 효과
              }}
            />
          </div>
        )}
        {getHeaderIcons()}
      </div>

    </header>
  );
};

export default Header;