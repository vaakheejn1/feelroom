import React, { useState } from 'react';
import { Home, Search, Film, User, LogOut, Heart, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ai_button from '../assets/bottom_ai_button.png';
import AI_CenterModal from './AI_PCmodal';

const Sidebar2 = ({ activeTab, onTabClick }) => {
    const navigate = useNavigate();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

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
                    width: 'calc(100% - 30px)',
                    height: 'calc(100% - 65px)',
                    margin: '55px 0 0px 10px',
                    background: 'linear-gradient(to right, #780f0fff 0%,  #971313ff 20%, #b01919ff 40%, #af1717ff 60%, #be1b1bff 99%, rgba(255,255,255,0.3))',
                    borderRight: '1px solid #e5e7eb',
                    borderRadius: '24px',
                    boxShadow: '2px 0 4px rgba(255, 255, 255, 0.1)',
                    padding: '2rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    top: 0,
                    left: 0,
                    boxSizing: 'border-box',
                    // 애니메이션 효과 추가
                    transform: 'translateY(0)',
                    opacity: 1,
                    // transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    //animation: 'slideDown 0.3s ease-out'
                }}
            >
                <h3
                    style={{
                        fontSize: '1.4rem',
                        fontWeight: '600',
                        color: '#ffffffff',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        marginTop: '0rem'
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
                    <button
                        onClick={handleAIButtonClick}
                        style={{
                            width: '80px',
                            height: '80px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            padding: '0',
                            marginBottom: '-10px',
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
                        <div style={{ width: '80px', height: '80px', marginBottom: '-20px', }}>
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
                            marginBottom: '-52px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <LogOut style={{ width: '16px', height: '16px', marginRight: '0.5rem', color: '#f4d8d8ff' }} />
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* CSS 키프레임 애니메이션 */}
            <style jsx>{`
                @keyframes slideDown {
                    0% {
                        transform: translateY(-20px);
                        opacity: 0;
                        margin-top: 10px;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                        margin-top: 55px;
                    }
                }
            `}</style>

            <AI_CenterModal
                isOpen={isAIModalOpen}
                onClose={handleCloseAIModal}
            />
        </>
    );
};

export default Sidebar2;