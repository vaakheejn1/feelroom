import React from 'react';
import { Home, Search, Film, User } from 'lucide-react';
import ai_button from '../assets/bottom_ai_button.png';

const BottomNav = ({ activeTab, onTabClick, onAIClick }) => {
  const tabs = [
    { name: '홈', icon: Home, route: '/home' },
    { name: '검색', icon: Search, route: '/search' },
    null, // 가운데 버튼 자리
    { name: '현재 상영작', icon: Film, route: '/boxOffice' },
    { name: '프로필', icon: User, route: '/profile' },
  ];

  const handleAIButtonClick = () => {
    if (onAIClick) {
      onAIClick(); // App.js에서 전달받은 AI 모달 열기 함수 호출
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#971313ff',
        borderTop: '1px solid #e5e7eb',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: '60px',
      }}
    >
      {tabs.map((tab, index) => {
        // 가운데 AI 버튼
        if (index === 2) {
          return (
            <div
              key="center-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
                position: 'relative',
              }}
            >
              <img
                src={ai_button}
                alt="AI 추천"
                onClick={handleAIButtonClick}
                style={{
                  width: '52px',
                  height: '52px',
                  cursor: 'pointer',
                  transform: 'translateY(-12px)',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-12px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(-12px) scale(1)';
                }}
              />
            </div>
          );
        }

        const Icon = tab.icon;
        const isActive = tab.name === '현재 상영작'
          ? (activeTab === tab.name || activeTab === tab.route || activeTab === '/boxOffice')
          : activeTab === tab.name;

        return (
          <button
            key={tab.name}
            onClick={() => onTabClick(tab.route)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0.25rem',
              color: isActive ? '#FFD700' : '#ffffffff',
              backgroundColor: 'transparent',
              border: 'none',
              fontWeight: isActive ? '800' : '400',
              cursor: 'pointer',
            }}
          >
            <Icon style={{ width: '20px', height: '20px' }} />
            <span style={{
              fontSize: '0.6rem',
              fontWeight: '500',
              marginTop: '2px'
            }}>
              {tab.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;