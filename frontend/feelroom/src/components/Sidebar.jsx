import React, { useState } from 'react';
import { Home, Search, Film, User, LogOut, Heart, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ai_button from '../assets/bottom_ai_button.png';
import AI_CenterModal from './AI_PCmodal'; // 새로운 중앙 모달 컴포넌트

const Sidebar = ({ activeTab, onTabClick }) => {
  const navigate = useNavigate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false); // AI 모달 상태 추가

  const tabs = [
    { name: '홈', icon: Home, route: '/home' },
    { name: '검색', icon: Search, route: '/search' },
    { name: '현재 상영작', icon: Film, route: '/boxOffice' },
    { name: '프로필', icon: User, route: '/profile' },
    { name: '좋아요한 영화', icon: Heart, route: '/myPickMovie' },
    { name: '테스트 온보딩', icon: Cpu, route: '/onboarding' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nickname');
    localStorage.removeItem('profileImageUrl');
    navigate('/');
  };

  // 사이드바 AI 버튼 클릭 - 중앙 모달 열기
  const handleAIButtonClick = () => {
    setIsAIModalOpen(true);
  };

  const handleCloseAIModal = () => {
    setIsAIModalOpen(false);
  };

  return (
    <>
      <aside
        style={{
          width: 'calc(100% - 30px)', // 좌우 마진 20px씩 고려
          height: 'calc(100% - 20px)', // 상하 마진 20px씩 고려
          margin: '10px 0 0px 10px', // 상단 20px, 우측 0, 하단 20px, 좌측 20px
          background: 'linear-gradient(to right, #780f0fff 0%,  #971313ff 20%, #b01919ff 40%, #af1717ff 60%, #be1b1bff 99%, rgba(255,255,255,0.3))',
          borderRight: '1px solid #e5e7eb',
          borderRadius: '24px',
          boxShadow: '2px 0 4px rgba(255, 255, 255, 0.1)',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', // fixed는 부모에서 처리
          top: 0,
          left: 0,
          boxSizing: 'border-box' // 패딩을 너비에 포함
        }}
      >
        <h3
          style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            color: '#ffffffff',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            marginTop: '2.8rem'
          }}
        >
          MENU
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;

            const isActive = (() => {
              switch (tab.name) {
                case '현재 상영작':
                  return activeTab === tab.name || activeTab === tab.route || activeTab === '/boxOffice';
                case '좋아요한 영화':
                  return activeTab === tab.name || activeTab === tab.route || activeTab === '/myPickMovie';
                case '테스트 온보딩':
                  return activeTab === tab.name || activeTab === tab.route || activeTab === '/onboarding';
                default:
                  return activeTab === tab.name || activeTab === tab.route;
              }
            })();

            return (
              <button
                key={tab.name}
                onClick={() => navigate(tab.route)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: isActive ? '#fcfaedff' : 'transparent',
                  color: isActive ? '#d81d1dff' : '#ffffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Icon style={{ width: '20px', height: '20px', marginRight: '0.75rem' }} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* 하단 버튼들 */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* AI 추천 버튼 (사이드바 전용 - 중앙 모달) */}
          <button
            onClick={handleAIButtonClick}
            style={{
              width: '80px',
              height: '80px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '-20px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.filter = 'brightness(1)';
            }}
          >
            <div style={{ width: '80px', height: '80px' }}>
              <img
                src={ai_button}
                alt="AI 추천"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </button>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.3rem 0.4rem',
              borderRadius: '0.375rem',
              backgroundColor: 'transparent',
              color: '#f4d8d8ff',
              border: '2px solid #f4d8d8ff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '-42px',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', marginRight: '0.5rem', color: '#f4d8d8ff' }} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 사이드바 전용 중앙 AI 모달 */}
      <AI_CenterModal
        isOpen={isAIModalOpen}
        onClose={handleCloseAIModal}
      />
    </>
  );
};

export default Sidebar;